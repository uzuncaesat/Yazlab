"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { Search, FileText } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

// Değerlendirme tipi tanımlayalım
interface Evaluation {
  id: string
  candidate: {
    name: string
    department: string
  }
  position: string
  assignedDate: string
  deadline: string
  completedDate?: string
  status: "pending" | "completed"
  result?: "positive" | "negative"
}

export default function JuryEvaluations() {
  // State tanımlamaları
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("pending")
  const [isClient, setIsClient] = useState(false)
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Değerlendirmeleri API'den çeken fonksiyon
  const fetchEvaluations = async () => {
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
        console.log("API'den değerlendirmeler çekiliyor...")
        const response = await fetch("http://localhost:8000/api/evaluations", {
          headers,
          // 5 saniye timeout ekleyelim
          signal: AbortSignal.timeout(5000),
        })

        if (!response.ok) {
          throw new Error(`API yanıt hatası: ${response.status}`)
        }

        const data = await response.json()
        console.log("API'den değerlendirmeler başarıyla alındı:", data)

        // API'den gelen verileri uygulama formatına dönüştür
        const formattedEvaluations = data.map((evalItem: any) => {
          return {
            id: evalItem.id.toString(),
            candidate: {
              name: evalItem.candidate_name || "İsimsiz Aday",
              department: evalItem.department || "Belirtilmemiş",
            },
            position: evalItem.position || "Belirtilmemiş",
            assignedDate: formatDate(evalItem.assigned_date),
            deadline: formatDate(evalItem.deadline),
            completedDate: evalItem.completed_date ? formatDate(evalItem.completed_date) : undefined,
            status: evalItem.is_completed ? ("completed" as const) : ("pending" as const),
            result: evalItem.result ? (evalItem.result === "positive" ? "positive" : "negative") : undefined,
          }
        })

        setEvaluations(formattedEvaluations)
      } catch (apiError) {
        console.error("API hatası:", apiError)
        // API hatası durumunda mock veri kullan
        console.log("Mock veri kullanılıyor...")

        // Mock veri - tüm nesnelerde assignedDate ve deadline olmalı
        const mockEvaluations: Evaluation[] = [
          {
            id: "1",
            candidate: {
              name: "Ahmet Yılmaz",
              department: "Bilişim Sistemleri Mühendisliği",
            },
            position: "Dr. Öğretim Üyesi",
            assignedDate: "15.03.2025",
            deadline: "30.03.2025",
            status: "pending",
          },
          {
            id: "2",
            candidate: {
              name: "Ayşe Demir",
              department: "Bilgisayar Mühendisliği",
            },
            position: "Doçent",
            assignedDate: "10.03.2025",
            deadline: "25.03.2025",
            status: "pending",
          },
          {
            id: "3",
            candidate: {
              name: "Mehmet Kaya",
              department: "Elektrik-Elektronik Mühendisliği",
            },
            position: "Profesör",
            assignedDate: "05.03.2025",
            deadline: "20.03.2025",
            status: "pending",
          },
          {
            id: "4",
            candidate: {
              name: "Zeynep Şahin",
              department: "Makine Mühendisliği",
            },
            position: "Dr. Öğretim Üyesi",
            assignedDate: "20.02.2025", // Eklendi
            deadline: "15.03.2025", // Eklendi
            completedDate: "01.03.2025",
            status: "completed",
            result: "positive",
          },
          {
            id: "5",
            candidate: {
              name: "Ali Yıldız",
              department: "Endüstri Mühendisliği",
            },
            position: "Doçent",
            assignedDate: "15.02.2025", // Eklendi
            deadline: "10.03.2025", // Eklendi
            completedDate: "28.02.2025",
            status: "completed",
            result: "positive",
          },
          {
            id: "6",
            candidate: {
              name: "Fatma Öztürk",
              department: "Bilgisayar Mühendisliği",
            },
            position: "Dr. Öğretim Üyesi",
            assignedDate: "10.02.2025", // Eklendi
            deadline: "05.03.2025", // Eklendi
            completedDate: "25.02.2025",
            status: "completed",
            result: "negative",
          },
        ]

        setEvaluations(mockEvaluations)

        // Kullanıcıya bilgi ver ama hata gösterme
        toast({
          title: "Bilgi",
          description: "API bağlantısı kurulamadı. Geçici veriler gösteriliyor.",
        })
      }
    } catch (err) {
      console.error("Veri çekme hatası:", err)
      setError("Değerlendirmeler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.")
    } finally {
      setIsLoading(false)
    }
  }

  // Tarih formatlamak için yardımcı fonksiyon
  const formatDate = (dateString: string | undefined | null): string => {
    if (!dateString) return "-"

    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return dateString // Zaten formatlanmış olabilir

      return date.toLocaleDateString("tr-TR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    } catch (error) {
      console.error("Tarih formatı hatası:", error)
      return dateString || "-"
    }
  }

  // Client-side rendering kontrolü
  useEffect(() => {
    setIsClient(true)

    // URL'den status parametresini kontrol et - client-side'da güvenli bir şekilde
    try {
      const urlParams = new URLSearchParams(window.location.search)
      const status = urlParams.get("status")
      if (status === "completed") {
        setActiveTab("completed")
      }
    } catch (e) {
      console.error("URL params error:", e)
    }

    if (isClient) {
      fetchEvaluations()
    }
  }, [isClient])

  // Değerlendirmeleri bekleyen ve tamamlanan olarak ayır
  const pendingEvaluations = evaluations.filter((e) => e.status === "pending")
  const completedEvaluations = evaluations.filter((e) => e.status === "completed")

  // Filter evaluations based on search term
  const filteredPendingEvaluations = pendingEvaluations.filter(
    (evaluation) =>
      evaluation.candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evaluation.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evaluation.candidate.department.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredCompletedEvaluations = completedEvaluations.filter(
    (evaluation) =>
      evaluation.candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evaluation.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evaluation.candidate.department.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Client-side rendering için içerik
  if (!isClient) {
    return (
      <DashboardLayout>
        <div className="grid gap-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Değerlendirmelerim</h1>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Değerlendirme Ara..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue placeholder="Pozisyon" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Pozisyonlar</SelectItem>
                  <SelectItem value="dr">Dr. Öğretim Üyesi</SelectItem>
                  <SelectItem value="docent">Doçent</SelectItem>
                  <SelectItem value="professor">Profesör</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Evaluations */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pending">Bekleyen Değerlendirmeler</TabsTrigger>
            <TabsTrigger value="completed">Tamamlanan Değerlendirmeler</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-6">
            <div className="grid gap-6">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                </div>
              ) : error ? (
                <div className="rounded-md bg-red-50 p-4 text-center text-red-800">{error}</div>
              ) : filteredPendingEvaluations.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-10">
                    <div className="text-center">
                      <h3 className="mt-2 text-lg font-medium">Bekleyen Değerlendirme Bulunamadı</h3>
                      <p className="mt-1 text-sm text-gray-500">Şu anda bekleyen değerlendirmeniz bulunmamaktadır.</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                filteredPendingEvaluations.map((evaluation) => (
                  <Card key={evaluation.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{evaluation.candidate.name}</h3>
                          <p className="text-sm text-gray-500">
                            {evaluation.position} - {evaluation.candidate.department}
                          </p>
                        </div>
                        <Link href={`/dashboard/jury/evaluations/${evaluation.id}`}>
                          <Button>Değerlendir</Button>
                        </Link>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Atanma Tarihi:</span> {evaluation.assignedDate}
                        </div>
                        <div>
                          <span className="font-medium">Son Tarih:</span> {evaluation.deadline}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            <div className="grid gap-6">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                </div>
              ) : error ? (
                <div className="rounded-md bg-red-50 p-4 text-center text-red-800">{error}</div>
              ) : filteredCompletedEvaluations.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-10">
                    <div className="text-center">
                      <h3 className="mt-2 text-lg font-medium">Tamamlanan Değerlendirme Bulunamadı</h3>
                      <p className="mt-1 text-sm text-gray-500">Henüz tamamladığınız değerlendirme bulunmamaktadır.</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                filteredCompletedEvaluations.map((evaluation) => (
                  <Card key={evaluation.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{evaluation.candidate.name}</h3>
                          <p className="text-sm text-gray-500">
                            {evaluation.position} - {evaluation.candidate.department}
                          </p>
                        </div>
                        <div
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            evaluation.result === "positive" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {evaluation.result === "positive" ? "Olumlu" : "Olumsuz"}
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Tamamlanma Tarihi:</span> {evaluation.completedDate}
                        </div>
                        <div className="flex justify-end">
                          <Button variant="outline" size="sm">
                            <FileText className="mr-2 h-4 w-4" />
                            Raporu Görüntüle
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
