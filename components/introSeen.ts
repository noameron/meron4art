// sessionStorage key marking that the intro overlay already played in this
// browser session. Shared between the client overlay (which sets it) and the
// server layout's pre-hydration script (which reads it), so it lives in a
// plain module rather than the 'use client' component file.
export const INTRO_SEEN_KEY = 'introSeen';
