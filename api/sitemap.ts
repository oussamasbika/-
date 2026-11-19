interface VercelReq {
  headers?: Record<string, string | string[] | undefined>;
}

interface VercelRes {
  setHeader: (name: string, value: string) => void;
  send: (body: string) => void;
}

export default function handler(req: VercelReq, res: VercelRes) {
  const protoHeader = req.headers?.['x-forwarded-proto'];
  const hostHeader = req.headers?.['x-forwarded-host'] || req.headers?.host;
  const proto = typeof protoHeader === 'string' ? protoHeader.split(',')[0].trim() : 'https';
  const host = typeof hostHeader === 'string' ? hostHeader.split(',')[0].trim() : '';
  const baseUrl = host ? `${proto}://${host}` : '';
  const today = new Date().toISOString().split('T')[0];

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`);
}
