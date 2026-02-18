import { NextResponse } from 'next/server'

// protect certain routes server-side by checking for Supabase access token cookie
export async function middleware(req) {
  const token = req.cookies.get('sb-access-token')?.value
  const url = req.nextUrl.clone()

  // if no token and trying to access protected area, redirect to login
  if (!token && url.pathname.startsWith('/dashboard')) {
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
}

export const config = {
  // protect dashboard and profile pages server-side by checking for access token.
  matcher: ['/dashboard/:path*','/profile/:path*'],
}
