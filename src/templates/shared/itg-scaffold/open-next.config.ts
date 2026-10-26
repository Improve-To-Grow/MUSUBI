import { defineCloudflareConfig } from '@opennextjs/cloudflare';

// OpenNext defaults: no R2 or KV cache (ITG stores files in Firebase Storage; Project Setup
// Guide §10.2). `opennextjs-cloudflare build` fails without this file.
export default defineCloudflareConfig({});
