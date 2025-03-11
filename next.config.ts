import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    NEXT_PUBLIC_SUPABASE_URL: 'https://izoqlqicxbbjapymrkkm.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6b3FscWljeGJiamFweW1ya2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE2MzcwNzIsImV4cCI6MjA1NzIxMzA3Mn0.kK6VuFuTr3AYDGWznQ-Hy88Db9aNcp9vYOVBY7y1XTM'
  }
}

export default nextConfig
