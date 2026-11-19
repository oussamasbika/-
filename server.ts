import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const ttsCache = new Map<string, Buffer>();
const MAX_CACHE_ENTRIES = 300;

async function startServer() {
  const app = express();

  // Dynamic sitemap for Google Search Console
  app.get('/sitemap.xml', (req, res) => {
    const rawProto = typeof req.headers['x-forwarded-proto'] === 'string'
      ? req.headers['x-forwarded-proto'].split(',')[0].trim()
      : req.protocol;
    const rawHost = typeof req.headers['x-forwarded-host'] === 'string'
      ? req.headers['x-forwarded-host'].split(',')[0].trim()
      : req.get('host');
    const safeBaseUrl = rawHost ? `${rawProto}://${rawHost}` : '';
    const today = new Date().toISOString().split('T')[0];

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${safeBaseUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`);
  });

  // Child-friendly Arabic TTS audio proxy (consistent across Desktop & Mobile)
  app.get('/api/tts', async (req, res) => {
    const rawText = typeof req.query.text === 'string' ? req.query.text.trim() : '';
    if (!rawText) {
      res.status(400).json({ error: 'Missing text parameter' });
      return;
    }

    const text = rawText.slice(0, 220);

    try {
      const cached = ttsCache.get(text);
      if (cached) {
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.send(cached);
        return;
      }

      const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=ar&client=tw-ob`;
      const upstream = await fetch(ttsUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
          'Referer': 'https://translate.google.com/',
        },
      });

      if (!upstream.ok) {
        res.status(502).json({ error: `TTS upstream error: ${upstream.status}` });
        return;
      }

      const arrayBuffer = await upstream.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      if (buffer.length === 0) {
        res.status(502).json({ error: 'Empty TTS response' });
        return;
      }

      if (ttsCache.size >= MAX_CACHE_ENTRIES) {
        const oldestKey = ttsCache.keys().next().value;
        if (oldestKey !== undefined) {
          ttsCache.delete(oldestKey);
        }
      }
      ttsCache.set(text, buffer);

      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.send(buffer);
    } catch (error) {
      console.error('TTS proxy failed:', error);
      res.status(502).json({ error: 'TTS fetch failed' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
