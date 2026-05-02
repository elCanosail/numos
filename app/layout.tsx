import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NumOS — Open-Source Scientific Calculator',
  description: 'Interactive web simulator of NumOS, the open-source scientific calculator OS for ESP32-S3. Natural Display, CAS, Graphing, and more.',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}