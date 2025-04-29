"use client"

import { useEffect, useState } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { FileText, Users, Clock, CheckCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

// Listing tipi tanımlayalım
interface Listing {
  id: string
  position: string
  department: string
  faculty: string
  publishDate: string
  deadline: string
  status: string
  applications: number
}

export default function AdminDashboard() {
  const [mounted, setMounted] = useState(false)
  const [listings, setListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // İstatistik değerlerini hesaplayan fonksiyon
  const calculateStats = (listings: Listing[]) => {
    return {
      total: listings.length,
      active: listings.filter((listing) => listing.status === "active").length,
      expired: listings.filter((listing) => listing.status === "expired").length,
      applications: listings.reduce(
        (total, listing) => total + (Number.isNaN(listing.applications) ? 0 : listing.applications),
        0,
      ),
    }
  }

  // fetchListings fonksiyonunu güncelleyelim - API'den gelen verileri doğru formata dönüştürelim
  const fetchListings = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Mock veri - gerçek API çalışmadığında kullanılacak
      const mockListings = [
        {
          id: "1",
          position: "Dr. Öğretim Üyesi",
          department: "Bilişim Sistemleri Mühendisliği",
          faculty: "Mühendislik Fakültesi",
          publishDate: "01.03.2025",
          deadline: "30.04.2025",
          status: "active",
          applications: 12,
        },
        {
          id: "2",
          position: "Doçent",
          department: "Bilgisayar Mühendisliği",
          faculty: "Mühendislik Fakültesi",
          publishDate: "15.02.2025",
          deadline: "15.05.2025",
          status: "active",
          applications: 8,
        },
        {
          id: "3",
          position: "Profesör",
          department: "Elektrik-Elektronik Mühendisliği",
          faculty: "Mühendislik Fakültesi",
          publishDate: "10.02.2025",
          deadline: "20.05.2025",
          status: "active",
          applications: 4,
        },
      ]

      // API çağrısını try-catch içinde yap
      try {
        console.log("API'den veri çekiliyor...")

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

        const response = await fetch("http://localhost:8000/api/listings", {
          headers,
          // 3 saniye timeout ekleyelim
          signal: AbortSignal.timeout(3000),
        })

        if (!response.ok) {
          throw new Error(`API yanıt hatası: ${response.status}`)
        }

        const data = await response.json()
        console.log("API'den veri başarıyla alındı:", data)

        // API'den gelen verileri formatlayalım
        const formattedData = data.map((item: any) => ({
          ...item,
          // Tarihleri formatlayalım
          publishDate: formatDate(item.publish_date || item.publishDate),
          deadline: formatDate(item.deadline),
          // Başvuru sayısını güvenli hale getirelim
          applications:
            typeof item.applications_count === "number"
              ? item.applications_count
              : typeof item.applications === "number"
                ? item.applications
                : 0,
        }))

        setListings(formattedData)
      } catch (apiError) {
        console.error("API hatası:", apiError)
        // API hatası durumunda mock veri kullan
        console.log("Mock veri kullanılıyor...")
        setListings(mockListings)

        // Kullanıcıya bilgi ver ama hata gösterme
        toast({
          title: "Bilgi",
          description: "API bağlantısı kurulamadı. Geçici veriler gösteriliyor.",
        })
      }
    } catch (err) {
      console.error("Veri çekme hatası:", err)
      setError("İlanlar yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.")
    } finally {
      setIsLoading(false)
    }
  }

  // Tarih formatlamak için yardımcı fonksiyon
  const formatDate = (dateString: string | undefined | null): string => {
    if (!dateString) return "-"

    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return "-"

      return date.toLocaleDateString("tr-TR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    } catch (error) {
      console.error("Tarih formatı hatası:", error)
      return "-"
    }
  }

  // useEffect içinde mounted kontrolü ekleyelim
  useEffect(() => {
    setMounted(true)

    // Sadece component mount edildikten sonra veri çek
    if (mounted) {
      fetchListings()
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted])

  // İstatistikleri hesapla
  const listingStats = calculateStats(listings)

  // Son 3 ilanı göster
  const recentListings = listings.slice(0, 3)

  // Client-side rendering için içerik
  if (!mounted) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Admin Paneli</h1>
          <Link href="/dashboard/admin/listings/new">
            <Button>Yeni İlan Ekle</Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Toplam İlan</CardTitle>
              <FileText className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{listingStats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Aktif İlanlar</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{listingStats.active}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Süresi Dolmuş</CardTitle>
              <Clock className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{listingStats.expired}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Toplam Başvuru</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{listingStats.applications}</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Listings */}
        <Card>
          <CardHeader>
            <CardTitle>Son İlanlar</CardTitle>
            <CardDescription>Yakın zamanda oluşturulan ilanlar</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              </div>
            ) : error ? (
              <div className="rounded-md bg-red-50 p-4 text-center text-red-800">{error}</div>
            ) : listings.length === 0 ? (
              <div className="rounded-md border border-dashed p-8 text-center">
                <p className="text-sm text-gray-500">Henüz ilan bulunmamaktadır.</p>
                <Link href="/dashboard/admin/listings/new">
                  <Button variant="outline" className="mt-4">
                    Yeni İlan Ekle
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentListings.map((listing) => (
                  <div key={listing.id} className="rounded-lg border p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{listing.position}</h3>
                        <p className="text-sm text-gray-500">{listing.department}</p>
                      </div>
                      <Link href={`/dashboard/admin/listings/${listing.id}`}>
                        <Button variant="outline">Düzenle</Button>
                      </Link>
                    </div>
                    {/* Listeleme kısmını güncelleyelim */}
                    <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="font-medium">Yayın Tarihi:</span> {listing.publishDate || "-"}
                      </div>
                      <div>
                        <span className="font-medium">Son Başvuru Tarihi:</span> {listing.deadline || "-"}
                      </div>
                      <div>
                        <span className="font-medium">Başvuru Sayısı:</span>{" "}
                        {typeof listing.applications === "number"
                          ? listing.applications
                          : typeof listing.applications === "string" && !isNaN(Number.parseInt(listing.applications))
                            ? Number.parseInt(listing.applications)
                            : 0}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 text-center">
              <Link href="/dashboard/admin/listings">
                <Button variant="outline">Tüm İlanları Görüntüle</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
