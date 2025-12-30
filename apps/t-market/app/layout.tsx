import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";

export const metadata: Metadata = {
  title: "T-Market | Ecosystem Marketplace",
  description: "Manage your subscriptions, payments, and module purchases",
};

import { CartDrawer } from "@/components/cart-drawer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <AuthProvider>
          {children}
          <CartDrawer />
        </AuthProvider>
      </body>
    </html>
  );
}
