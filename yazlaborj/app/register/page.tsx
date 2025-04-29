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
import { useAuth } from "@/lib/auth-hooks"

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { register } = useAuth()

  const [tcKimlik, setTcKimlik] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate TC Kimlik
      if (!tcKimlik || tcKimlik.length !== 11 || !/^\d+$/.test(tcKimlik)) {
        throw new Error("TC Kimlik numarası 11 haneli olmalıdır.")
      }

      // Validate name
      if (!name || name.trim().length < 3) {
        throw new Error("Ad Soyad en az 3 karakter olmalıdır.")
      }

      // Validate email
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error("Geçerli bir e-posta adresi giriniz.")
      }

      // Validate password
      if (!password || password.length < 6) {
        throw new Error("Şifre en az 6 karakter olmalıdır.")
      }

      // Validate password match
      if (password !== confirmPassword) {
        throw new Error("Şifreler eşleşmiyor.")
      }

      // API'ye kayıt isteğini gönder
      await register(tcKimlik, name, email, password)

      toast({
        title: "Kayıt başarılı",
        description: "Giriş sayfasına yönlendiriliyorsunuz...",
      })

      router.push("/login")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Kayıt başarısız",
        description: error instanceof Error ? error.message : "Kayıt olurken bir hata oluştu.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Kayıt Ol</CardTitle>
          <CardDescription className="text-center">Akademik Personel Başvuru Sistemine kayıt olun</CardDescription>
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
              <Label htmlFor="name">Ad Soyad</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Adınızı ve Soyadınızı Giriniz"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-posta Adresinizi Giriniz"
                required
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
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Şifre Tekrar</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Şifrenizi Tekrar Giriniz"
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Kayıt yapılıyor..." : "Kayıt Ol"}
            </Button>
            <div className="text-center text-sm">
              Zaten hesabınız var mı?{" "}
              <Link href="/login" className="text-blue-600 hover:underline">
                Giriş Yap
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
