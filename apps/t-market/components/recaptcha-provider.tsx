'use client';

import { GoogleReCaptchaProvider as Provider } from 'react-google-recaptcha-v3';

export function RecaptchaProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider
      reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? '6Lc...'}
      scriptProps={{
        async: true,
        defer: true,
        appendTo: 'head',
      }}
    >
      {children}
    </Provider>
  );
}
