// Run TypeORM CLI migration commands against the scratch database.
// Usage: node performance/phase2/tools/typeorm-scratch.mjs <migration:show|migration:run|migration:revert>
import { createRequire } from 'module';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const apiDir = resolve(__dirname, '../../../apps/api');
const SCRATCH_DB = process.env.SCRATCH_DB || 'gramer_bazar_p2';

function loadEnv(path) {
  try {
    for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      let val = m[2].trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
        val = val.slice(1, -1);
      if (process.env[m[1]] === undefined) process.env[m[1]] = val;
    }
  } catch {
    /* ignore */
  }
}
loadEnv(resolve(apiDir, '.env'));

const DEV_URL =
  process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/gramer_bazar';
const u = new URL(DEV_URL);
u.pathname = '/' + SCRATCH_DB;
const scratchUrl = u.toString();

const cmd = process.argv[2] || 'migration:show';
const r = spawnSync(
  process.execPath,
  [resolve(apiDir, 'node_modules/typeorm/cli.js'), cmd, '-d', resolve(apiDir, 'dist/config/data-source.js')],
  {
    cwd: apiDir,
    encoding: 'utf8',
    env: {
      ...process.env,
      DATABASE_URL: scratchUrl,
      NODE_ENV: 'production',
      DB_SYNCHRONIZE: 'false',
    },
  },
);
process.stdout.write(r.stdout || '');
process.stderr.write(r.stderr || '');
process.exit(r.status ?? 1);
