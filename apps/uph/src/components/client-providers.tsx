
'use client';

import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import { AuthProvider } from "./auth-provider";
import { ThemeProvider } from "./theme-provider";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? '6LcU1ooqAAAAAOnf-cT_I73cREp6iM_D3Z2u1X3C'} 
      scriptProps={{
        async: false,
        defer: false,
        appendTo: "head",
        nonce: undefined,
      }}
    >
      <AuthProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </AuthProvider>
    </GoogleReCaptchaProvider>
  );
}
