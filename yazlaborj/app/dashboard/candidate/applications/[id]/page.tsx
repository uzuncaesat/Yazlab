"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { FileText, Download, CheckCircle, XCircle, Clock } from "lucide-react"
import { use } from "react"

export default function ApplicationDetail({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { toast } = useToast()

  // TypeScript'in use() fonksiyonunun dönüş türünü doğru şekilde anlaması için
  // jenerik tür parametresi kullanıyoruz
  const resolvedParams = use<{ id: string }>(params)
  const applicationId = resolvedParams.id
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Mock data for demonstration
  const application = {
    id: applicationId,
    position: "Dr. Öğretim Üyesi",
    department: "Bilgisayar Mühendisliği",
    faculty: "Mühendislik Fakültesi",
    applyDate: "15.03.2025",
    status: "pending", // pending, approved, rejected
    statusText: "Beklemede",
    statusIcon: <Clock className="h-4 w-4 text-yellow-500" />,
    documents: [
      { name: "Özgeçmiş (CV)", type: "cv" },
      { name: "Diploma", type: "diploma" },
      { name: "Yayınlar", type: "publications" },
      { name: "Atıflar", type: "citations" },
      { name: "Konferanslar", type: "conferences" },
    ],
    criteria: [
      {
        name: "A1-A5 Yayınlar",
        description: "A1-A5 arasındaki yayınlardan en az 4 tane olmalıdır.",
        required: true,
        status: "met", // met, not_met
        count: 5,
      },
      {
        name: "A1 veya A2 Yayın",
        description: "En az 1 tane A1 veya A2 kategorisinde yayın olmalıdır.",
        required: true,
        status: "met",
        count: 2,
      },
      {
        name: "A1-A4 Yayın",
        description: "En az 3 tane A1-A4 kategorisinde yayın olmalıdır.",
        required: true,
        status: "met",
        count: 4,
      },
      {
        name: "Başlıca Yazar",
        description: "En az 1 makalede başlıca yazar olunmalıdır.",
        required: true,
        status: "met",
        count: 2,
      },
    ],
    timeline: [
      {
        date: "15.03.2025",
        event: "Başvuru yapıldı",
        description: "Başvurunuz sistem tarafından alındı.",
      },
      {
        date: "16.03.2025",
        event: "Ön değerlendirme",
        description: "Başvurunuz ön değerlendirme aşamasında.",
      },
      {
        date: "20.03.2025",
        event: "Jüri değerlendirmesi",
        description: "Başvurunuz jüri üyeleri tarafından değerlendiriliyor.",
      },
    ],
  }

  // Don't render until component is mounted
  if (!mounted) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Başvuru Detayı</h1>
          <Button variant="outline" onClick={() => router.back()}>
            Geri Dön
          </Button>
        </div>

        {/* Application Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{application.position}</CardTitle>
                <CardDescription>
                  {application.department} - {application.faculty}
                </CardDescription>
              </div>
              <div
                className={`flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                  application.status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : application.status === "approved"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                }`}
              >
                {application.statusIcon}
                <span className="ml-1">{application.statusText}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Başvuru Tarihi:</span> {application.applyDate}
              </div>
              <div>
                <span className="font-medium">Başvuru No:</span> {application.id}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Application Details */}
        <Tabs defaultValue="documents">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="documents">Belgeler</TabsTrigger>
            <TabsTrigger value="criteria">Kriterler</TabsTrigger>
            <TabsTrigger value="timeline">Zaman Çizelgesi</TabsTrigger>
          </TabsList>

          <TabsContent value="documents" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Yüklenen Belgeler</CardTitle>
                <CardDescription>Başvurunuzla birlikte yüklediğiniz belgeler</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {application.documents.map((document, index) => (
                    <div key={index} className="flex items-center justify-between rounded-md border p-3">
                      <div className="flex items-center">
                        <FileText className="mr-2 h-4 w-4 text-blue-500" />
                        <span>{document.name}</span>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        İndir
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="criteria" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Başvuru Kriterleri</CardTitle>
                <CardDescription>Pozisyon için gerekli kriterler ve durumunuz</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {application.criteria.map((criterion, index) => (
                    <div key={index} className="rounded-md border p-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{criterion.name}</h4>
                          <p className="text-sm text-gray-600">{criterion.description}</p>
                        </div>
                        <div
                          className={`flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            criterion.status === "met" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {criterion.status === "met" ? (
                            <>
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Karşılanıyor
                            </>
                          ) : (
                            <>
                              <XCircle className="mr-1 h-3 w-3" />
                              Karşılanmıyor
                            </>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 text-sm">
                        <span className="font-medium">Mevcut Sayı:</span> {criterion.count}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Başvuru Süreci</CardTitle>
                <CardDescription>Başvurunuzun ilerleme durumu</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative space-y-0 border-l-2 border-gray-200 pl-6 pt-2">
                  {application.timeline.map((item, index) => (
                    <div key={index} className="mb-8 relative">
                      <div className="absolute -left-[30px] flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                        <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                      </div>
                      <div className="flex flex-col">
                        <h4 className="font-medium">{item.event}</h4>
                        <p className="text-sm text-gray-500">{item.description}</p>
                        <span className="mt-1 text-xs text-gray-400">{item.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
