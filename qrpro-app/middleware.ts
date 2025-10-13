import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Rediriger /document/[id] vers /api/document/[id]
  if (pathname.startsWith('/document/') && pathname !== '/document') {
    const documentId = pathname.split('/document/')[1];
    if (documentId) {
      const apiUrl = new URL(`/api/document/${documentId}`, request.url);
      return NextResponse.redirect(apiUrl);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/document/:path*',
};
