import type { Metadata } from 'next';
import './globals.css';
import Providers from '../components/Providers';
import Header from '../components/Header';
import Footer from '../components/Footer';

export const metadata: Metadata = {
  title: 'Pattie Play Shop - Premium Children Toys E-Commerce Store',
  description: 'Shop premium educational building blocks, action figures, board games, plush toys, and outdoor playsets for kids at Pattie Play Shop with Stripe, PayPal, and secure payments.',
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-[#fdfdfd] dark:bg-slate-900 text-slate-800 dark:text-slate-100">
        <Providers>
          <Header />
          <main className="flex-1 w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 page-enter">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
