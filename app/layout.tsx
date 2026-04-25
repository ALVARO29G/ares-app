import type { Metadata } from 'next'
import './globals.css'
import Script from 'next/script'
import CookieBanner from './components/CookieBanner'

export const metadata: Metadata = {

  metadataBase: new URL('https://canchasleon.com'),

  title: {
    default: 'ARES FUTBOL LEÓN | Radar de Sedes Deportivas',
    template: '%s | ARES FUTBOL LEÓN'
  },

  alternates: {
    canonical: 'https://canchasleon.com',
  },
  
  description: 'Encuentra las mejores canchas de fútbol en León, Guanajuato. Conecta con sedes, consulta torneos, tablas de posiciones y goleo en tiempo real.',
  keywords: ['fútbol', 'León', 'Guanajuato', 'canchas', 'sedes', 'torneos', 'futbol rápido', 'radar deportivo'],
  authors: [{ name: 'ARES FUTBOL LEÓN' }],
  creator: 'ARES FUTBOL LEÓN',
  publisher: 'ARES FUTBOL LEÓN',
  openGraph: {
    title: 'ARES FUTBOL LEÓN | Radar de Sedes Deportivas',
    description: 'Encuentra las mejores canchas de fútbol en León, Gto. Torneos, tablas y goleo en tiempo real.',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://canchasleon.com',
    siteName: 'ARES FUTBOL LEÓN',
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://canchasleon.com'}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'ARES FUTBOL LEÓN - Radar de Sedes',
      },
    ],
    locale: 'es_MX',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ARES FUTBOL LEÓN | Radar de Sedes',
    description: 'Las mejores canchas de fútbol en León, Gto.',
    images: [`${process.env.NEXT_PUBLIC_SITE_URL || 'https://canchasleon.com'}/og-image.jpg`],
    creator: '@aresfutbolleon',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
  { url: '/favicon.svg', type: 'image/svg+xml' },
  { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
  { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
  { url: '/favicon.ico', sizes: '64x64' },
],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  verification: {
    google: 'XXXXXXXXXXXXXXXXXXXX',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        {/* ✅ Google Analytics SOLO con consentimiento */}
        <Script id="google-analytics-consent" strategy="afterInteractive">
          {`
            const consent = localStorage.getItem('ares_cookie_consent');

            if (consent === 'accepted') {
              const script = document.createElement('script');
              script.src = 'https://www.googletagmanager.com/gtag/js?id=G-3NCLPW28LM';
              script.async = true;
              document.head.appendChild(script);

              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;

              gtag('js', new Date());
              gtag('config', 'G-3NCLPW28LM');
            }
          `}
        </Script>
      </head>

      <body>
        {children}

        {/* ✅ Cookie Banner correctamente posicionado */}
        <CookieBanner />
      </body>
    </html>
  )
}