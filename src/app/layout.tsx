import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SGIP — Student Growth Intelligence Platform',
  description: 'AI-Powered Learning Intelligence and Placement-Readiness Platform for Engineering Colleges.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        {children}
      </body>
    </html>
  );
}
