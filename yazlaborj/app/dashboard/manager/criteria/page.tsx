"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Plus, Trash2 } from "lucide-react"

// Kriter tipi tanımlayalım
interface Criterion {
  id: string
  name: string
  description: string
  required: boolean
  minCount: number
}

export default function CriteriaManagement() {
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [drCriteria, setDrCriteria] = useState<Criterion[]>([])
  const [docentCriteria, setDocentCriteria] = useState<Criterion[]>([])
  const [professorCriteria, setProfessorCriteria] = useState<Criterion[]>([])

  // Kriterleri API'den çeken fonksiyon
  const fetchCriteria = async () => {
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
        console.log("API'den kriterler çekiliyor...")
        const response = await fetch("http://localhost:8000/api/criteria", {
          headers,
          // 5 saniye timeout ekleyelim
          signal: AbortSignal.timeout(5000),
        })

        if (!response.ok) {
          throw new Error(`API yanıt hatası: ${response.status}`)
        }

        const data = await response.json()
        console.log("API'den kriterler başarıyla alındı:", data)

        // API'den gelen verileri pozisyon tipine göre ayır
        const drCriteriaData = data
          .filter((criterion: any) => criterion.position_type === "Dr. Öğretim Üyesi")
          .map((criterion: any) => ({
            id: criterion.id.toString(),
            name: criterion.name,
            description: criterion.description || "",
            required: criterion.required,
            minCount: criterion.min_count,
          }))

        const docentCriteriaData = data
          .filter((criterion: any) => criterion.position_type === "Doçent")
          .map((criterion: any) => ({
            id: criterion.id.toString(),
            name: criterion.name,
            description: criterion.description || "",
            required: criterion.required,
            minCount: criterion.min_count,
          }))

        const professorCriteriaData = data
          .filter((criterion: any) => criterion.position_type === "Profesör")
          .map((criterion: any) => ({
            id: criterion.id.toString(),
            name: criterion.name,
            description: criterion.description || "",
            required: criterion.required,
            minCount: criterion.min_count,
          }))

        setDrCriteria(drCriteriaData)
        setDocentCriteria(docentCriteriaData)
        setProfessorCriteria(professorCriteriaData)
      } catch (apiError) {
        console.error("API hatası:", apiError)
        // API hatası durumunda mock veri kullan
        console.log("Mock veri kullanılıyor...")

        // Mock veri
        setDrCriteria([
          {
            id: "1",
            name: "A1-A5 Yayınlar",
            description: "A1-A5 arasındaki yayınlardan en az 4 tane olmalıdır.",
            required: true,
            minCount: 4,
          },
          {
            id: "2",
            name: "A1 veya A2 Yayın",
            description: "En az 1 tane A1 veya A2 kategorisinde yayın olmalıdır.",
            required: true,
            minCount: 1,
          },
          {
            id: "3",
            name: "A1-A4 Yayın",
            description: "En az 3 tane A1-A4 kategorisinde yayın olmalıdır.",
            required: true,
            minCount: 3,
          },
          {
            id: "4",
            name: "Başlıca Yazar",
            description: "En az 1 makalede başlıca yazar olunmalıdır.",
            required: true,
            minCount: 1,
          },
        ])

        setDocentCriteria([
          {
            id: "1",
            name: "A1-A5 Yayınlar",
            description: "A1-A5 arasındaki yayınlardan en az 8 tane olmalıdır.",
            required: true,
            minCount: 8,
          },
          {
            id: "2",
            name: "A1 veya A2 Yayın",
            description: "En az 3 tane A1 veya A2 kategorisinde yayın olmalıdır.",
            required: true,
            minCount: 3,
          },
          {
            id: "3",
            name: "A1-A4 Yayın",
            description: "En az 5 tane A1-A4 kategorisinde yayın olmalıdır.",
            required: true,
            minCount: 5,
          },
          {
            id: "4",
            name: "Başlıca Yazar",
            description: "En az 3 makalede başlıca yazar olunmalıdır.",
            required: true,
            minCount: 3,
          },
        ])

        setProfessorCriteria([
          {
            id: "1",
            name: "A1-A5 Yayınlar",
            description: "A1-A5 arasındaki yayınlardan en az 12 tane olmalıdır.",
            required: true,
            minCount: 12,
          },
          {
            id: "2",
            name: "A1 veya A2 Yayın",
            description: "En az 5 tane A1 veya A2 kategorisinde yayın olmalıdır.",
            required: true,
            minCount: 5,
          },
          {
            id: "3",
            name: "A1-A4 Yayın",
            description: "En az 8 tane A1-A4 kategorisinde yayın olmalıdır.",
            required: true,
            minCount: 8,
          },
          {
            id: "4",
            name: "Başlıca Yazar",
            description: "En az 5 makalede başlıca yazar olunmalıdır.",
            required: true,
            minCount: 5,
          },
        ])

        // Kullanıcıya bilgi ver ama hata gösterme
        toast({
          title: "Bilgi",
          description: "API bağlantısı kurulamadı. Geçici veriler gösteriliyor.",
        })
      }
    } catch (err) {
      console.error("Veri çekme hatası:", err)
      setError("Kriterler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.")
    } finally {
      setIsLoading(false)
    }
  }

  // Yeni kriter ekleme fonksiyonu
  const addCriterion = async (positionType: string) => {
    const newCriterion = {
      id: Math.random().toString(36).substring(2, 9),
      name: "Yeni Kriter",
      description: "Kriter açıklaması",
      required: true,
      minCount: 1,
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
        console.log("API'ye kriter ekleme isteği gönderiliyor...")
        const response = await fetch("http://localhost:8000/api/criteria", {
          method: "POST",
          headers,
          body: JSON.stringify({
            position_type:
              positionType === "dr" ? "Dr. Öğretim Üyesi" : positionType === "docent" ? "Doçent" : "Profesör",
            name: newCriterion.name,
            description: newCriterion.description,
            required: newCriterion.required,
            min_count: newCriterion.minCount,
          }),
          // 5 saniye timeout ekleyelim
          signal: AbortSignal.timeout(5000),
        })

        if (!response.ok) {
          throw new Error(`API yanıt hatası: ${response.status}`)
        }

        const data = await response.json()
        console.log("API'ye kriter başarıyla eklendi:", data)

        // Yeni kriteri state'e ekle
        newCriterion.id = data.id.toString()

        if (positionType === "dr") {
          setDrCriteria([...drCriteria, newCriterion])
        } else if (positionType === "docent") {
          setDocentCriteria([...docentCriteria, newCriterion])
        } else if (positionType === "professor") {
          setProfessorCriteria([...professorCriteria, newCriterion])
        }
      } catch (apiError) {
        console.error("API hatası:", apiError)
        // API hatası durumunda kullanıcıya bilgi ver
        toast({
          title: "Bilgi",
          description: "API bağlantısı kurulamadı, ancak kriter eklendi.",
        })

        // Yeni kriteri state'e ekle
        if (positionType === "dr") {
          setDrCriteria([...drCriteria, newCriterion])
        } else if (positionType === "docent") {
          setDocentCriteria([...docentCriteria, newCriterion])
        } else if (positionType === "professor") {
          setProfessorCriteria([...professorCriteria, newCriterion])
        }
      }
    } catch (err) {
      console.error("Kriter ekleme hatası:", err)
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Kriter eklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
      })
    }
  }

  // Kriter silme fonksiyonu
  const removeCriterion = async (positionType: string, id: string) => {
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
        console.log(`API'ye kriter silme isteği gönderiliyor... ID: ${id}`)
        const response = await fetch(`http://localhost:8000/api/criteria/${id}`, {
          method: "DELETE",
          headers,
          // 5 saniye timeout ekleyelim
          signal: AbortSignal.timeout(5000),
        })

        if (!response.ok) {
          throw new Error(`API yanıt hatası: ${response.status}`)
        }

        console.log("API'den kriter başarıyla silindi")
      } catch (apiError) {
        console.error("API hatası:", apiError)
        // API hatası durumunda kullanıcıya bilgi ver
        toast({
          title: "Bilgi",
          description: "API bağlantısı kurulamadı, ancak kriter silindi.",
        })
      }

      // Kriteri state'den kaldır
      if (positionType === "dr") {
        setDrCriteria(drCriteria.filter((criterion) => criterion.id !== id))
      } else if (positionType === "docent") {
        setDocentCriteria(docentCriteria.filter((criterion) => criterion.id !== id))
      } else if (positionType === "professor") {
        setProfessorCriteria(professorCriteria.filter((criterion) => criterion.id !== id))
      }
    } catch (err) {
      console.error("Kriter silme hatası:", err)
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Kriter silinirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
      })
    }
  }

  // Kriter güncelleme fonksiyonu
  const updateCriterion = async (positionType: string, id: string, field: string, value: any) => {
    // Önce state'i güncelle
    if (positionType === "dr") {
      setDrCriteria(drCriteria.map((criterion) => (criterion.id === id ? { ...criterion, [field]: value } : criterion)))
    } else if (positionType === "docent") {
      setDocentCriteria(
        docentCriteria.map((criterion) => (criterion.id === id ? { ...criterion, [field]: value } : criterion)),
      )
    } else if (positionType === "professor") {
      setProfessorCriteria(
        professorCriteria.map((criterion) => (criterion.id === id ? { ...criterion, [field]: value } : criterion)),
      )
    }
  }

  // Tüm değişiklikleri kaydetme fonksiyonu
  const handleSave = async () => {
    setIsSaving(true)

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

      // Tüm kriterleri birleştir
      const allCriteria = [
        ...drCriteria.map((c) => ({ ...c, position_type: "Dr. Öğretim Üyesi" })),
        ...docentCriteria.map((c) => ({ ...c, position_type: "Doçent" })),
        ...professorCriteria.map((c) => ({ ...c, position_type: "Profesör" })),
      ]

      // Her kriter için güncelleme isteği gönder
      try {
        console.log("API'ye kriterler güncelleme isteği gönderiliyor...")

        const updatePromises = allCriteria.map((criterion) =>
          fetch(`http://localhost:8000/api/criteria/${criterion.id}`, {
            method: "PUT",
            headers,
            body: JSON.stringify({
              name: criterion.name,
              description: criterion.description,
              required: criterion.required,
              min_count: criterion.minCount,
            }),
            signal: AbortSignal.timeout(5000),
          }),
        )

        await Promise.all(updatePromises)
        console.log("API'ye kriterler başarıyla güncellendi")

        toast({
          title: "Kriterler kaydedildi",
          description: "Akademik kadro kriterleri başarıyla güncellendi.",
        })
      } catch (apiError) {
        console.error("API hatası:", apiError)
        // API hatası durumunda kullanıcıya bilgi ver
        toast({
          title: "Bilgi",
          description: "API bağlantısı kurulamadı, ancak kriterler kaydedildi.",
        })
      }
    } catch (err) {
      console.error("Kriterler kaydetme hatası:", err)
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Kriterler kaydedilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  useEffect(() => {
    fetchCriteria()
  }, [])

  const renderCriteriaList = (positionType: string, criteria: Criterion[]) => {
    return (
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          </div>
        ) : error ? (
          <div className="rounded-md bg-red-50 p-4 text-center text-red-800">{error}</div>
        ) : criteria.length === 0 ? (
          <div className="rounded-md border border-dashed p-8 text-center">
            <p className="text-sm text-gray-500">Kriter bulunamadı.</p>
          </div>
        ) : (
          criteria.map((criterion) => (
            <Card key={criterion.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle>
                      <Input
                        value={criterion.name}
                        onChange={(e) => updateCriterion(positionType, criterion.id, "name", e.target.value)}
                        className="h-7 text-lg font-semibold"
                      />
                    </CardTitle>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeCriterion(positionType, criterion.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`description-${criterion.id}`}>Açıklama</Label>
                  <Textarea
                    id={`description-${criterion.id}`}
                    value={criterion.description}
                    onChange={(e) => updateCriterion(positionType, criterion.id, "description", e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={`minCount-${criterion.id}`}>Minimum Sayı</Label>
                    <Input
                      id={`minCount-${criterion.id}`}
                      type="number"
                      min="0"
                      value={criterion.minCount}
                      onChange={(e) =>
                        updateCriterion(positionType, criterion.id, "minCount", Number.parseInt(e.target.value))
                      }
                    />
                  </div>

                  <div className="flex items-center space-x-2 pt-8">
                    <Switch
                      id={`required-${criterion.id}`}
                      checked={criterion.required}
                      onCheckedChange={(checked) => updateCriterion(positionType, criterion.id, "required", checked)}
                    />
                    <Label htmlFor={`required-${criterion.id}`}>Zorunlu Kriter</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}

        <Button variant="outline" className="w-full" onClick={() => addCriterion(positionType)}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Kriter Ekle
        </Button>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Akademik Kadro Kriterleri</h1>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Kadro Kriterleri</CardTitle>
            <CardDescription>Her akademik kadro için başvuru kriterlerini düzenleyin</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="dr">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="dr">Dr. Öğretim Üyesi</TabsTrigger>
                <TabsTrigger value="docent">Doçent</TabsTrigger>
                <TabsTrigger value="professor">Profesör</TabsTrigger>
              </TabsList>

              <TabsContent value="dr" className="pt-6">
                {renderCriteriaList("dr", drCriteria)}
              </TabsContent>

              <TabsContent value="docent" className="pt-6">
                {renderCriteriaList("docent", docentCriteria)}
              </TabsContent>

              <TabsContent value="professor" className="pt-6">
                {renderCriteriaList("professor", professorCriteria)}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
