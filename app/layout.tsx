import type { Metadata } from 'next'
import './globals.css'
import Script from 'next/script'

export const metadata: Metadata = {
  title: {
    default: 'ARES FUTBOL LEÓN | Radar de Sedes Deportivas',
    template: '%s | ARES FUTBOL LEÓN'
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
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
  verification: {
    google: 'XXXXXXXXXXXXXXXXXXXX', // ← Reemplaza con tu código de verificación de Search Console
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
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-3NCLPW28LM"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-3NCLPW28LM');
          `}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  )
}