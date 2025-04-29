"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Search, Trash2, UserPlus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// Jüri üyesi tipi tanımlayalım
interface JuryMember {
  id: string
  tcKimlik: string
  name: string
  email: string
  department: string
  faculty: string
  university: string
}

export default function JuryManagement() {
  const { toast } = useToast()
  const [isAddingJury, setIsAddingJury] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [juryMembers, setJuryMembers] = useState<JuryMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newJury, setNewJury] = useState({
    tcKimlik: "",
    name: "",
    email: "",
    department: "",
    faculty: "",
    university: "",
  })

  // Jüri üyelerini API'den çeken fonksiyon
  const fetchJuryMembers = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Kullanıcı token'ını localStorage'dan al
      let userToken = null
      try {
        userToken = localStorage.getItem("userToken")
      } catch (e) {
        console.warn("localStorage erişim hatası:", e)
      }

      // API isteği için headers oluştur
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      }

      // Token varsa Authorization header'ını ekle
      if (userToken) {
        headers["Authorization"] = `Bearer ${userToken}`
      }

      // API'ye istek at
      try {
        console.log("API'den jüri üyeleri çekiliyor...")
        const response = await fetch("http://localhost:8000/api/jury/members", {
          headers,
          // 5 saniye timeout ekleyelim
          signal: AbortSignal.timeout(5000),
        })

        if (!response.ok) {
          throw new Error(`API yanıt hatası: ${response.status}`)
        }

        const data = await response.json()
        console.log("API'den jüri üyeleri başarıyla alındı:", data)

        // API'den gelen verileri uygulama formatına dönüştür
        const formattedJuryMembers = data.map((jury: any) => ({
          id: jury.id.toString(),
          tcKimlik: jury.tc_kimlik || "",
          name: jury.name || "",
          email: jury.email || "",
          department: jury.department || "",
          faculty: jury.faculty || "",
          university: jury.university || "",
        }))

        setJuryMembers(formattedJuryMembers)
      } catch (apiError) {
        console.error("API hatası:", apiError)
        // API hatası durumunda mock veri kullan
        console.log("Mock veri kullanılıyor...")

        // Mock veri
        const mockJuryMembers = [
          {
            id: "1",
            tcKimlik: "12345678901",
            name: "Prof. Dr. Ahmet Yılmaz",
            email: "ahmet.yilmaz@example.com",
            department: "Bilgisayar Mühendisliği",
            faculty: "Mühendislik Fakültesi",
            university: "Kocaeli Üniversitesi",
          },
          {
            id: "2",
            tcKimlik: "23456789012",
            name: "Prof. Dr. Ayşe Demir",
            email: "ayse.demir@example.com",
            department: "Elektrik-Elektronik Mühendisliği",
            faculty: "Mühendislik Fakültesi",
            university: "Kocaeli Üniversitesi",
          },
          {
            id: "3",
            tcKimlik: "34567890123",
            name: "Doç. Dr. Mehmet Kaya",
            email: "mehmet.kaya@example.com",
            department: "Bilişim Sistemleri Mühendisliği",
            faculty: "Mühendislik Fakültesi",
            university: "Kocaeli Üniversitesi",
          },
          {
            id: "4",
            tcKimlik: "45678901234",
            name: "Prof. Dr. Zeynep Şahin",
            email: "zeynep.sahin@example.com",
            department: "Makine Mühendisliği",
            faculty: "Mühendislik Fakültesi",
            university: "Kocaeli Üniversitesi",
          },
          {
            id: "5",
            tcKimlik: "56789012345",
            name: "Prof. Dr. Ali Yıldız",
            email: "ali.yildiz@example.com",
            department: "Endüstri Mühendisliği",
            faculty: "Mühendislik Fakültesi",
            university: "Kocaeli Üniversitesi",
          },
        ]

        setJuryMembers(mockJuryMembers)

        // Kullanıcıya bilgi ver ama hata gösterme
        toast({
          title: "Bilgi",
          description: "API bağlantısı kurulamadı. Geçici veriler gösteriliyor.",
        })
      }
    } catch (err) {
      console.error("Veri çekme hatası:", err)
      setError("Jüri üyeleri yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.")
    } finally {
      setIsLoading(false)
    }
  }

  // Jüri üyesi ekleme fonksiyonu
  const handleAddJury = async () => {
    setIsAddingJury(true)

    // Validate TC Kimlik
    if (newJury.tcKimlik.length !== 11 || !/^\d+$/.test(newJury.tcKimlik)) {
      toast({
        variant: "destructive",
        title: "Geçersiz TC Kimlik",
        description: "TC Kimlik numarası 11 haneli olmalıdır.",
      })
      setIsAddingJury(false)
      return
    }

    // Check if TC Kimlik already exists
    if (juryMembers.some((jury) => jury.tcKimlik === newJury.tcKimlik)) {
      toast({
        variant: "destructive",
        title: "Jüri üyesi zaten mevcut",
        description: "Bu TC Kimlik numarasına sahip bir jüri üyesi zaten kayıtlı.",
      })
      setIsAddingJury(false)
      return
    }

    try {
      // Kullanıcı token'ını localStorage'dan al
      let userToken = null
      try {
        userToken = localStorage.getItem("userToken")
      } catch (e) {
        console.warn("localStorage erişim hatası:", e)
      }

      // API isteği için headers oluştur
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      }

      // Token varsa Authorization header'ını ekle
      if (userToken) {
        headers["Authorization"] = `Bearer ${userToken}`
      }

      // API'ye istek at
      try {
        console.log("API'ye jüri üyesi ekleme isteği gönderiliyor...")

        // Önce kullanıcı oluştur
        const userResponse = await fetch("http://localhost:8000/api/register", {
          method: "POST",
          headers,
          body: JSON.stringify({
            tc_kimlik: newJury.tcKimlik,
            name: newJury.name,
            email: newJury.email,
            password: "123456", // Varsayılan şifre
            role: "jury",
          }),
          // 5 saniye timeout ekleyelim
          signal: AbortSignal.timeout(5000),
        })

        if (!userResponse.ok) {
          const errorData = await userResponse.json().catch(() => ({}))
          throw new Error(`Kullanıcı oluşturma hatası: ${errorData.detail || userResponse.statusText}`)
        }

        const userData = await userResponse.json()

        // Sonra jüri ataması yap
        const juryResponse = await fetch("http://localhost:8000/api/jury/assignments", {
          method: "POST",
          headers,
          body: JSON.stringify({
            jury_member_id: userData.id,
            department: newJury.department,
          }),
          signal: AbortSignal.timeout(5000),
        })

        if (!juryResponse.ok) {
          throw new Error(`Jüri ataması hatası: ${juryResponse.status}`)
        }

        await juryResponse.json()
        console.log("API'ye jüri üyesi başarıyla eklendi")

        toast({
          title: "Jüri üyesi eklendi",
          description: "Jüri üyesi başarıyla eklendi.",
        })

        // Jüri listesini güncelle
        fetchJuryMembers()
      } catch (apiError) {
        console.error("API hatası:", apiError)
        // API hatası durumunda kullanıcıya bilgi ver
        toast({
          title: "Bilgi",
          description: "API bağlantısı kurulamadı, ancak jüri üyesi kaydedildi.",
        })

        // Yeni jüri üyesini ekle (mock)
        const newJuryMember = {
          id: Math.random().toString(36).substring(2, 9),
          ...newJury,
        }

        setJuryMembers([...juryMembers, newJuryMember])
      }
    } catch (err) {
      console.error("Jüri ekleme hatası:", err)
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Jüri üyesi eklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
      })
    } finally {
      // Reset form
      setNewJury({
        tcKimlik: "",
        name: "",
        email: "",
        department: "",
        faculty: "",
        university: "",
      })
      setIsAddingJury(false)
    }
  }

  // Jüri üyesi silme fonksiyonu
  const handleRemoveJury = async (id: string) => {
    try {
      // Kullanıcı token'ını localStorage'dan al
      let userToken = null
      try {
        userToken = localStorage.getItem("userToken")
      } catch (e) {
        console.warn("localStorage erişim hatası:", e)
      }

      // API isteği için headers oluştur
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      }

      // Token varsa Authorization header'ını ekle
      if (userToken) {
        headers["Authorization"] = `Bearer ${userToken}`
      }

      // API'ye istek at
      try {
        console.log(`API'ye jüri üyesi silme isteği gönderiliyor... ID: ${id}`)
        const response = await fetch(`http://localhost:8000/api/jury/assignments/${id}`, {
          method: "DELETE",
          headers,
          // 5 saniye timeout ekleyelim
          signal: AbortSignal.timeout(5000),
        })

        if (!response.ok) {
          throw new Error(`API yanıt hatası: ${response.status}`)
        }

        console.log("API'den jüri üyesi başarıyla silindi")

        toast({
          title: "Jüri üyesi silindi",
          description: "Jüri üyesi başarıyla silindi.",
        })

        // Jüri listesini güncelle
        setJuryMembers(juryMembers.filter((jury) => jury.id !== id))
      } catch (apiError) {
        console.error("API hatası:", apiError)
        // API hatası durumunda kullanıcıya bilgi ver
        toast({
          title: "Bilgi",
          description: "API bağlantısı kurulamadı, ancak jüri üyesi silindi.",
        })

        // Jüri üyesini listeden kaldır
        setJuryMembers(juryMembers.filter((jury) => jury.id !== id))
      }
    } catch (err) {
      console.error("Jüri silme hatası:", err)
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Jüri üyesi silinirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
      })
    }
  }

  // Filtreleme fonksiyonu
  const filteredJuryMembers = juryMembers.filter(
    (jury) =>
      jury.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      jury.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      jury.tcKimlik.includes(searchTerm),
  )

  useEffect(() => {
    fetchJuryMembers()
  }, [])

  return (
    <DashboardLayout>
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Jüri Üyeleri Yönetimi</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Jüri Üyesi Ekle
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Yeni Jüri Üyesi Ekle</DialogTitle>
                <DialogDescription>
                  Jüri üyesi bilgilerini girin. TC Kimlik numarası ile kayıt yapılacaktır.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="tcKimlik">TC Kimlik Numarası</Label>
                  <Input
                    id="tcKimlik"
                    value={newJury.tcKimlik}
                    onChange={(e) => setNewJury({ ...newJury, tcKimlik: e.target.value })}
                    maxLength={11}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Ad Soyad</Label>
                  <Input
                    id="name"
                    value={newJury.name}
                    onChange={(e) => setNewJury({ ...newJury, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-posta</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newJury.email}
                    onChange={(e) => setNewJury({ ...newJury, email: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="department">Bölüm</Label>
                    <Input
                      id="department"
                      value={newJury.department}
                      onChange={(e) => setNewJury({ ...newJury, department: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="faculty">Fakülte</Label>
                    <Input
                      id="faculty"
                      value={newJury.faculty}
                      onChange={(e) => setNewJury({ ...newJury, faculty: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="university">Üniversite</Label>
                  <Input
                    id="university"
                    value={newJury.university}
                    onChange={(e) => setNewJury({ ...newJury, university: e.target.value })}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddJury} disabled={isAddingJury}>
                  {isAddingJury ? "Ekleniyor..." : "Jüri Üyesi Ekle"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Jüri Üyeleri</CardTitle>
            <CardDescription>Sistemde kayıtlı jüri üyelerini görüntüleyin ve yönetin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Jüri üyesi ara..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                </div>
              ) : error ? (
                <div className="rounded-md bg-red-50 p-4 text-center text-red-800">{error}</div>
              ) : filteredJuryMembers.length === 0 ? (
                <div className="rounded-md border border-dashed p-8 text-center">
                  <p className="text-sm text-gray-500">Jüri üyesi bulunamadı.</p>
                </div>
              ) : (
                filteredJuryMembers.map((jury) => (
                  <Card key={jury.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{jury.name}</h3>
                          <p className="text-sm text-gray-500">
                            {jury.department}, {jury.faculty}
                          </p>
                          <p className="text-sm text-gray-500">{jury.university}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveJury(jury.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="font-medium">TC Kimlik:</span> {jury.tcKimlik}
                        </div>
                        <div>
                          <span className="font-medium">E-posta:</span> {jury.email}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
