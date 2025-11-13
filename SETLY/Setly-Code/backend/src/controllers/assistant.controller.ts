import { Request, Response } from 'express';
import OpenAI from 'openai';

const openaiKey = process.env.OPENAI_API_KEY || '';
let openai: OpenAI | null = null;
if (openaiKey) {
  openai = new OpenAI({ apiKey: openaiKey });
}

export async function chatHandler(req: Request, res: Response) {
  try {
    const { messages = [], max_tokens = 500, temperature = 0.7 } = req.body || {};

    if (!openai) {
      // Safe mock fallback if key missing
      return res.json({
        id: 'mock-1',
        object: 'chat.completion',
        choices: [
          {
            index: 0,
            finish_reason: 'stop',
            message: { role: 'assistant', content: 'I am a mock Setly Assistant response. Configure OPENAI_API_KEY on the server to enable real answers.' }
          }
        ]
      });
    }

    const result = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages,
      max_tokens,
      temperature
    });

    return res.json(result);
  } catch (err: any) {
    console.error('Assistant error:', err);
    return res.status(500).json({ error: err?.message || 'assistant_failed' });
  }
}

export async function healthHandler(_req: Request, res: Response) {
  return res.json({ ok: true, model: process.env.OPENAI_MODEL || 'gpt-4o-mini', hasKey: !!openai });
}

export async function chatStreamHandler(req: Request, res: Response) {
  try {
    const { messages = [], max_tokens = 500, temperature = 0.7 } = req.body || {};

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('X-Accel-Buffering', 'no');

    if (!openai) {
      // Stream a short mock response when key missing
      const mock = 'I am a mock Setly Assistant streaming response. Configure OPENAI_API_KEY to enable real answers.';
      res.write(mock);
      return res.end();
    }

    const stream = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages,
      max_tokens,
      temperature,
      stream: true
    });

    // openai v4 returns an async iterable of chunks
    for await (const chunk of stream) {
      const delta = (chunk as any)?.choices?.[0]?.delta?.content ?? '';
      if (delta) {
        res.write(delta);
      }
    }
    res.end();
  } catch (err: any) {
    console.error('Assistant stream error:', err);
    // Try to send an error inline if headers sent
    if (!res.headersSent) {
      res.status(500).json({ error: err?.message || 'assistant_stream_failed' });
    } else {
      try { res.write('\n[stream_error]\n'); res.end(); } catch {}
    }
  }
}
