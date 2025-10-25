export const metadata = { title: 'Saklin Admin', description: 'Operations console' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body style={{fontFamily:'system-ui, sans-serif', background:'#F6F7F9'}}>{children}</body>
    </html>
  );
}
