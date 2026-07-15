import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getInitialState } from '../models/seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

async function ensureDataFile() {
  await mkdir(DATA_DIR, { recursive: true });

  try {
    await readFile(DATA_FILE, 'utf8');
  } catch {
    await writeFile(DATA_FILE, JSON.stringify(getInitialState(), null, 2));
  }
}

export async function readDb() {
  await ensureDataFile();
  const raw = await readFile(DATA_FILE, 'utf8');
  return JSON.parse(raw);
}

export async function writeDb(nextState) {
  await ensureDataFile();
  await writeFile(DATA_FILE, JSON.stringify(nextState, null, 2));
  return nextState;
}

export async function updateDb(updater) {
  const state = await readDb();
  const nextState = await updater(state);
  return writeDb(nextState);
}
