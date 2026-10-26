import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {};

// Gives `next dev` the Worker bindings of wrangler.jsonc (log queue, rate limits); a no-op
// outside `next dev` (Project Setup Guide §10.2)
initOpenNextCloudflareForDev();

export default nextConfig;
