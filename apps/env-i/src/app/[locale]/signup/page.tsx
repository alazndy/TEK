
"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

const signupSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi girin."),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır."),
})

type SignupFormValues = z.infer<typeof signupSchema>

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" {...props}>
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C42.022,35.244,44,30.036,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
    </svg>
)

export default function SignupPage() {
  const router = useRouter()
  const { signUp, signInWithGoogle, user } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = React.useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false)


  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  React.useEffect(() => {
    if (user) {
      router.push("/dashboard")
    }
  }, [user, router])

  const onSubmit = async (data: SignupFormValues) => {
    setIsLoading(true)
    try {
      await signUp(data.email, data.password)
      toast({
        title: "Kayıt Başarılı",
        description: "Hesabınız oluşturuldu. Giriş sayfasına yönlendiriliyorsunuz.",
      })
      router.push("/login")
    } catch (error: any) {
      let errorMessage = "Kayıt sırasında bir hata oluştu."
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "Bu e-posta adresi zaten kullanılıyor."
      }
      toast({
        title: "Kayıt Başarısız",
        description: errorMessage,
        variant: "destructive",
      })
      console.error(error)
    } finally {
        setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    try {
      await signInWithGoogle();
      toast({
        title: "Giriş Başarılı",
        description: "Yönlendiriliyorsunuz...",
      })
      // Yönlendirme useEffect tarafından yapılacak
    } catch (error: any) {
       let errorMessage = "Google ile giriş yaparken bir hata oluştu.";
       if (error.code === 'auth/popup-closed-by-user') {
          errorMessage = "Giriş penceresi kapatıldı. Lütfen tekrar deneyin.";
       } else if (error.code === 'auth/popup-blocked') {
          errorMessage = "Giriş penceresi tarayıcı tarafından engellendi. Lütfen pop-up'lara izin verin ve tekrar deneyin.";
       }
       toast({
        title: "Giriş Başarısız",
        description: errorMessage,
        variant: "destructive",
      })
      console.error("Google Sign-In Error:", error);
    } finally {
      setIsGoogleLoading(false)
    }
  }

  if (user) return null

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle>Hesap Oluştur</CardTitle>
          <CardDescription>Başlamak için yeni bir hesap oluşturun</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-posta</FormLabel>
                    <FormControl>
                      <Input placeholder="ornek@mail.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Şifre</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
                 {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Kaydol
              </Button>
            </form>
          </Form>
           <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Veya</span>
              </div>
          </div>
           <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading || isGoogleLoading}>
              {isGoogleLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                  <GoogleIcon className="mr-2 h-5 w-5" />
              )}
              Google ile Devam Et
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center text-sm">
          <p>
            Zaten bir hesabınız var mı?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Giriş Yapın
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
