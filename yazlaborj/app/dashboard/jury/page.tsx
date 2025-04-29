"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { FileText, Clock, CheckCircle } from "lucide-react"
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

export default function JuryDashboard() {
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

  // İstatistikleri hesaplayan fonksiyon
  const calculateStats = (evaluations: Evaluation[]) => {
    return {
      total: evaluations.length,
      pending: evaluations.filter((e) => e.status === "pending").length,
      completed: evaluations.filter((e) => e.status === "completed").length,
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
    setIsClient(true)

    if (isClient) {
      fetchEvaluations()
    }
  }, [isClient])

  // Değerlendirmeleri bekleyen ve tamamlanan olarak ayır
  const pendingEvaluations = evaluations.filter((e) => e.status === "pending").slice(0, 3)
  const completedEvaluations = evaluations.filter((e) => e.status === "completed").slice(0, 2)

  // İstatistikleri hesapla
  const evaluationStats = calculateStats(evaluations)

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
        <h1 className="text-2xl font-bold">Jüri Paneli</h1>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Toplam Değerlendirme</CardTitle>
              <FileText className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{evaluationStats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Bekleyen</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{evaluationStats.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tamamlanan</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{evaluationStats.completed}</div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Evaluations */}
        <Card>
          <CardHeader>
            <CardTitle>Bekleyen Değerlendirmeler</CardTitle>
            <CardDescription>Değerlendirmeniz beklenen başvurular</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              </div>
            ) : error ? (
              <div className="rounded-md bg-red-50 p-4 text-center text-red-800">{error}</div>
            ) : pendingEvaluations.length === 0 ? (
              <div className="rounded-md border border-dashed p-8 text-center">
                <p className="text-sm text-gray-500">Bekleyen değerlendirme bulunmamaktadır.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingEvaluations.map((evaluation) => (
                  <div key={evaluation.id} className="rounded-lg border p-4">
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
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium">Atanma Tarihi:</span> {evaluation.assignedDate}
                      </div>
                      <div>
                        <span className="font-medium">Son Tarih:</span> {evaluation.deadline}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 text-center">
              <Link href="/dashboard/jury/evaluations">
                <Button variant="outline">Tüm Değerlendirmeleri Görüntüle</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Completed Evaluations */}
        <Card>
          <CardHeader>
            <CardTitle>Tamamlanan Değerlendirmeler</CardTitle>
            <CardDescription>Son tamamladığınız değerlendirmeler</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              </div>
            ) : error ? (
              <div className="rounded-md bg-red-50 p-4 text-center text-red-800">{error}</div>
            ) : completedEvaluations.length === 0 ? (
              <div className="rounded-md border border-dashed p-8 text-center">
                <p className="text-sm text-gray-500">Tamamlanan değerlendirme bulunmamaktadır.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {completedEvaluations.map((evaluation) => (
                  <div key={evaluation.id} className="rounded-lg border p-4">
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
                    <div className="mt-2 text-sm">
                      <span className="font-medium">Tamamlanma Tarihi:</span> {evaluation.completedDate}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 text-center">
              <Link href="/dashboard/jury/evaluations?status=completed">
                <Button variant="outline">Tüm Tamamlanan Değerlendirmeleri Görüntüle</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
