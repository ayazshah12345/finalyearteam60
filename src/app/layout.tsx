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
    <html lang="en">
      <body className="antialiased min-h-screen bg-[#f8f9fe] text-slate-900 font-sans selection:bg-amber-400 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
