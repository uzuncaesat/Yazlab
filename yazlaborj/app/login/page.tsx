"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
// useAuth hook'undan login fonksiyonunu alırken, yeni imzaya göre güncelleyelim
import { useAuth } from "@/lib/auth-hooks"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { login } = useAuth()

  const [tcKimlik, setTcKimlik] = useState("")
  const [password, setPassword] = useState("")
  // Kullanıcı tipi state'ini ve değişiklik fonksiyonunu kaldıralım
  // const [userType, setUserType] = useState("candidate")
  const [isLoading, setIsLoading] = useState(false)

  // Kullanıcı tipi radio butonlarını kaldıralım ve login fonksiyonunu güncelleyelim
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate TC Kimlik
      if (!tcKimlik || tcKimlik.length !== 11 || !/^\d+$/.test(tcKimlik)) {
        throw new Error("TC Kimlik numarası 11 haneli olmalıdır.")
      }

      // Validate password
      if (!password || password.length < 6) {
        throw new Error("Şifre en az 6 karakter olmalıdır.")
      }

      // Veritabanındaki kullanıcı bilgilerine göre giriş yap
      await login(tcKimlik, password)

      toast({
        title: "Giriş başarılı",
        description: "Yönlendiriliyorsunuz...",
      })

      // Kullanıcı rolüne göre yönlendirme yap
      const user = JSON.parse(localStorage.getItem("user") || "{}")

      switch (user.role) {
        case "candidate":
          router.push("/dashboard/candidate")
          break
        case "admin":
          router.push("/dashboard/admin")
          break
        case "manager":
          router.push("/dashboard/manager")
          break
        case "jury":
          router.push("/dashboard/jury")
          break
        default:
          router.push("/dashboard/candidate")
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Giriş başarısız",
        description: error instanceof Error ? error.message : "Giriş yapılırken bir hata oluştu.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Giriş Yap</CardTitle>
          <CardDescription className="text-center">Akademik Personel Başvuru Sistemine hoş geldiniz</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tcKimlik">TC Kimlik Numarası</Label>
              <Input
                id="tcKimlik"
                type="text"
                value={tcKimlik}
                onChange={(e) => setTcKimlik(e.target.value)}
                placeholder="TC Kimlik Numaranızı Giriniz"
                required
                maxLength={11}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Şifrenizi Giriniz"
                required
              />
            </div>
            {/* Kullanıcı tipi radio butonlarını kaldıralım */}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </Button>
            <div className="text-center text-sm">
              Hesabınız yok mu?{" "}
              <Link href="/register" className="text-blue-600 hover:underline">
                Kayıt Ol
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
