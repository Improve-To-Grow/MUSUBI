// When a PR changes firestore.rules or storage.rules, evaluate the branch's rules with the Firebase
// Security Rules API test method (projects.test) against the fixed cases of ITG Software Delivery
// Playbook §11.6, with a mocked request.auth: nothing is deployed and no emulator runs (§7.3, C.3).
// Needs BASE_REF, FIREBASE_PROJECT_ID, FIREBASE_STORAGE_BUCKET and FIREBASE_SERVICE_ACCOUNT (staging).
// The paths, content types and size limit of the cases come from scripts/checks/rules-cases.json.
// (new) The Security Rules API call has not run in an ITG project yet (playbook §2.1).
import crypto from 'node:crypto';
import { changedFiles, finish, printHelp, read } from './lib.mjs';

if (process.argv.includes('--help')) printHelp(import.meta.url);

const RULES_FILES = ['firestore.rules', 'storage.rules'];

function firestoreCases(cases) {
  const path = `/databases/(default)/documents/${cases.firestore.documentPath}`;
  const auth = { uid: 'ci-user', token: { tenantId: cases.tenantId } };
  return [
    {
      name: 'client reads its own tenant',
      expectation: 'DENY',
      request: { auth, path, method: 'get' },
    },
    {
      name: 'client writes its own tenant',
      expectation: 'DENY',
      request: { auth, path, method: 'create', resource: { data: { tenantId: cases.tenantId } } },
    },
  ];
}

function storageCases(cases, bucket) {
  const objectPath = tenantId =>
    `/b/${bucket}/o/${cases.storage.uploadPath.replace('{tenantId}', tenantId)}`;
  const auth = { uid: 'ci-user', token: { tenantId: cases.tenantId } };
  const upload = (tenantId, contentType, size) => ({
    auth,
    path: objectPath(tenantId),
    method: 'create',
    resource: { name: objectPath(tenantId), contentType, size },
  });
  const { allowedContentType, deniedContentType, maxBytes } = cases.storage;
  return [
    {
      name: 'upload into the own tenant path',
      expectation: 'ALLOW',
      request: upload(cases.tenantId, allowedContentType, 1024),
    },
    {
      name: "upload into another tenant's path",
      expectation: 'DENY',
      request: upload(cases.otherTenantId, allowedContentType, 1024),
    },
    {
      name: 'upload with a content type outside the allowlist',
      expectation: 'DENY',
      request: upload(cases.tenantId, deniedContentType, 1024),
    },
    {
      name: 'upload one byte over the size limit',
      expectation: 'DENY',
      request: upload(cases.tenantId, allowedContentType, maxBytes + 1),
    },
    {
      name: 'client read of an own-tenant object',
      expectation: 'DENY',
      request: { auth, path: objectPath(cases.tenantId), method: 'get' },
    },
  ];
}

async function accessToken(serviceAccount) {
  const now = Math.floor(Date.now() / 1000);
  const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');
  const unsigned = `${encode({ alg: 'RS256', typ: 'JWT' })}.${encode({
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 600,
  })}`;
  const signature = crypto
    .sign('RSA-SHA256', Buffer.from(unsigned), serviceAccount.private_key)
    .toString('base64url');
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${unsigned}.${signature}`,
    }),
  });
  if (!response.ok)
    throw new Error(`token request failed: ${response.status} ${await response.text()}`);
  return (await response.json()).access_token;
}

async function testRules(file, testCases, token) {
  const response = await fetch(
    `https://firebaserules.googleapis.com/v1/projects/${process.env.FIREBASE_PROJECT_ID}:test`,
    {
      method: 'POST',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        source: { files: [{ name: file, content: read(file) }] },
        testSuite: {
          testCases: testCases.map(({ expectation, request }) => ({ expectation, request })),
        },
      }),
    }
  );
  if (!response.ok)
    return [`${file}: Security Rules API error ${response.status} ${await response.text()}`];
  const result = await response.json();
  const problems = (result.issues || []).map(
    issue => `${file}: ${issue.severity} ${issue.description}`
  );
  (result.testResults || []).forEach((test, i) => {
    if (test.state !== 'SUCCESS') {
      problems.push(
        `${file}: expected ${testCases[i].expectation} for "${testCases[i].name}" ${(test.debugMessages || []).join(' ')}`
      );
    }
  });
  return problems;
}

const changed = changedFiles().filter(file => RULES_FILES.includes(file));
if (changed.length === 0) {
  console.log('check-rules: no rules file changed, skipped');
} else {
  const missing = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_SERVICE_ACCOUNT',
    'FIREBASE_STORAGE_BUCKET',
  ].filter(name => !process.env[name]);
  if (missing.length > 0) finish('check-rules', [`missing configuration: ${missing.join(', ')}`]);
  const cases = JSON.parse(read('scripts/checks/rules-cases.json'));
  const token = await accessToken(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT));
  const problems = [];
  for (const file of changed) {
    const testCases =
      file === 'firestore.rules'
        ? firestoreCases(cases)
        : storageCases(cases, process.env.FIREBASE_STORAGE_BUCKET);
    problems.push(...(await testRules(file, testCases, token)));
  }
  finish('check-rules', problems);
}
