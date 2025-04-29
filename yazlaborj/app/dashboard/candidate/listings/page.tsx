// İlanlar sayfasını client component olarak değiştirelim ve API çağrısı ekleyelim
"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { Search } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function CandidateListings() {
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [positionFilter, setPositionFilter] = useState("all")
  const [facultyFilter, setFacultyFilter] = useState("all")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [listings, setListings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // İlanları API'den çeken fonksiyon
  const fetchListings = async () => {
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
        console.log("API'den ilanlar çekiliyor...")
        const response = await fetch("http://localhost:8000/api/listings?status=active", {
          headers,
          // 5 saniye timeout ekleyelim
          signal: AbortSignal.timeout(5000),
        })

        if (!response.ok) {
          throw new Error(`API yanıt hatası: ${response.status}`)
        }

        const data = await response.json()
        console.log("API'den ilanlar başarıyla alındı:", data)

        // API'den gelen verileri uygulama formatına dönüştür
        const formattedListings = data.map((listing: any) => ({
          id: listing.id.toString(),
          position: listing.position || "Belirtilmemiş",
          department: listing.department || "Belirtilmemiş",
          faculty: listing.faculty || "Belirtilmemiş",
          publishDate: formatDate(listing.publish_date),
          deadline: formatDate(listing.deadline),
          requirements: listing.requirements || "Belirtilmemiş",
        }))

        setListings(formattedListings)
      } catch (apiError) {
        console.error("API hatası:", apiError)
        // API hatası durumunda mock veri kullan
        console.log("Mock veri kullanılıyor...")

        // Mock veri
        const mockListings = [
          {
            id: "1",
            position: "Dr. Öğretim Üyesi",
            department: "Bilişim Sistemleri Mühendisliği",
            faculty: "Mühendislik Fakültesi",
            publishDate: "01.03.2025",
            deadline: "30.04.2025",
            requirements: "Doktora derecesine sahip olmak, en az 2 adet SCI/SSCI/AHCI indeksli yayın yapmış olmak.",
          },
          {
            id: "2",
            position: "Doçent",
            department: "Bilgisayar Mühendisliği",
            faculty: "Mühendislik Fakültesi",
            publishDate: "15.02.2025",
            deadline: "15.05.2025",
            requirements: "Doçentlik unvanına sahip olmak, en az 5 adet SCI/SSCI/AHCI indeksli yayın yapmış olmak.",
          },
          {
            id: "3",
            position: "Profesör",
            department: "Elektrik-Elektronik Mühendisliği",
            faculty: "Mühendislik Fakültesi",
            publishDate: "10.02.2025",
            deadline: "20.05.2025",
            requirements: "Profesörlük unvanına sahip olmak, en az 10 adet SCI/SSCI/AHCI indeksli yayın yapmış olmak.",
          },
          {
            id: "4",
            position: "Dr. Öğretim Üyesi",
            department: "Makine Mühendisliği",
            faculty: "Mühendislik Fakültesi",
            publishDate: "05.02.2025",
            deadline: "05.05.2025",
            requirements: "Doktora derecesine sahip olmak, en az 2 adet SCI/SSCI/AHCI indeksli yayın yapmış olmak.",
          },
          {
            id: "5",
            position: "Dr. Öğretim Üyesi",
            department: "Endüstri Mühendisliği",
            faculty: "Mühendislik Fakültesi",
            publishDate: "20.02.2025",
            deadline: "20.04.2025",
            requirements: "Doktora derecesine sahip olmak, en az 3 adet SCI/SSCI/AHCI indeksli yayın yapmış olmak.",
          },
        ]

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

  useEffect(() => {
    setMounted(true)

    if (mounted) {
      fetchListings()
    }
  }, [mounted])

  // Filter listings based on search term and filters
  const filteredListings = listings.filter((listing) => {
    const matchesSearch =
      listing.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.faculty.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesPosition =
      positionFilter === "all" ||
      (positionFilter === "dr" && listing.position.includes("Dr. Öğretim Üyesi")) ||
      (positionFilter === "docent" && listing.position.includes("Doçent")) ||
      (positionFilter === "professor" && listing.position.includes("Profesör"))

    const matchesFaculty = facultyFilter === "all" || listing.faculty.includes(facultyFilter)
    const matchesDepartment = departmentFilter === "all" || listing.department.includes(departmentFilter)

    return matchesSearch && matchesPosition && matchesFaculty && matchesDepartment
  })

  // Don't render until component is mounted
  if (!mounted) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Akademik İlanlar</h1>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-4">
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
              <Select value={positionFilter} onValueChange={setPositionFilter}>
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
              <Select value={facultyFilter} onValueChange={setFacultyFilter}>
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
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Bölüm" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Bölümler</SelectItem>
                  <SelectItem value="Bilgisayar">Bilgisayar Mühendisliği</SelectItem>
                  <SelectItem value="Elektrik">Elektrik-Elektronik Mühendisliği</SelectItem>
                  <SelectItem value="Makine">Makine Mühendisliği</SelectItem>
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
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{listing.position}</CardTitle>
                      <CardDescription>
                        {listing.department} - {listing.faculty}
                      </CardDescription>
                    </div>
                    <Button asChild>
                      <Link href={`/dashboard/candidate/listings/${listing.id}`}>Detaylar</Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold">Gereksinimler</h3>
                      <p className="text-sm text-gray-600">{listing.requirements}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">İlan Tarihi:</span> {listing.publishDate}
                      </div>
                      <div>
                        <span className="font-medium">Son Başvuru Tarihi:</span> {listing.deadline}
                      </div>
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
