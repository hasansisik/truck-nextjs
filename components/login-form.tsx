"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useAppDispatch, useAppSelector } from "@/redux/hook"
import { login } from "@/redux/actions/userActions"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [emailOrUsername, setEmailOrUsername] = useState("")
  const [password, setPassword] = useState("")
  
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { loading, error, isAuthenticated } = useAppSelector((state) => state.user)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!emailOrUsername || !password) {
      toast.error("Lütfen e-posta adresinizi veya kullanıcı adınızı ve şifrenizi girin")
      return
    }

    try {
      const result = await dispatch(login({ emailOrUsername, password }))
      
      if (login.fulfilled.match(result)) {
        toast.success("Giriş başarılı!")
        router.push("/")
      } else {
        toast.error(error || "Giriş yapılırken bir hata oluştu")
      }
    } catch (err) {
      toast.error("Giriş yapılırken bir hata oluştu")
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Hoş Geldiniz</CardTitle>
          <CardDescription>
            E-posta veya kullanıcı adınız ile giriş yapın
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="emailOrUsername">E-posta veya Kullanıcı Adı</Label>
                  <Input
                    id="emailOrUsername"
                    type="text"
                    placeholder="ornek@eposta.com veya kullanıcıadı"
                    value={emailOrUsername}
                    onChange={(e) => setEmailOrUsername(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="grid gap-3">
                  <div className="flex items-center">
                    <Label htmlFor="password">Şifre</Label>
                  </div>
                  <Input 
                    id="password" 
                    type="password"
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        Devam ederek <a href="#">Kullanım Şartları</a>{" "}
        ve <a href="#">Gizlilik Politikası</a>'nı kabul etmiş olursunuz.
      </div>
    </div>
  )
}
