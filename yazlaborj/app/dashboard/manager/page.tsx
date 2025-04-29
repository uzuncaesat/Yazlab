"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { FileText, Users, Clock, CheckCircle, XCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

// Başvuru tipi tanımlayalım
interface Application {
  id: string
  candidate: {
    name: string
    department: string
  }
  position: string
  date: string
  juryAssigned: boolean
  juryReviews: number
  totalJury: number
}

// Kriter tipi tanımlayalım
interface Criteria {
  id: string
  name: string
  lastUpdated: string
}

// Jüri grubu tipi tanımlayalım
interface JuryGroup {
  id: string
  department: string
  juryCount: number
}

export default function ManagerDashboard() {
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pendingApplications, setPendingApplications] = useState<Application[]>([])
  const [criteriaGroups, setCriteriaGroups] = useState<Criteria[]>([])
  const [juryGroups, setJuryGroups] = useState<JuryGroup[]>([])
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inReview: 0,
    approved: 0,
    rejected: 0,
  })
  const { toast } = useToast()

  // Bekleyen başvuruları API'den çeken fonksiyon
  const fetchPendingApplications = async () => {
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
        console.log("API'den bekleyen başvurular çekiliyor...")
        const response = await fetch("http://localhost:8000/api/applications?status=pending", {
          headers,
          // 5 saniye timeout ekleyelim
          signal: AbortSignal.timeout(5000),
        })

        if (!response.ok) {
          throw new Error(`API yanıt hatası: ${response.status}`)
        }

        const data = await response.json()
        console.log("API'den bekleyen başvurular başarıyla alındı:", data)

        // API'den gelen verileri uygulama formatına dönüştür
        const formattedApplications = data.slice(0, 3).map((app: any) => ({
          id: app.id.toString(),
          candidate: {
            name: app.candidate_name || "İsimsiz Aday",
            department: app.listing_department || "Belirtilmemiş",
          },
          position: app.listing_position || "Belirtilmemiş",
          date: formatDate(app.apply_date),
          juryAssigned: app.evaluations?.length > 0 || false,
          juryReviews: app.evaluations?.filter((e: any) => e.is_completed).length || 0,
          totalJury: app.evaluations?.length || 0,
        }))

        setPendingApplications(formattedApplications)
      } catch (apiError) {
        console.error("API hatası:", apiError)
        // API hatası durumunda mock veri kullan
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
            date: "15.03.2025",
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
            date: "10.03.2025",
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
            date: "05.03.2025",
            juryAssigned: false,
            juryReviews: 0,
            totalJury: 0,
          },
        ]

        setPendingApplications(mockApplications)
      }
    } catch (err) {
      console.error("Bekleyen başvurular çekme hatası:", err)
      setError("Bekleyen başvurular yüklenirken bir hata oluştu.")
    }
  }

  // Kriter gruplarını API'den çeken fonksiyon
  const fetchCriteriaGroups = async () => {
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
        console.log("API'den kriter grupları çekiliyor...")
        const response = await fetch("http://localhost:8000/api/criteria", {
          headers,
          // 5 saniye timeout ekleyelim
          signal: AbortSignal.timeout(5000),
        })

        if (!response.ok) {
          throw new Error(`API yanıt hatası: ${response.status}`)
        }

        const data = await response.json()
        console.log("API'den kriter grupları başarıyla alındı:", data)

        // Kriter gruplarını pozisyon tipine göre grupla
        const positionTypes = [...new Set(data.map((item: any) => item.position_type))]

        // Her pozisyon tipi için bir kriter grubu oluştur
        const criteriaByPosition = positionTypes.map((positionType) => ({
          id: positionType as string,
          name:
            (positionType as string) === "Dr. Öğretim Üyesi"
              ? "Dr. Öğretim Üyesi Kriterleri"
              : (positionType as string) === "Doçent"
                ? "Doçent Kriterleri"
                : "Profesör Kriterleri",
          lastUpdated: "01.02.2025", // API'den tarih bilgisi gelmiyorsa varsayılan değer
        }))

        setCriteriaGroups(criteriaByPosition)
      } catch (apiError) {
        console.error("API hatası:", apiError)
        // API hatası durumunda mock veri kullan
        console.log("Mock veri kullanılıyor...")

        // Mock veri
        const mockCriteriaGroups = [
          {
            id: "1",
            name: "Dr. Öğretim Üyesi Kriterleri",
            lastUpdated: "01.02.2025",
          },
          {
            id: "2",
            name: "Doçent Kriterleri",
            lastUpdated: "01.02.2025",
          },
          {
            id: "3",
            name: "Profesör Kriterleri",
            lastUpdated: "01.02.2025",
          },
        ]

        setCriteriaGroups(mockCriteriaGroups)
      }
    } catch (err) {
      console.error("Kriter grupları çekme hatası:", err)
      setError("Kriter grupları yüklenirken bir hata oluştu.")
    }
  }

  // Jüri gruplarını API'den çeken fonksiyon
  const fetchJuryGroups = async () => {
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
        console.log("API'den jüri grupları çekiliyor...")
        const response = await fetch("http://localhost:8000/api/jury/assignments", {
          headers,
          // 5 saniye timeout ekleyelim
          signal: AbortSignal.timeout(5000),
        })

        if (!response.ok) {
          throw new Error(`API yanıt hatası: ${response.status}`)
        }

        const data = await response.json()
        console.log("API'den jüri grupları başarıyla alındı:", data)

        // Jüri gruplarını bölüme göre grupla
        const departments = [...new Set(data.map((item: any) => item.department))]

        // Her bölüm için bir jüri grubu oluştur ve o bölümdeki jüri sayısını hesapla
        const juryByDepartment = departments.map((department) => {
          const departmentJuries = data.filter((item: any) => item.department === department)
          return {
            id: department as string,
            department: department as string,
            juryCount: departmentJuries.length,
          }
        })

        setJuryGroups(juryByDepartment)
      } catch (apiError) {
        console.error("API hatası:", apiError)
        // API hatası durumunda mock veri kullan
        console.log("Mock veri kullanılıyor...")

        // Mock veri
        const mockJuryGroups = [
          {
            id: "1",
            department: "Bilişim Sistemleri Mühendisliği",
            juryCount: 5,
          },
          {
            id: "2",
            department: "Bilgisayar Mühendisliği",
            juryCount: 4,
          },
          {
            id: "3",
            department: "Elektrik-Elektronik Mühendisliği",
            juryCount: 3,
          },
        ]

        setJuryGroups(mockJuryGroups)
      }
    } catch (err) {
      console.error("Jüri grupları çekme hatası:", err)
      setError("Jüri grupları yüklenirken bir hata oluştu.")
    }
  }

  // İstatistikleri API'den çeken fonksiyon
  const fetchStats = async () => {
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
        console.log("API'den başvuru istatistikleri çekiliyor...")
        const response = await fetch("http://localhost:8000/api/applications", {
          headers,
          // 5 saniye timeout ekleyelim
          signal: AbortSignal.timeout(5000),
        })

        if (!response.ok) {
          throw new Error(`API yanıt hatası: ${response.status}`)
        }

        const data = await response.json()
        console.log("API'den başvuru istatistikleri başarıyla alındı:", data)

        // İstatistikleri hesapla
        const total = data.length
        const pending = data.filter((app: any) => app.status === "pending").length
        const inReview = data.filter((app: any) => app.status === "in_review").length
        const approved = data.filter((app: any) => app.status === "approved").length
        const rejected = data.filter((app: any) => app.status === "rejected").length

        setStats({
          total,
          pending,
          inReview,
          approved,
          rejected,
        })
      } catch (apiError) {
        console.error("API hatası:", apiError)
        // API hatası durumunda mock veri kullan
        console.log("Mock veri kullanılıyor...")

        // Mock veri
        setStats({
          total: 24,
          pending: 10,
          inReview: 8,
          approved: 4,
          rejected: 2,
        })
      }
    } catch (err) {
      console.error("İstatistikler çekme hatası:", err)
      setError("İstatistikler yüklenirken bir hata oluştu.")
    }
  }

  // Tüm verileri çeken fonksiyon
  const fetchAllData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      await Promise.all([fetchPendingApplications(), fetchCriteriaGroups(), fetchJuryGroups(), fetchStats()])
    } catch (err) {
      console.error("Veri çekme hatası:", err)
      setError("Veriler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.")
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
      fetchAllData()
    }
  }, [mounted])

  // Don't render until component is mounted
  if (!mounted) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="grid gap-6">
        <h1 className="text-2xl font-bold">Yönetici Paneli</h1>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Toplam Başvuru</CardTitle>
              <FileText className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Bekleyen</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">İncelemede</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inReview}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Onaylanan</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.approved}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Reddedilen</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.rejected}</div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Applications */}
        <Card>
          <CardHeader>
            <CardTitle>Bekleyen Başvurular</CardTitle>
            <CardDescription>İşlem bekleyen başvurular</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              </div>
            ) : error ? (
              <div className="rounded-md bg-red-50 p-4 text-center text-red-800">{error}</div>
            ) : pendingApplications.length === 0 ? (
              <div className="rounded-md border border-dashed p-8 text-center">
                <p className="text-sm text-gray-500">Bekleyen başvuru bulunmamaktadır.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingApplications.map((application) => (
                  <div key={application.id} className="rounded-lg border p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{application.candidate.name}</h3>
                        <p className="text-sm text-gray-500">
                          {application.position} - {application.candidate.department}
                        </p>
                      </div>
                      <Link href={`/dashboard/manager/evaluations/${application.id}`}>
                        <Button>İncele</Button>
                      </Link>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium">Başvuru Tarihi:</span> {application.date}
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
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 text-center">
              <Link href="/dashboard/manager/evaluations">
                <Button variant="outline">Tüm Başvuruları Görüntüle</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Kriter Yönetimi</CardTitle>
              <CardDescription>Akademik kadro kriterlerini düzenleyin</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                </div>
              ) : error ? (
                <div className="rounded-md bg-red-50 p-4 text-center text-red-800">{error}</div>
              ) : criteriaGroups.length === 0 ? (
                <div className="rounded-md border border-dashed p-8 text-center">
                  <p className="text-sm text-gray-500">Kriter grubu bulunmamaktadır.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {criteriaGroups.map((criteria) => (
                    <div key={criteria.id} className="rounded-lg border p-3">
                      <h3 className="font-semibold">{criteria.name}</h3>
                      <p className="text-sm text-gray-500">Son güncelleme: {criteria.lastUpdated}</p>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4 text-center">
                <Link href="/dashboard/manager/criteria">
                  <Button variant="outline">Kriterleri Düzenle</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Jüri Yönetimi</CardTitle>
              <CardDescription>Jüri üyelerini yönetin</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                </div>
              ) : error ? (
                <div className="rounded-md bg-red-50 p-4 text-center text-red-800">{error}</div>
              ) : juryGroups.length === 0 ? (
                <div className="rounded-md border border-dashed p-8 text-center">
                  <p className="text-sm text-gray-500">Jüri grubu bulunmamaktadır.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {juryGroups.map((juryGroup) => (
                    <div key={juryGroup.id} className="rounded-lg border p-3">
                      <h3 className="font-semibold">{juryGroup.department}</h3>
                      <p className="text-sm text-gray-500">{juryGroup.juryCount} jüri üyesi atanmış</p>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4 text-center">
                <Link href="/dashboard/manager/jury">
                  <Button variant="outline">Jüri Üyelerini Yönet</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
