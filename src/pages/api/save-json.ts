import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

type SaveJsonRequest = {
  filePath: string;
  content: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { filePath, content } = req.body as SaveJsonRequest;

  if (!filePath || !content) {
    return res.status(400).json({ error: 'filePath and content are required' });
  }

  try {
    const dir = path.dirname(filePath);
    await fs.promises.mkdir(dir, { recursive: true });
    await fs.promises.writeFile(filePath, content, { encoding: 'utf8' });
    return res.status(200).json({ ok: true, savedTo: filePath });
  } catch (err: any) {
    console.error('Failed to save JSON:', err);
    return res.status(500).json({ error: 'Failed to save JSON', details: String(err?.message || err) });
  }
}