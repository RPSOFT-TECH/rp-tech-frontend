import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { Providers } from '@/components/providers';

const fontSans = localFont({
  src: [
    { path: './fonts/BeVietnamPro-Light.woff2', weight: '300', style: 'normal' },
    { path: './fonts/BeVietnamPro-Regular.woff2', weight: '400', style: 'normal' },
    { path: './fonts/BeVietnamPro-Medium.woff2', weight: '500', style: 'normal' },
    { path: './fonts/BeVietnamPro-SemiBold.woff2', weight: '600', style: 'normal' },
    { path: './fonts/BeVietnamPro-Bold.woff2', weight: '700', style: 'normal' },
    { path: './fonts/BeVietnamPro-ExtraBold.woff2', weight: '800', style: 'normal' },
  ],
  variable: '--font-sans',
  display: 'swap',
  declarations: [{ prop: 'font-family', value: "'Be Vietnam Pro'" }],
});

export const metadata: Metadata = {
  title: 'RP-TECH',
  description: 'Sistema de órdenes de servicio técnico',
  applicationName: 'RP-TECH',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'RP-TECH',
    statusBarStyle: 'default',
  },
  other: {
    'apple-mobile-web-app-capable': 'yes',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
};

export const viewport: Viewport = {
  themeColor: 'oklch(0.6723 0.1606 244.9955)',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${fontSans.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
