import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react()
  ],
  server: {
    hmr: {
      clientPort: 5173,
    },
    headers: {
      // Content Security Policy
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://cdn.jsdelivr.net https://unpkg.com",
        "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://unpkg.com",
        "img-src 'self' data: http: https: blob:",
        "font-src 'self' https://cdn.jsdelivr.net https://unpkg.com",
        "connect-src 'self' https://trendorabay-content-management-system.onrender.com http://localhost:5002 ws://localhost:5002 ws://localhost:5173 wss://trendorabay-content-management-system.onrender.com ws://127.0.0.1:5173",
        "frame-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'self'",
      ].join('; '),
      
      // Prevent MIME type sniffing
      'X-Content-Type-Options': 'nosniff',
      
      // Prevent clickjacking
      'X-Frame-Options': 'DENY',
      
      // Enable XSS protection
      'X-XSS-Protection': '1; mode=block',
      
      // Control referrer information
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      
      // Permissions Policy
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
    }
  },
  preview: {
    headers: {
      // Content Security Policy
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://cdn.jsdelivr.net https://unpkg.com",
        "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://unpkg.com",
        "img-src 'self' data: http: https: blob:",
        "font-src 'self' https://cdn.jsdelivr.net https://unpkg.com",
        "connect-src 'self' https://trendorabay-content-management-system.onrender.com http://localhost:5002 ws://localhost:5002 ws://localhost:5173 wss://trendorabay-content-management-system.onrender.com",
        "frame-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'self'",
      ].join('; '),
      
      // Prevent MIME type sniffing
      'X-Content-Type-Options': 'nosniff',
      
      // Prevent clickjacking
      'X-Frame-Options': 'DENY',
      
      // Enable XSS protection
      'X-XSS-Protection': '1; mode=block',
      
      // Control referrer information
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      
      // Permissions Policy
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
      
      // Strict Transport Security (only in production)
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
    }
  }
})
