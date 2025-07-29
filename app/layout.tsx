import './globals.css';

export const metadata = {
  title: 'Freight Status Dashboard',
  description: 'Track and manage freight deliveries in (simulated) real-time',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
