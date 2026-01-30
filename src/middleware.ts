import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Simply pass through all requests - auth is handled client-side
  // This avoids issues with server-side Supabase calls in certain network environments
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
