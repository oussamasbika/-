interface VercelReq {
  query?: Record<string, string | string[] | undefined>;
}

interface VercelRes {
  status: (code: number) => VercelRes;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
  send: (body: Buffer | string) => void;
}

export default async function handler(req: VercelReq, res: VercelRes) {
  const queryText = req.query?.text;
  const rawText = typeof queryText === 'string' ? queryText.trim() : '';
  if (!rawText) {
    res.status(400).json({ error: 'Missing text parameter' });
    return;
  }

  const text = rawText.slice(0, 220);

  try {
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

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, s-maxage=86400, max-age=86400');
    res.send(buffer);
  } catch (error) {
    console.error('TTS proxy failed:', error);
    res.status(502).json({ error: 'TTS fetch failed' });
  }
}
