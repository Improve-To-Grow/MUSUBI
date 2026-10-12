/**
 * Steering files that `musubi init` writes into a project (ITG fork): the shared steering
 * templates, the ITG delivery policies and the constitution rules.
 *
 * @module src/cli/init-steering
 */

const fs = require('fs-extra');
const path = require('path');

const SHARED_TEMPLATE_DIR = path.join(__dirname, '..', 'templates', 'shared');

/** Steering templates copied to steering/ with their placeholders filled in */
const STEERING_TEMPLATES = ['structure.md', 'tech.md', 'product.md'];

/** Constitution rules copied to steering/rules/ */
const CONSTITUTION_RULES = [
  'constitution.md',
  'constitution-levels.yml',
  'ears-format.md',
  'workflow.md',
];

/** ITG delivery policies, relative to steering/ (ITG Software Delivery Playbook) */
const ITG_POLICY_DIR = path.join('rules', 'itg');

/**
 * Fill the placeholders that init knows; every other gap in a template is plain text
 * @param {string} content - Template content
 * @param {{projectName: string, description: string, date: string}} values - Placeholder values
 * @returns {string} Content with {{PROJECT_NAME}}, {{DESCRIPTION}} and {{DATE}} replaced
 */
function fillPlaceholders(content, { projectName, description, date }) {
  return content
    .replace(/\{\{PROJECT_NAME\}\}/g, () => projectName)
    .replace(/\{\{DESCRIPTION\}\}/g, () => description)
    .replace(/\{\{DATE\}\}/g, () => date);
}

/**
 * Copy the ITG delivery policies to steering/rules/itg/
 * @param {string} projectRoot - Project root
 * @returns {Promise<void>}
 */
async function copyItgPolicies(projectRoot = process.cwd()) {
  await fs.copy(
    path.join(SHARED_TEMPLATE_DIR, 'steering', ITG_POLICY_DIR),
    path.join(projectRoot, 'steering', ITG_POLICY_DIR)
  );
}

/**
 * Write structure.md, tech.md and product.md from the shared templates, and the ITG policies
 * @param {{projectName: string, description: string}} answers - Init answers
 * @param {string} projectRoot - Project root
 * @returns {Promise<void>}
 */
async function writeSteeringTemplates(answers, projectRoot = process.cwd()) {
  const values = {
    projectName: answers.projectName,
    description: answers.description,
    date: new Date().toISOString().split('T')[0],
  };
  const steeringDir = path.join(projectRoot, 'steering');
  await fs.ensureDir(steeringDir);
  for (const file of STEERING_TEMPLATES) {
    const template = await fs.readFile(path.join(SHARED_TEMPLATE_DIR, 'steering', file), 'utf8');
    await fs.writeFile(path.join(steeringDir, file), fillPlaceholders(template, values));
  }
  await copyItgPolicies(projectRoot);
}

/**
 * Copy the constitution, its levels, the EARS format guide and the workflow guide to
 * steering/rules/
 * @param {string} projectRoot - Project root
 * @returns {Promise<void>}
 */
async function copyConstitutionRules(projectRoot = process.cwd()) {
  for (const file of CONSTITUTION_RULES) {
    await fs.copy(
      path.join(SHARED_TEMPLATE_DIR, 'constitution', file),
      path.join(projectRoot, 'steering', 'rules', file)
    );
  }
}

module.exports = {
  STEERING_TEMPLATES,
  CONSTITUTION_RULES,
  ITG_POLICY_DIR,
  fillPlaceholders,
  copyItgPolicies,
  writeSteeringTemplates,
  copyConstitutionRules,
};
