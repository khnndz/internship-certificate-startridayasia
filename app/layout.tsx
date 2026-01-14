import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Internship Certificate - Start Friday Asia',
  description: 'Start Friday Asia internship certificate portal',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
