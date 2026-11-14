import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  context: { params: { path: string[] } }
) {
  const backendBase = process.env.BACKEND_INTERNAL_URL || 'http://127.0.0.1:8000';
  const joinedPath = (context.params.path || []).map(encodeURIComponent).join('/');
  const targetUrl = `${backendBase}/uploads/${joinedPath}`;

  try {
    const upstream = await fetch(targetUrl, { cache: 'no-store' });
    if (!upstream.ok) {
      return new NextResponse('Image not found', { status: upstream.status });
    }
    const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
    const body = await upstream.arrayBuffer();
    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return new NextResponse('Failed to load image', { status: 502 });
  }
}
