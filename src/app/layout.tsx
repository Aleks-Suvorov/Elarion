import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'USRE — Ultimate Sandbox RPG Engine',
  description:
    'A persistent local-first sandbox RPG engine with deterministic dice, living world simulation, and transparent roll logs.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
