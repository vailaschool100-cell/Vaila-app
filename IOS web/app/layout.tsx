import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Vaila Teaching — Speech & Phonics Practice',
  description: 'Pronunciation practice for children — English alphabets, numbers, and Urdu, with instant AI feedback.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
