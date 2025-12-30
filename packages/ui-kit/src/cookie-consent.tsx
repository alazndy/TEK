import * as React from "react"
import { Button } from "./button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./card"

export interface CookieConsentProps {
  onAccept: () => void;
  onDecline: () => void;
  isOpen: boolean;
}

export function CookieConsent({ onAccept, onDecline, isOpen }: CookieConsentProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card>
        <CardHeader>
          <CardTitle>Çerez İzni</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Sitemizdeki deneyiminizi geliştirmek için çerezleri kullanıyoruz. Devam ederek çerez politikamızı kabul etmiş olursunuz.
          </p>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={onDecline}>Reddet</Button>
          <Button onClick={onAccept}>Kabul Et</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
