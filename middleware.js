import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/mockTests(.*)',
  '/takeTest(.*)',
  '/quickNotes(.*)',
  '/studyPlanner(.*)',
  '/profile(.*)'
])

const isPublicRoute = createRouteMatcher([
  '/',
  '/login(.*)',
  '/sign-up(.*)',
  '/sign-in(.*)'
])

export default clerkMiddleware((auth, req) => {
  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Middleware - Path:', req.nextUrl.pathname);
    console.log('🔍 Middleware - Is Protected:', isProtectedRoute(req));
    console.log('🔍 Middleware - Is Public:', isPublicRoute(req));
  }
  
  if (isProtectedRoute(req)) {
    // Redirect to login if not authenticated
    return auth().protect({ redirectUrl: '/login' });
  }
})

export const config = {
 matcher: [
   // Skip Next.js internals and all static files, unless found in search params
   '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
   // Always run for API routes
   '/(api|trpc)(.*)',
 ],
}
