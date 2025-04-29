"use client"

import type React from "react"
import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { Search, CheckCircle, XCircle, Clock } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

// Başvuru tipi tanımlayalım
interface Application {
  id: string
  position: string
  department: string
  faculty: string
  applyDate: string
  status: string
  statusText: string
  statusIcon: React.ReactNode
}

export default function CandidateApplications() {
  const [mounted, setMounted] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Başvuruları API'den çeken fonksiyon
  const fetchApplications = async () => {
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
        console.log("API'den başvurular çekiliyor...")
        const response = await fetch("http://localhost:8000/api/applications", {
          headers,
          // 5 saniye timeout ekleyelim
          signal: AbortSignal.timeout(5000),
        })

        if (!response.ok) {
          throw new Error(`API yanıt hatası: ${response.status}`)
        }

        const data = await response.json()
        console.log("API'den başvurular başarıyla alındı:", data)

        // API'den gelen verileri uygulama formatına dönüştür
        const formattedApplications = data.map((app: any) => {
          // Status'a göre icon ve text belirle
          let statusIcon = <Clock key={app.id} className="h-4 w-4 text-yellow-500" />
          let statusText = "Beklemede"

          if (app.status === "approved") {
            statusIcon = <CheckCircle key={app.id} className="h-4 w-4 text-green-500" />
            statusText = "Onaylandı"
          } else if (app.status === "rejected") {
            statusIcon = <XCircle key={app.id} className="h-4 w-4 text-red-500" />
            statusText = "Reddedildi"
          } else if (app.status === "in_review") {
            statusIcon = <Clock key={app.id} className="h-4 w-4 text-blue-500" />
            statusText = "İncelemede"
          }

          return {
            id: app.id.toString(),
            position: app.listing_position,
            department: app.listing_department,
            faculty: app.listing_faculty,
            applyDate: new Date(app.apply_date).toLocaleDateString("tr-TR"),
            status: app.status,
            statusText: statusText,
            statusIcon: statusIcon,
          }
        })

        setApplications(formattedApplications)
      } catch (apiError) {
        console.error("API hatası:", apiError)
        // API hatası durumunda mock veri kullan
        console.log("Mock veri kullanılıyor...")

        // Mock veri
        const mockApplications = [
          {
            id: "1",
            position: "Dr. Öğretim Üyesi",
            department: "Bilgisayar Mühendisliği",
            faculty: "Mühendislik Fakültesi",
            applyDate: "15.03.2025",
            status: "pending",
            statusText: "Beklemede",
            statusIcon: <Clock className="h-4 w-4 text-yellow-500" />,
          },
          {
            id: "2",
            position: "Doçent",
            department: "Elektrik Mühendisliği",
            faculty: "Mühendislik Fakültesi",
            applyDate: "10.03.2025",
            status: "approved",
            statusText: "Onaylandı",
            statusIcon: <CheckCircle className="h-4 w-4 text-green-500" />,
          },
          {
            id: "3",
            position: "Profesör",
            department: "Makine Mühendisliği",
            faculty: "Mühendislik Fakültesi",
            applyDate: "05.03.2025",
            status: "rejected",
            statusText: "Reddedildi",
            statusIcon: <XCircle className="h-4 w-4 text-red-500" />,
          },
          {
            id: "4",
            position: "Dr. Öğretim Üyesi",
            department: "Endüstri Mühendisliği",
            faculty: "Mühendislik Fakültesi",
            applyDate: "01.03.2025",
            status: "pending",
            statusText: "Beklemede",
            statusIcon: <Clock className="h-4 w-4 text-yellow-500" />,
          },
          {
            id: "5",
            position: "Doçent",
            department: "Bilişim Sistemleri Mühendisliği",
            faculty: "Mühendislik Fakültesi",
            applyDate: "25.02.2025",
            status: "approved",
            statusText: "Onaylandı",
            statusIcon: <CheckCircle className="h-4 w-4 text-green-500" />,
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

  // Component mount edildiğinde verileri çek
  useEffect(() => {
    setMounted(true)

    if (mounted) {
      fetchApplications()
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted])

  // Filter applications based on search term and status
  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.department.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || app.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Don't render until component is mounted
  if (!mounted) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Başvurularım</h1>
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
              <Select defaultValue="all" value={statusFilter} onValueChange={setStatusFilter}>
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
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue placeholder="Tarih" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Tarihler</SelectItem>
                  <SelectItem value="last-week">Son 1 Hafta</SelectItem>
                  <SelectItem value="last-month">Son 1 Ay</SelectItem>
                  <SelectItem value="last-3-months">Son 3 Ay</SelectItem>
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
                      <h3 className="font-semibold">{application.position}</h3>
                      <p className="text-sm text-gray-500">
                        {application.department}, {application.faculty}
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
                      <Link href={`/dashboard/candidate/applications/${application.id}`}>
                        <Button variant="outline" size="sm">
                          Detaylar
                        </Button>
                      </Link>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Başvuru Tarihi:</span> {application.applyDate}
                    </div>
                    <div>
                      <span className="font-medium">Başvuru No:</span> {application.id}
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
