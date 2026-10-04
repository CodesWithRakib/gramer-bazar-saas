// Dev-mode launcher (TypeORM query logging ON) against the scratch DB, port 4006,
// used only to count SQL queries per request. DB_SYNCHRONIZE is forced off so the
// scratch DB is never mutated.
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const apiDir = resolve(__dirname, '../../../apps/api');
const SCRATCH_DB = process.env.SCRATCH_DB || 'gramer_bazar_p2';
const PORT = '4006';

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

const u = new URL(
  process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/gramer_bazar',
);
u.pathname = '/' + SCRATCH_DB;

const child = spawn(process.execPath, ['dist/main.js'], {
  cwd: apiDir,
  env: {
    ...process.env,
    DATABASE_URL: u.toString(),
    NODE_ENV: 'development',
    DB_SYNCHRONIZE: 'false',
    MIGRATIONS_RUN: 'false',
    PORT,
    SKIP_THROTTLE: 'true',
    THROTTLE_LIMIT: '1000000',
  },
  stdio: 'inherit',
});
child.on('exit', (code) => process.exit(code ?? 1));
process.on('SIGTERM', () => child.kill('SIGTERM'));
process.on('SIGINT', () => child.kill('SIGINT'));
