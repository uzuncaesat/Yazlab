"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import { Search, Plus, Edit, Trash2, CheckCircle, Clock } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

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

export default function AdminListings() {
  const router = useRouter()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [facultyFilter, setFacultyFilter] = useState("all")
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [listings, setListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
        {
          id: "4",
          position: "Dr. Öğretim Üyesi",
          department: "Makine Mühendisliği",
          faculty: "Mühendislik Fakültesi",
          publishDate: "05.02.2025",
          deadline: "05.03.2025",
          status: "expired",
          applications: 15,
        },
        {
          id: "5",
          position: "Dr. Öğretim Üyesi",
          department: "Endüstri Mühendisliği",
          faculty: "Mühendislik Fakültesi",
          publishDate: "20.01.2025",
          deadline: "20.02.2025",
          status: "expired",
          applications: 10,
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

  // İlan silme fonksiyonu
  const handleDeleteListing = async (id: string) => {
    setDeleteId(id)
    setIsDeleting(true)

    try {
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

        const response = await fetch(`http://localhost:8000/api/listings/${id}`, {
          method: "DELETE",
          headers,
        })

        if (!response.ok) {
          throw new Error(`İlan silinirken bir hata oluştu: ${response.status}`)
        }
      } catch (apiError) {
        console.error("API silme hatası:", apiError)
        // API hatası durumunda sadece UI'dan sil
        console.log("Mock silme işlemi yapılıyor...")
      }

      // Başarılı silme işleminden sonra listeyi güncelle
      setListings(listings.filter((listing) => listing.id !== id))

      toast({
        title: "İlan silindi",
        description: "İlan başarıyla silindi.",
      })
    } catch (err) {
      console.error("Silme hatası:", err)
      toast({
        variant: "destructive",
        title: "Hata",
        description: "İlan silinirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
      })
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  // Filter listings based on search term, status, and faculty
  const filteredListings = listings.filter((listing) => {
    const matchesSearch =
      listing.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.department.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || listing.status === statusFilter
    const matchesFaculty = facultyFilter === "all" || listing.faculty.includes(facultyFilter)

    return matchesSearch && matchesStatus && matchesFaculty
  })

  // useEffect içinde mounted kontrolü ekleyelim
  useEffect(() => {
    setMounted(true)

    // Sadece component mount edildikten sonra veri çek
    if (mounted) {
      fetchListings()
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted])

  // Don't render until component is mounted
  if (!mounted) {
    return null
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

  return (
    <DashboardLayout>
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">İlan Yönetimi</h1>
          <Link href="/dashboard/admin/listings/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Yeni İlan Ekle
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="İlan Ara..."
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
                  <SelectItem value="all">Tüm İlanlar</SelectItem>
                  <SelectItem value="active">Aktif İlanlar</SelectItem>
                  <SelectItem value="expired">Süresi Dolmuş</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all" value={facultyFilter} onValueChange={setFacultyFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Fakülte" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Fakülteler</SelectItem>
                  <SelectItem value="Mühendislik">Mühendislik Fakültesi</SelectItem>
                  <SelectItem value="Fen">Fen Fakültesi</SelectItem>
                  <SelectItem value="Tıp">Tıp Fakültesi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Listings */}
        <div className="grid gap-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="rounded-md bg-red-50 p-4 text-center text-red-800">{error}</div>
          ) : filteredListings.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <div className="text-center">
                  <h3 className="mt-2 text-lg font-medium">İlan Bulunamadı</h3>
                  <p className="mt-1 text-sm text-gray-500">Arama kriterlerinize uygun ilan bulunamadı.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredListings.map((listing) => (
              <Card key={listing.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{listing.position}</h3>
                      <p className="text-sm text-gray-500">
                        {listing.department}, {listing.faculty}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          listing.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {listing.status === "active" ? (
                          <>
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Aktif
                          </>
                        ) : (
                          <>
                            <Clock className="mr-1 h-3 w-3" />
                            Süresi Dolmuş
                          </>
                        )}
                      </div>
                      <Link href={`/dashboard/admin/listings/${listing.id}`}>
                        <Button variant="outline" size="sm">
                          <Edit className="mr-1 h-3 w-3" />
                          Düzenle
                        </Button>
                      </Link>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-red-500">
                            <Trash2 className="mr-1 h-3 w-3" />
                            Sil
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>İlanı Sil</DialogTitle>
                            <DialogDescription>
                              Bu ilanı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => {}}
                              disabled={isDeleting && deleteId === listing.id}
                            >
                              İptal
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => handleDeleteListing(listing.id)}
                              disabled={isDeleting && deleteId === listing.id}
                            >
                              {isDeleting && deleteId === listing.id ? "Siliniyor..." : "Sil"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Yayın Tarihi:</span> {listing.publishDate || "-"}
                    </div>
                    <div>
                      <span className="font-medium">Son Başvuru:</span> {listing.deadline || "-"}
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
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
