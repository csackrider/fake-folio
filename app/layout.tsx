import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import { DataProvider } from '@/components/data-provider'
import { AuthProvider } from '@/components/auth-provider'
import { AppShell } from '@/components/app-shell'
import { APP_TITLE } from '@/lib/branding'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: APP_TITLE,
  description: 'Track recurring charges, budgets, and spending with a calm, minimal interface.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'FakeFolio',
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var r=localStorage.getItem("fakefolio-settings")||localStorage.getItem("tallyr-settings")||localStorage.getItem("calm-ledger-settings")||"{}";var s=JSON.parse(r);var t=s.theme||"light";if(t==="system"){t=window.matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light"}if(t==="dark")document.documentElement.classList.add("dark")}catch(e){}})()`,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <AuthProvider>
          <DataProvider>
            <AppShell>
              {children}
            </AppShell>
          </DataProvider>
        </AuthProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
