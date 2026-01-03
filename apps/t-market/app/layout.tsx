import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";
import { CartDrawer } from "@/components/cart-drawer";
import { RecaptchaProvider } from "@/components/recaptcha-provider";

export const metadata: Metadata = {
  title: "T-Market | Ecosystem Marketplace",
  description: "Manage your subscriptions, payments, and module purchases",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistSans.variable} font-body antialiased`} suppressHydrationWarning>
        <RecaptchaProvider>
          <AuthProvider>
            {children}
            <CartDrawer />
          </AuthProvider>
        </RecaptchaProvider>
      </body>
    </html>
  );
}
