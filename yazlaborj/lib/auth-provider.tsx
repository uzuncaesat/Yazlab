"use client"

import type React from "react"
import { createContext, useState, useEffect } from "react"

type User = {
  id: string
  tcKimlik: string
  name: string
  email: string
  role: "candidate" | "admin" | "manager" | "jury"
}

// AuthContextType içindeki login fonksiyonunu güncelle
type AuthContextType = {
  user: User | null
  isLoading: boolean
  login: (tcKimlik: string, password: string) => Promise<void>
  register: (tcKimlik: string, name: string, email: string, password: string) => Promise<void>
  logout: () => void
  getToken: () => string | null
}

// Default context değerini güncelle
const defaultContextValue: AuthContextType = {
  user: null,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  getToken: () => null,
}

export const AuthContext = createContext<AuthContextType>(defaultContextValue)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  // Separate useEffect for client-side only code
  useEffect(() => {
    setMounted(true)

    try {
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Token alma fonksiyonu ekleyelim
  const getToken = (): string | null => {
    try {
      return localStorage.getItem("userToken")
    } catch (error) {
      console.error("Failed to get token from localStorage:", error)
      return null
    }
  }

  // login fonksiyonunu düzeltelim ve token yönetimini iyileştirelim
  const login = async (tcKimlik: string, password: string) => {
    // Önce API'ye bağlanmayı deneyelim
    try {
      console.log("API'ye login isteği yapılıyor...")
      const response = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tc_kimlik: tcKimlik,
          password: password,
        }),
        // 5 saniye timeout ekleyelim
        signal: AbortSignal.timeout(5000),
      })

      if (response.ok) {
        const data = await response.json()
        console.log("API'den başarılı yanıt:", data)

        // API'den gelen kullanıcı bilgilerini ve token'ı kullan
        const apiUser = {
          id: data.user.id.toString(),
          tcKimlik: data.user.tc_kimlik,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
        }

        // Kullanıcı bilgilerini ve token'ı kaydet
        setUser(apiUser)

        try {
          localStorage.setItem("user", JSON.stringify(apiUser))
          localStorage.setItem("userToken", data.access_token)
          console.log("Token ve kullanıcı bilgileri kaydedildi:", data.access_token)
        } catch (storageError) {
          console.error("localStorage kayıt hatası:", storageError)
        }

        return
      } else {
        console.error("API yanıt hatası:", response.status)
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || "Giriş yapılamadı. Lütfen TC Kimlik numaranızı ve şifrenizi kontrol edin.")
      }
    } catch (error) {
      console.error("API login hatası:", error)

      // API bağlantısı başarısız olduğunda mock veritabanı kullan
      console.log("Mock veritabanı kullanılıyor...")

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Mock veritabanı - gerçek bir veritabanı gibi davranacak
      const mockDatabase = [
        {
          id: "1",
          tcKimlik: "11111111111",
          name: "Admin Kullanıcı",
          email: "admin@example.com",
          password: "123456",
          role: "admin",
        },
        {
          id: "2",
          tcKimlik: "22222222222",
          name: "Yönetici Kullanıcı",
          email: "manager@example.com",
          password: "123456",
          role: "manager",
        },
        {
          id: "3",
          tcKimlik: "33333333333",
          name: "Jüri Kullanıcı",
          email: "jury@example.com",
          password: "123456",
          role: "jury",
        },
        {
          id: "4",
          tcKimlik: "44444444444",
          name: "Aday Kullanıcı",
          email: "candidate@example.com",
          password: "123456",
          role: "candidate",
        },
      ]

      // Veritabanında kullanıcıyı ara
      const foundUser = mockDatabase.find((user) => user.tcKimlik === tcKimlik && user.password === password)

      if (!foundUser) {
        throw new Error("Geçersiz TC Kimlik numarası veya şifre.")
      }

      // Kullanıcı bulundu, oturum aç
      const mockUser: User = {
        id: foundUser.id,
        tcKimlik: foundUser.tcKimlik,
        name: foundUser.name,
        email: foundUser.email,
        role: foundUser.role as User["role"],
      }

      // Simüle edilmiş bir token oluştur
      const mockToken = `mock_token_${Math.random().toString(36).substring(2, 15)}`

      setUser(mockUser)

      try {
        localStorage.setItem("user", JSON.stringify(mockUser))
        localStorage.setItem("userToken", mockToken)
        console.log("Mock token kaydedildi:", mockToken)
      } catch (storageError) {
        console.error("localStorage kayıt hatası:", storageError)
      }
    }
  }

  const register = async (tcKimlik: string, name: string, email: string, password: string) => {
    // API'ye bağlanmayı deneyelim
    try {
      console.log("API'ye kayıt isteği yapılıyor...")
      const response = await fetch("http://localhost:8000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tc_kimlik: tcKimlik,
          name: name,
          email: email,
          password: password,
          role: "candidate", // Varsayılan olarak aday rolü
        }),
        // 3 saniye timeout ekleyelim
        signal: AbortSignal.timeout(3000),
      })

      if (response.ok) {
        const data = await response.json()
        console.log("Kayıt başarılı:", data)
        return data
      }

      // API yanıt vermezse veya hata döndürürse, hata fırlat
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || "Kayıt yapılamadı. Lütfen bilgilerinizi kontrol edin.")
    } catch (error) {
      console.error("API kayıt hatası:", error)

      // API bağlantı hatası durumunda
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Sunucuya bağlanılamadı. Lütfen daha sonra tekrar deneyin.")
      }

      // Diğer hataları olduğu gibi ilet
      throw error instanceof Error ? error : new Error("Kayıt sırasında beklenmeyen bir hata oluştu.")
    }
  }

  const logout = () => {
    setUser(null)
    try {
      localStorage.removeItem("user")
      localStorage.removeItem("userToken") // Token'ı da temizle
    } catch (error) {
      console.error("Failed to remove user from localStorage:", error)
    }
  }

  // Render a placeholder while not mounted
  if (!mounted) {
    return null
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  )
}
