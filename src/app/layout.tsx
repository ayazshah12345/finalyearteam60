import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{const t=localStorage.getItem('vsb_theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}else{document.documentElement.classList.remove('dark')}}catch(e){}`,
          }}
        />
      </head>
      <body className="antialiased min-h-screen bg-[#f8f9fe] dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 font-sans selection:bg-amber-400 selection:text-slate-950 transition-colors duration-200">
        {children}
      </body>
    </html>
  );
}
