
"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import Link from "next/link"

import { Button } from "@/components/ui/button"
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
import { Loader2, Box, ArrowRight, ShieldCheck } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { motion } from "framer-motion"

const loginSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi girin."),
  password: z.string().min(1, "Şifre zorunludur."),
  rememberMe: z.boolean().default(false).optional(),
})

type LoginFormValues = z.infer<typeof loginSchema>

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" {...props}>
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C42.022,35.244,44,30.036,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
    </svg>
)

export default function LoginPage() {
  const router = useRouter()
  const { signIn, signInWithGoogle, user } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = React.useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  })

  React.useEffect(() => {
    if (user) {
      router.push("/dashboard")
    }
  }, [user, router])


  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true)
    try {
      await signIn(data.email, data.password, data.rememberMe)
      toast({
        title: "Giriş Başarılı",
        description: "Yönlendiriliyorsunuz...",
      })
      // Yönlendirme useEffect tarafından yapılacak
    } catch (error: any) {
      const errorCode = error.code;
      let errorMessage = "Giriş yaparken bir hata oluştu. Lütfen tekrar deneyin.";
      if (errorCode === 'auth/wrong-password' || errorCode === 'auth/user-not-found' || errorCode === 'auth/invalid-credential') {
        errorMessage = "E-posta veya şifre hatalı. Lütfen bilgilerinizi kontrol edin."
      }
      toast({
        title: "Giriş Başarısız",
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

  if (user) return null // Prevent flash of login page if user is already logged in and redirecting

  return (
    <div className="container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-zinc-900" />
        {/* Abstract Gradient Background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-900/40 via-zinc-900 to-zinc-950" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-20 flex items-center text-lg font-medium">
          <div className="h-8 w-8 rounded-lg bg-emerald-500/20 flex items-center justify-center mr-2 ring-1 ring-emerald-500/30">
            <Box className="h-5 w-5 text-emerald-500" />
          </div>
          T-ENV-I
        </div>
        
        <div className="relative z-20 mt-auto">
          <motion.blockquote 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            <p className="text-lg">
              &ldquo;Modern envanter yönetimi, işletmenizin kalbidir. Tek-Ecosystem ile tam kontrol sağlayın.&rdquo;
            </p>
            <footer className="text-sm text-zinc-400">Teknoloji Ekibi</footer>
          </motion.blockquote>
        </div>
      </div>
      <div className="lg:p-8 relative overflow-hidden">
        {/* Mobile Background Elements */}
        <div className="absolute inset-0 bg-background lg:hidden" />
        <div className="absolute top-[-20%] left-[-10%] w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[80px] lg:hidden" />

        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[380px] relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col space-y-2 text-center"
          >
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 lg:hidden">
                <Box className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Oturum Açın</h1>
            <p className="text-sm text-muted-foreground">
              Sisteme erişmek için kimlik bilgilerinizi girin
            </p>
          </motion.div>

          <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.1 }}
             className="grid gap-6"
          >
             <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-posta</FormLabel>
                      <FormControl>
                        <Input 
                            placeholder="ornek@sirket.com" 
                            {...field} 
                            className="bg-background/50 border-input/60 focus:bg-background transition-all"
                        />
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
                      <FormLabel className="flex items-center justify-between">
                         Şifre
                         <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                            Şifremi unuttum
                         </Link>
                      </FormLabel>
                      <FormControl>
                        <Input 
                            type="password" 
                            placeholder="••••••••" 
                            {...field} 
                            className="bg-background/50 border-input/60 focus:bg-background transition-all"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="font-normal cursor-pointer text-muted-foreground hover:text-foreground">
                          Oturumu açık tut
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                 <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all font-medium" disabled={isLoading || isGoogleLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isLoading ? "Giriş Yapılıyor..." : "Giriş Yap"}
                  {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </form>
            </Form>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Veya devam et
                </span>
              </div>
            </div>

            <Button variant="outline" type="button" onClick={handleGoogleSignIn} disabled={isLoading || isGoogleLoading} className="h-11 border-input/60 hover:bg-secondary/50">
              {isGoogleLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <GoogleIcon className="mr-2 h-4 w-4" />
              )}
              Google ile Giriş Yap
            </Button>

            <p className="px-8 text-center text-sm text-muted-foreground mt-4">
               Bu site korunmaktadır ve <span className="underline underline-offset-4 hover:text-primary">Gizlilik Politikası</span> ile <span className="underline underline-offset-4 hover:text-primary">Hizmet Şartları</span> geçerlidir.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
