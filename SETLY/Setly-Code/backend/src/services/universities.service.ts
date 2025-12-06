import fs from 'fs';
import path from 'path';
import { AWS_ENABLED, AWS_CONFIG, s3Client } from '../config/aws';
import { GetObjectCommand } from '@aws-sdk/client-s3';

export interface UniversityRecord {
  id: string;
  name: string;
  city?: string;
  state?: string;
  country?: string;
  domains?: string[];
  webPages?: string[];
}

type CachePayload = { list: UniversityRecord[]; fetchedAt: number };

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h
let cache: CachePayload | null = null;

async function streamToString(stream: any): Promise<string> {
  const chunks: any[] = [];
  return await new Promise((resolve, reject) => {
    stream.on('data', (chunk: any) => chunks.push(Buffer.from(chunk)));
    stream.on('error', (err: any) => reject(err));
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
  });
}

async function loadFromS3(): Promise<UniversityRecord[] | null> {
  if (!AWS_ENABLED || !s3Client) return null;
  const key = process.env.UNIVERSITIES_S3_KEY || 'universities/us_in_universities.json';
  try {
    const res: any = await s3Client.send(new GetObjectCommand({
      Bucket: AWS_CONFIG.bucketName,
      Key: key
    }));
    const body = await streamToString(res.Body);
    const parsed = JSON.parse(body);
    return Array.isArray(parsed) ? parsed : null;
  } catch (e) {
    console.warn('[universities.service] S3 load failed, falling back to local', (e as any)?.message || e);
    return null;
  }
}

function loadFromLocal(): UniversityRecord[] | null {
  try {
    const p = path.join(process.cwd(), 'SETLY', 'Setly-Code', 'backend', 'data', 'us_in_universities.json');
    const raw = fs.readFileSync(p, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export const UniversitiesService = {
  async getAll(): Promise<UniversityRecord[]> {
    const now = Date.now();
    if (cache && (now - cache.fetchedAt) < CACHE_TTL_MS) return cache.list;
    let list = await loadFromS3();
    if (!list) list = loadFromLocal() || [];
    cache = { list, fetchedAt: now };
    return list;
  },

  async search(q: string, limit = 15): Promise<UniversityRecord[]> {
    const list = await this.getAll();
    const query = (q || '').trim().toLowerCase();
    if (!query) return [];
    return this.searchInList(list, query, limit);
  },

  searchInList(list: UniversityRecord[], q: string, limit = 15): UniversityRecord[] {
    const query = (q || '').trim().toLowerCase();
    if (!query) return list.slice(0, limit);
    return list
      .map(u => ({ u, s: score(query, u) }))
      .filter(x => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, limit)
      .map(x => x.u);
  }
};

function score(q: string, u: UniversityRecord): number {
  const norm = (s: string) => (s || '').toLowerCase().replace(/[^a-z0-9\s]+/g, '');
  const n = norm(u.name);
  const qq = norm(q);
  if (!n || !qq) return 0;
  if (n.startsWith(qq)) return 300 - Math.abs(n.length - qq.length);
  if (n.includes(qq)) return 200 - n.indexOf(qq);
  let qi = 0;
  for (let i = 0; i < n.length && qi < qq.length; i++) {
    if (n[i] === qq[qi]) qi++;
  }
  return qi === qq.length ? 100 - (n.length - qq.length) : 0;
}
