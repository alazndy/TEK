import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";
import { CartDrawer } from "@/components/cart-drawer";

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
      <body className={`${GeistSans.variable} font-body antialiased`}>
        <GoogleReCaptchaProvider
            reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? '6Lc...'} // Placeholder fallback
            scriptProps={{
                async: false,
                defer: false,
                appendTo: "head",
                nonce: undefined,
            }}
        >
          <AuthProvider>
            {children}
            <CartDrawer />
          </AuthProvider>
        </GoogleReCaptchaProvider>
      </body>
    </html>
  );
}
