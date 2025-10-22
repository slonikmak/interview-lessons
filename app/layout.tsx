import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  title: 'Interview Lessons',
  description: 'Interactive coding lessons and tutorials',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/*
          In development, some browser extensions (for example Grammarly) inject
          attributes into the DOM (e.g. data-gr-ext-installed) which causes React
          to emit hydration-mismatch warnings. Those warnings are harmless in
          development but noisy. We add a beforeInteractive script to filter out
          this specific console error during development only.
        */}
        {process.env.NODE_ENV === 'development' && (
          <Script id="suppress-hydration-warning" strategy="beforeInteractive">
            {`(function(){
              const orig = console.error;
              console.error = function(){
                try {
                  if (arguments && arguments[0] && typeof arguments[0] === 'string' && arguments[0].includes('A tree hydrated but some attributes of the server rendered HTML')) {
                    return;
                  }
                } catch (e) {
                  // ignore
                }
                return orig.apply(console, arguments);
              }
            })();`}
          </Script>
        )}
      </head>

      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
