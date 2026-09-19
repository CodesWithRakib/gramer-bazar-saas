import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseUrl = 'https://raw.githubusercontent.com/nuhil/bangladesh-geocode/master';

const files = [
  { dir: 'divisions', file: 'divisions.json' },
  { dir: 'districts', file: 'districts.json' },
  { dir: 'upazilas', file: 'upazilas.json' },
  { dir: 'unions', file: 'unions.json' }
];

async function download() {
  for (const { dir, file } of files) {
    console.log(`Downloading ${file}...`);
    const res = await fetch(`${baseUrl}/${dir}/${file}`);
    const data = await res.json();
    fs.writeFileSync(path.join(__dirname, 'data', file), JSON.stringify(data, null, 2));
    console.log(`Saved ${file}`);
  }
}

download().catch(console.error);
