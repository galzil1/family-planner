import type { Metadata, Viewport } from 'next';
import { Heebo } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const heebo = Heebo({
  variable: '--font-sans',
  subsets: ['hebrew', 'latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'לוח משימות משפחתי - תכנון שבועי פשוט',
  description:
    'תכננו את המשימות השבועיות שלכם יחד עם המשפחה. פשוט, אינטואיטיבי ונגיש מכל מכשיר.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'לוח משפחתי',
  },
  openGraph: {
    title: 'לוח משימות משפחתי',
    description: 'תכנון משימות שבועי פשוט למשפחות',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#7c3aed',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className="dark">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon.svg" />
        <link rel="icon" type="image/svg+xml" href="/icons/icon.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body
        className={`${heebo.variable} font-sans antialiased`}
      >
        {children}
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: '#1e293b',
              color: '#f1f5f9',
              border: '1px solid #334155',
            },
          }}
        />
      </body>
    </html>
  );
}
