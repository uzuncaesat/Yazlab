"use client"

import { useEffect, useState } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { FileText, Clock, CheckCircle, XCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-hooks"
import { toast } from "@/components/ui/use-toast"

export default function CandidateDashboard() {
  const { user, isLoading } = useAuth()
  const [mounted, setMounted] = useState(false)
  // Mock data yerine state'ler kullanalım
  const [applicationStats, setApplicationStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  })

  const [recentApplications, setRecentApplications] = useState<any[]>([])
  const [activeListings, setActiveListings] = useState<any[]>([])

  // Aday paneli ana sayfasında API çağrılarını ekleyelim
  // Mevcut mock veri yerine API'den veri çekecek şekilde güncelleyelim

  // useEffect içinde API çağrısı ekleyelim
  useEffect(() => {
    setMounted(true)

    if (mounted) {
      // API'den verileri çekelim
      fetchDashboardData()
    }
  }, [mounted])

  // fetchDashboardData fonksiyonunu tamamen değiştirelim ve ayrı API çağrıları ekleyelim
  const fetchDashboardData = async () => {
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

      // İstatistikleri, başvuruları ve aktif ilanları paralel olarak çekelim
      try {
        console.log("API'den aday dashboard verileri çekiliyor...")

        // Başvuruları çek - istatistikleri hesaplamak için de kullanacağız
        const applicationsPromise = fetch("http://localhost:8000/api/applications", {
          headers,
          signal: AbortSignal.timeout(5000),
        })

        // Aktif ilanları çek
        const listingsPromise = fetch("http://localhost:8000/api/listings?status=active", {
          headers,
          signal: AbortSignal.timeout(5000),
        })

        // Paralel olarak tüm istekleri yap
        const [applicationsResponse, listingsResponse] = await Promise.all([applicationsPromise, listingsPromise])

        // Başvuruları işle
        if (applicationsResponse.ok) {
          const applicationsData = await applicationsResponse.json()
          console.log("API'den başvurular başarıyla alındı:", applicationsData)

          // İstatistikleri hesapla
          const total = applicationsData.length
          const pending = applicationsData.filter((app: any) => app.status === "pending").length
          const approved = applicationsData.filter((app: any) => app.status === "approved").length
          const rejected = applicationsData.filter((app: any) => app.status === "rejected").length

          setApplicationStats({
            total,
            pending,
            approved,
            rejected,
          })

          // Son 3 başvuruyu al ve formatla
          const recentApps = applicationsData.slice(0, 3).map((app: any) => ({
            id: app.id.toString(),
            position: app.listing_position || "Belirtilmemiş",
            department: app.listing_department || "Belirtilmemiş",
            date: formatDate(app.apply_date),
            status:
              app.status === "pending"
                ? "Beklemede"
                : app.status === "in_review"
                  ? "İncelemede"
                  : app.status === "approved"
                    ? "Onaylandı"
                    : "Reddedildi",
          }))

          setRecentApplications(recentApps)
        }

        // Aktif ilanları işle
        if (listingsResponse.ok) {
          const listingsData = await listingsResponse.json()
          console.log("API'den aktif ilanlar başarıyla alındı:", listingsData)

          // En fazla 3 aktif ilanı al ve formatla
          const activeListingsData = listingsData.slice(0, 3).map((listing: any) => ({
            id: listing.id.toString(),
            position: listing.position || "Belirtilmemiş",
            department: listing.department || "Belirtilmemiş",
            deadline: formatDate(listing.deadline),
          }))

          setActiveListings(activeListingsData)
        }

        console.log("Dashboard verileri başarıyla yüklendi")
      } catch (apiError) {
        console.error("API hatası:", apiError)
        console.log("Mock veri kullanılıyor...")
        // Mock veri kullanmaya devam ediyoruz - mevcut state'leri değiştirmiyoruz

        toast({
          title: "Bağlantı Hatası",
          description: "Sunucuya bağlanılamadı. Geçici veriler gösteriliyor.",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Veri çekme hatası:", err)
    }
  }

  // Tarih formatlamak için yardımcı fonksiyon ekleyelim
  const formatDate = (dateString: string | undefined | null): string => {
    if (!dateString) return "-"

    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return dateString || "-" // Zaten formatlanmış olabilir

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

  // Mock data for demonstration
  // const applicationStats = {
  //   total: 5,
  //   pending: 2,
  //   approved: 2,
  //   rejected: 1,
  // }

  // const recentApplications = [
  //   {
  //     id: "1",
  //     position: "Dr. Öğretim Üyesi",
  //     department: "Bilgisayar Mühendisliği",
  //     date: "15.03.2025",
  //     status: "Beklemede",
  //   },
  //   {
  //     id: "2",
  //     position: "Doçent",
  //     department: "Elektrik Mühendisliği",
  //     date: "10.03.2025",
  //     status: "Onaylandı",
  //   },
  //   {
  //     id: "3",
  //     position: "Profesör",
  //     department: "Makine Mühendisliği",
  //     date: "05.03.2025",
  //     status: "Reddedildi",
  //   },
  // ]

  // const activeListings = [
  //   {
  //     id: "1",
  //     position: "Dr. Öğretim Üyesi",
  //     department: "Bilişim Sistemleri Mühendisliği",
  //     deadline: "30.04.2025",
  //   },
  //   {
  //     id: "2",
  //     position: "Doçent",
  //     department: "Bilgisayar Mühendisliği",
  //     deadline: "15.05.2025",
  //   },
  //   {
  //     id: "3",
  //     position: "Profesör",
  //     department: "Elektrik-Elektronik Mühendisliği",
  //     deadline: "20.05.2025",
  //   },
  // ]

  // Don't render until component is mounted
  if (!mounted) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="grid gap-6">
        <h1 className="text-2xl font-bold">Aday Paneli</h1>

        {/* Stats bölümünü de state'e bağlayalım */}
        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Toplam Başvuru</CardTitle>
              <FileText className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{applicationStats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Bekleyen</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{applicationStats.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Onaylanan</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{applicationStats.approved}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Reddedilen</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{applicationStats.rejected}</div>
            </CardContent>
          </Card>
        </div>

        {/* Active Listings */}
        <Card>
          <CardHeader>
            <CardTitle>Aktif İlanlar</CardTitle>
            <CardDescription>Başvurabileceğiniz mevcut akademik ilanlar</CardDescription>
          </CardHeader>
          <CardContent>
            {activeListings.length === 0 ? (
              <div className="rounded-md border border-dashed p-8 text-center">
                <p className="text-sm text-gray-500">Aktif ilan bulunmamaktadır.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeListings.map((listing) => (
                  <div key={listing.id} className="rounded-lg border p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{listing.position}</h3>
                        <p className="text-sm text-gray-500">{listing.department}</p>
                      </div>
                      <Button asChild>
                        <Link href={`/dashboard/candidate/listings/${listing.id}`}>Başvur</Link>
                      </Button>
                    </div>
                    <div className="mt-2 text-sm">
                      <span className="font-medium">Son Başvuru:</span> {listing.deadline}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 text-center">
              <Link href="/dashboard/candidate/listings">
                <Button variant="outline">Tüm İlanları Görüntüle</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Applications */}
        <Card>
          <CardHeader>
            <CardTitle>Son Başvurularım</CardTitle>
            <CardDescription>Yakın zamanda yaptığınız başvurular</CardDescription>
          </CardHeader>
          <CardContent>
            {recentApplications.length === 0 ? (
              <div className="rounded-md border border-dashed p-8 text-center">
                <p className="text-sm text-gray-500">Henüz başvuru yapmadınız.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentApplications.map((application) => (
                  <div key={application.id} className="rounded-lg border p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{application.position}</h3>
                        <p className="text-sm text-gray-500">{application.department}</p>
                      </div>
                      <div
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          application.status === "Beklemede"
                            ? "bg-yellow-100 text-yellow-800"
                            : application.status === "İncelemede"
                              ? "bg-blue-100 text-blue-800"
                              : application.status === "Onaylandı"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                        }`}
                      >
                        {application.status}
                      </div>
                    </div>
                    <div className="mt-2 text-sm">
                      <span className="font-medium">Başvuru Tarihi:</span> {application.date}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 text-center">
              <Link href="/dashboard/candidate/applications">
                <Button variant="outline">Tüm Başvurularımı Görüntüle</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
