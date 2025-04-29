"use client"

import type React from "react"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { Search, CheckCircle, XCircle, Clock, User } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-hooks"

// Başvuru tipi tanımlayalım
interface Application {
  id: string
  candidate: {
    name: string
    department: string
  }
  position: string
  applyDate: string
  status: string
  statusText: string
  statusIcon: React.ReactNode
  juryAssigned: boolean
  juryReviews: number
  totalJury: number
}

export default function ManagerEvaluations() {
  const [mounted, setMounted] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [positionFilter, setPositionFilter] = useState("all")
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const { getToken } = useAuth()

  // Başvuruları API'den çeken fonksiyon
  const fetchApplications = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Kullanıcı token'ını al
      const userToken = getToken()

      if (!userToken) {
        console.error("Token bulunamadı! Kullanıcı giriş yapmamış olabilir.")
        toast({
          variant: "destructive",
          title: "Yetkilendirme Hatası",
          description: "Oturumunuz sonlanmış olabilir. Lütfen tekrar giriş yapın.",
        })
        setError("Yetkilendirme hatası. Lütfen tekrar giriş yapın.")
        setIsLoading(false)
        return
      }

      // API isteği için headers oluştur
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      }

      console.log("API isteği için token:", userToken)
      console.log("API isteği için headers:", headers)

      // API'ye istek at
      try {
        console.log("API'den başvurular çekiliyor...")

        // API URL'ini çevre değişkenine göre ayarlayalım
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
        const API_ENDPOINT = `${API_BASE_URL}/api/applications`

        console.log(`API isteği gönderiliyor: ${API_ENDPOINT}`)

        const response = await fetch(API_ENDPOINT, {
          method: "GET",
          headers,
          // 10 saniye timeout ekleyelim
          signal: AbortSignal.timeout(10000),
        })

        if (response.status === 401) {
          console.error("Yetkilendirme hatası: 401 Unauthorized")
          throw new Error("Yetkilendirme hatası. Lütfen tekrar giriş yapın.")
        }

        if (!response.ok) {
          console.error(`API yanıt hatası: ${response.status} - ${response.statusText}`)
          const errorText = await response.text()
          console.error("API hata detayı:", errorText)
          throw new Error(`API yanıt hatası: ${response.status}`)
        }

        const data = await response.json()
        console.log("API'den başvurular başarıyla alındı:", data)

        // API'den gelen verileri uygulama formatına dönüştür
        const formattedApplications = data.map((app: any) => {
          // Status'a göre icon ve text belirle
          let statusIcon = <Clock className="h-4 w-4 text-yellow-500" key={app.id} />
          let statusText = "Beklemede"

          if (app.status === "in_review") {
            statusIcon = <User className="h-4 w-4 text-blue-500" key={app.id} />
            statusText = "İncelemede"
          } else if (app.status === "approved") {
            statusIcon = <CheckCircle className="h-4 w-4 text-green-500" key={app.id} />
            statusText = "Onaylandı"
          } else if (app.status === "rejected") {
            statusIcon = <XCircle className="h-4 w-4 text-red-500" key={app.id} />
            statusText = "Reddedildi"
          }

          return {
            id: app.id.toString(),
            candidate: {
              name: app.candidate_name || "İsimsiz Aday",
              department: app.listing_department || "Belirtilmemiş",
            },
            position: app.listing_position || "Belirtilmemiş",
            applyDate: formatDate(app.apply_date),
            status: app.status,
            statusText: statusText,
            statusIcon: statusIcon,
            juryAssigned: app.evaluations?.length > 0 || false,
            juryReviews: app.evaluations?.filter((e: any) => e.is_completed).length || 0,
            totalJury: app.evaluations?.length || 0,
          }
        })

        setApplications(formattedApplications)
      } catch (apiError) {
        console.error("API hatası:", apiError)

        // Hata türünü kontrol edelim
        let errorMessage = "API bağlantısı kurulamadı."

        if (apiError instanceof Error) {
          if (apiError.message.includes("Yetkilendirme hatası")) {
            errorMessage = "Oturumunuz sonlanmış olabilir. Lütfen tekrar giriş yapın."
            setError("Yetkilendirme hatası. Lütfen tekrar giriş yapın.")
          } else if (apiError.message === "Failed to fetch") {
            errorMessage = "Backend sunucusuna bağlanılamadı. Sunucunun çalıştığından emin olun."
          } else if (apiError instanceof DOMException && apiError.name === "AbortError") {
            errorMessage = "İstek zaman aşımına uğradı. Lütfen internet bağlantınızı kontrol edin."
          }
        }

        // Kullanıcıya bilgi ver
        toast({
          title: "Bağlantı Hatası",
          description: errorMessage,
          variant: "destructive",
        })

        // Mock veri kullan
        console.log("Mock veri kullanılıyor...")

        // Mock veri
        const mockApplications = [
          {
            id: "1",
            candidate: {
              name: "Ahmet Yılmaz",
              department: "Bilişim Sistemleri Mühendisliği",
            },
            position: "Dr. Öğretim Üyesi",
            applyDate: "15.03.2025",
            status: "pending",
            statusText: "Beklemede",
            statusIcon: <Clock className="h-4 w-4 text-yellow-500" />,
            juryAssigned: true,
            juryReviews: 2,
            totalJury: 5,
          },
          {
            id: "2",
            candidate: {
              name: "Ayşe Demir",
              department: "Bilgisayar Mühendisliği",
            },
            position: "Doçent",
            applyDate: "10.03.2025",
            status: "in_review",
            statusText: "İncelemede",
            statusIcon: <User className="h-4 w-4 text-blue-500" />,
            juryAssigned: true,
            juryReviews: 5,
            totalJury: 5,
          },
          {
            id: "3",
            candidate: {
              name: "Mehmet Kaya",
              department: "Elektrik-Elektronik Mühendisliği",
            },
            position: "Profesör",
            applyDate: "05.03.2025",
            status: "approved",
            statusText: "Onaylandı",
            statusIcon: <CheckCircle className="h-4 w-4 text-green-500" />,
            juryAssigned: true,
            juryReviews: 5,
            totalJury: 5,
          },
          {
            id: "4",
            candidate: {
              name: "Zeynep Şahin",
              department: "Makine Mühendisliği",
            },
            position: "Dr. Öğretim Üyesi",
            applyDate: "01.03.2025",
            status: "rejected",
            statusText: "Reddedildi",
            statusIcon: <XCircle className="h-4 w-4 text-red-500" />,
            juryAssigned: true,
            juryReviews: 5,
            totalJury: 5,
          },
          {
            id: "5",
            candidate: {
              name: "Ali Yıldız",
              department: "Endüstri Mühendisliği",
            },
            position: "Doçent",
            applyDate: "25.02.2025",
            status: "pending",
            statusText: "Beklemede",
            statusIcon: <Clock className="h-4 w-4 text-yellow-500" />,
            juryAssigned: false,
            juryReviews: 0,
            totalJury: 0,
          },
        ]

        setApplications(mockApplications)

        // Kullanıcıya bilgi ver ama hata gösterme
        toast({
          title: "Bilgi",
          description: "API bağlantısı kurulamadı. Geçici veriler gösteriliyor.",
        })
      }
    } catch (err) {
      console.error("Veri çekme hatası:", err)
      setError("Başvurular yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.")
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

  useEffect(() => {
    setMounted(true)

    if (mounted) {
      fetchApplications()
    }
  }, [mounted])

  // Filter applications based on search term and status
  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.candidate.department.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || app.status === statusFilter
    const matchesPosition = positionFilter === "all" || app.position.includes(positionFilter)

    return matchesSearch && matchesStatus && matchesPosition
  })

  // Don't render until component is mounted
  if (!mounted) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Başvuru Değerlendirmeleri</h1>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Başvuru Ara..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Durum" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Durumlar</SelectItem>
                  <SelectItem value="pending">Beklemede</SelectItem>
                  <SelectItem value="in_review">İncelemede</SelectItem>
                  <SelectItem value="approved">Onaylandı</SelectItem>
                  <SelectItem value="rejected">Reddedildi</SelectItem>
                </SelectContent>
              </Select>
              <Select value={positionFilter} onValueChange={setPositionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Pozisyon" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Pozisyonlar</SelectItem>
                  <SelectItem value="Dr. Öğretim Üyesi">Dr. Öğretim Üyesi</SelectItem>
                  <SelectItem value="Doçent">Doçent</SelectItem>
                  <SelectItem value="Profesör">Profesör</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Applications */}
        <div className="grid gap-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="rounded-md bg-red-50 p-4 text-center text-red-800">{error}</div>
          ) : filteredApplications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <div className="text-center">
                  <h3 className="mt-2 text-lg font-medium">Başvuru Bulunamadı</h3>
                  <p className="mt-1 text-sm text-gray-500">Arama kriterlerinize uygun başvuru bulunamadı.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredApplications.map((application) => (
              <Card key={application.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{application.candidate.name}</h3>
                      <p className="text-sm text-gray-500">
                        {application.position} - {application.candidate.department}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          application.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : application.status === "in_review"
                              ? "bg-blue-100 text-blue-800"
                              : application.status === "approved"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                        }`}
                      >
                        {application.statusIcon}
                        <span className="ml-1">{application.statusText}</span>
                      </div>
                      <Link href={`/dashboard/manager/evaluations/${application.id}`}>
                        <Button>İncele</Button>
                      </Link>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Başvuru Tarihi:</span> {application.applyDate}
                    </div>
                    <div>
                      <span className="font-medium">Jüri Durumu:</span>{" "}
                      {application.juryAssigned ? (
                        <span className="text-blue-600">
                          {application.juryReviews}/{application.totalJury} Değerlendirme
                        </span>
                      ) : (
                        <span className="text-red-600">Jüri Atanmadı</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
