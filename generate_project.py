import os

BASE = '/data/car-rental'

def w(path, content):
    full = os.path.join(BASE, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'  wrote: {path}')

# ── next.config.js ──────────────────────────────────────────────────────────
w('next.config.js', r"""
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { remotePatterns: [{ protocol: 'https', hostname: '**' }] },
  experimental: { serverActions: { allowedOrigins: ['*'] } },
};
module.exports = nextConfig;
""".strip())

# ── tailwind.config.js ──────────────────────────────────────────────────────
w('tailwind.config.js', r"""
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#2563eb', foreground: '#ffffff', 50: '#eff6ff', 100: '#dbeafe', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8' },
        success: { DEFAULT: '#16a34a', foreground: '#ffffff' },
        warning: { DEFAULT: '#d97706', foreground: '#ffffff' },
        danger:  { DEFAULT: '#dc2626', foreground: '#ffffff' },
      },
      fontFamily: { sans: ['var(--font-sans)', 'system-ui', 'sans-serif'] },
      borderRadius: { lg: '0.75rem', md: '0.5rem', sm: '0.375rem' },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
""".strip())

# ── tsconfig.json ───────────────────────────────────────────────────────────
w('tsconfig.json', r"""
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{"name": "next"}],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
""".strip())

# ── postcss.config.js ────────────────────────────────────────────────────────
w('postcss.config.js', "module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } };")

# ── .env.example ────────────────────────────────────────────────────────────
w('.env.example', r"""
# SQLite (development). Change to postgresql://... for production.
DATABASE_URL="file:./dev.db"

# Generate with: openssl rand -base64 32
AUTH_SECRET="replace-with-random-secret-at-least-32-chars"

# Public URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Business WhatsApp number (digits only, with country code)
BUSINESS_WHATSAPP_NUMBER="9647701234567"

# Default admin (used only during first seed)
SEED_ADMIN_EMAIL="admin@carrental.com"
SEED_ADMIN_PASSWORD="Admin@123"

# App timezone
TZ="Asia/Baghdad"
""".strip())

# ── jest.config.ts ───────────────────────────────────────────────────────────
w('jest.config.ts', r"""
import type { Config } from 'jest';
const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
  testPathPattern: '__tests__',
};
export default config;
""".strip())

print('Config files done.')
print('Now writing source files...')
