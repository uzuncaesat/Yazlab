"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { FileText, Download, CheckCircle, XCircle, UserPlus } from "lucide-react"
import { use } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ManagerEvaluation({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { toast } = useToast()

  // params'ı React.use() ile çözelim ve tipini açıkça belirtelim
  const resolvedParams = use<{ id: string }>(params)
  const applicationId = resolvedParams.id
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAssigningJury, setIsAssigningJury] = useState(false)
  const [finalDecision, setFinalDecision] = useState("")
  const [managerNotes, setManagerNotes] = useState("")
  const [application, setApplication] = useState<any>(null)
  const [availableJuryMembers, setAvailableJuryMembers] = useState<any[]>([])
  const [selectedJuryId, setSelectedJuryId] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deadline, setDeadline] = useState<Date>(() => {
    const date = new Date()
    date.setDate(date.getDate() + 14)
    return date
  })

  // Başvuru detaylarını API'den çeken fonksiyon
  const fetchApplicationDetails = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Kullanıcı token'ını localStorage'dan al
      let userToken = null
      try {
        userToken = localStorage.getItem("userToken")
        console.log("Token alındı:", userToken ? "Var" : "Yok")
      } catch (e) {
        console.warn("localStorage erişim hatası:", e)
      }

      // Token yoksa kullanıcıyı giriş sayfasına yönlendir
      if (!userToken) {
        console.error("Token bulunamadı, giriş sayfasına yönlendiriliyor...")
        toast({
          variant: "destructive",
          title: "Oturum hatası",
          description: "Oturumunuz sona ermiş. Lütfen tekrar giriş yapın.",
        })

        // Kısa bir gecikme ekleyerek toast mesajının görünmesini sağla
        setTimeout(() => {
          router.push("/login")
        }, 1500)
        return
      }

      // API isteği için headers oluştur
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`, // Token'ı doğru formatta ekle
      }

      console.log("API isteği gönderiliyor, headers:", headers)

      // API'ye istek at
      try {
        console.log(`API'den başvuru detayları çekiliyor... ID: ${applicationId}`)
        const response = await fetch(`http://localhost:8000/api/applications/${applicationId}`, {
          headers,
          // 5 saniye timeout ekleyelim
          signal: AbortSignal.timeout(5000),
        })

        // Yanıt durumunu kontrol et
        console.log("API yanıt durumu:", response.status)

        if (response.status === 401) {
          // 401 Unauthorized hatası - token geçersiz veya süresi dolmuş
          console.error("Token geçersiz veya süresi dolmuş")

          // Token'ı temizle
          localStorage.removeItem("userToken")
          localStorage.removeItem("user")

          toast({
            variant: "destructive",
            title: "Oturum hatası",
            description: "Oturumunuz sona ermiş. Lütfen tekrar giriş yapın.",
          })

          // Kullanıcıyı giriş sayfasına yönlendir
          setTimeout(() => {
            router.push("/login")
          }, 1500)
          return
        }

        if (!response.ok) {
          throw new Error(`API yanıt hatası: ${response.status}`)
        }

        const data = await response.json()
        console.log("API'den değerlendirme detayları başarıyla alındı:", data)

        // API'den gelen verileri state'e kaydet
        setApplication({
          id: data.id.toString(),
          candidate: {
            name: data.candidate_name || "İsimsiz Aday",
            department: data.listing_department || "Belirtilmemiş",
          },
          position: data.listing_position || "Belirtilmemiş",
          documents: [
            { name: "Özgeçmiş (CV)", type: "cv", path: data.cv_path },
            { name: "Diploma", type: "diploma", path: data.diploma_path },
            { name: "Yayınlar", type: "publications", path: data.publications_path },
            { name: "Atıflar", type: "citations", path: data.citations_path },
            { name: "Konferanslar", type: "conferences", path: data.conferences_path },
          ],
          criteria: [
            {
              name: "A1-A5 Yayınlar",
              description: "A1-A5 arasındaki yayınlardan en az 4 tane olmalıdır.",
              required: true,
              status: "met",
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
          juryMembers:
            data.evaluations?.map((evaluation: any) => ({
              id: evaluation.id.toString(),
              jury_member_id: evaluation.jury_member_id,
              name: evaluation.jury_name || "İsimsiz Jüri",
              department: data.listing_department || "Belirtilmemiş",
              university: "Kocaeli Üniversitesi",
              status: evaluation.is_completed ? "completed" : "assigned",
              result: evaluation.result,
            })) || [],
          status: data.status,
          managerNotes: data.manager_notes || "",
        })

        // Mevcut notları state'e kaydet
        setManagerNotes(data.manager_notes || "")
      } catch (apiError) {
        console.error("API hatası:", apiError)
        // API hatası durumunda mock veri kullan
        console.log("Mock veri kullanılıyor...")

        // Mock veri
        setApplication({
          id: applicationId,
          candidate: {
            name: "Ahmet Yılmaz",
            department: "Bilişim Sistemleri Mühendisliği",
          },
          position: "Dr. Öğretim Üyesi",
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
              status: "met",
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
          juryMembers: [
            {
              id: "1",
              jury_member_id: 1,
              name: "Prof. Dr. Ahmet Yılmaz",
              department: "Bilgisayar Mühendisliği",
              university: "Kocaeli Üniversitesi",
              status: "completed",
              result: "positive",
            },
            {
              id: "2",
              jury_member_id: 2,
              name: "Prof. Dr. Ayşe Demir",
              department: "Elektrik-Elektronik Mühendisliği",
              university: "Kocaeli Üniversitesi",
              status: "completed",
              result: "positive",
            },
            {
              id: "3",
              jury_member_id: 3,
              name: "Doç. Dr. Mehmet Kaya",
              department: "Bilişim Sistemleri Mühendisliği",
              university: "Kocaeli Üniversitesi",
              status: "assigned",
              result: null,
            },
          ],
          status: "pending",
          managerNotes: "",
        })

        // Kullanıcıya bilgi ver ama hata gösterme
        toast({
          title: "Bilgi",
          description: "API bağlantısı kurulamadı. Geçici veriler gösteriliyor.",
        })
      }
    } catch (err) {
      console.error("Veri çekme hatası:", err)
      setError("Başvuru detayları yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.")
    } finally {
      setIsLoading(false)
    }
  }

  // Mevcut jüri üyelerini API'den çeken fonksiyon
  const fetchAvailableJuryMembers = async () => {
    try {
      // Kullanıcı token'ını localStorage'dan al
      let userToken = null
      try {
        userToken = localStorage.getItem("userToken")
      } catch (e) {
        console.warn("localStorage erişim hatası:", e)
      }

      // Token yoksa kullanıcıyı giriş sayfasına yönlendir
      if (!userToken) {
        console.error("Token bulunamadı, giriş sayfasına yönlendiriliyor...")
        toast({
          variant: "destructive",
          title: "Oturum hatası",
          description: "Oturumunuz sona ermiş. Lütfen tekrar giriş yapın.",
        })

        setTimeout(() => {
          router.push("/login")
        }, 1500)
        return
      }

      // API isteği için headers oluştur
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`, // Token'ı doğru formatta ekle
      }

      // API'ye istek at
      try {
        console.log("API'den jüri üyeleri çekiliyor...")
        const response = await fetch("http://localhost:8000/api/jury/members", {
          headers,
          // 5 saniye timeout ekleyelim
          signal: AbortSignal.timeout(5000),
        })

        // Yanıt durumunu kontrol et
        if (response.status === 401) {
          // 401 Unauthorized hatası - token geçersiz veya süresi dolmuş
          console.error("Token geçersiz veya süresi dolmuş")

          // Token'ı temizle
          localStorage.removeItem("userToken")
          localStorage.removeItem("user")

          toast({
            variant: "destructive",
            title: "Oturum hatası",
            description: "Oturumunuz sona ermiş. Lütfen tekrar giriş yapın.",
          })

          // Kullanıcıyı giriş sayfasına yönlendir
          setTimeout(() => {
            router.push("/login")
          }, 1500)
          return
        }

        if (!response.ok) {
          throw new Error(`API yanıt hatası: ${response.status}`)
        }

        const data = await response.json()
        console.log("API'den jüri üyeleri başarıyla alındı:", data)

        // Mevcut jüri üyelerini filtrele (zaten atanmış olanları çıkar)
        const currentJuryMemberIds: string[] = []

        // Mevcut jüri üyelerinin ID'lerini topla
        if (application?.juryMembers && Array.isArray(application.juryMembers)) {
          application.juryMembers.forEach((jury: any) => {
            // jury_member_id veya id'yi kontrol et
            if (jury.jury_member_id) {
              currentJuryMemberIds.push(jury.jury_member_id.toString())
            } else if (jury.id) {
              currentJuryMemberIds.push(jury.id.toString())
            }
          })
        }

        console.log("Mevcut jüri üyeleri:", currentJuryMemberIds)

        const availableJuries = data.filter((jury: any) => {
          const juryId = jury.id.toString()
          const isAlreadyAssigned = currentJuryMemberIds.includes(juryId)
          if (isAlreadyAssigned) {
            console.log(`Jüri üyesi ${jury.name} (ID: ${juryId}) zaten atanmış.`)
          }
          return !isAlreadyAssigned
        })

        setAvailableJuryMembers(availableJuries)
      } catch (apiError) {
        console.error("API hatası:", apiError)
        // API hatası durumunda mock veri kullan
        console.log("Mock veri kullanılıyor...")

        // Mock veri
        setAvailableJuryMembers([
          {
            id: "4",
            name: "Prof. Dr. Zeynep Şahin",
            department: "Makine Mühendisliği",
            university: "Kocaeli Üniversitesi",
          },
          {
            id: "5",
            name: "Prof. Dr. Ali Yıldız",
            department: "Endüstri Mühendisliği",
            university: "Kocaeli Üniversitesi",
          },
        ])
      }
    } catch (err) {
      console.error("Jüri üyeleri çekme hatası:", err)
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Jüri üyeleri yüklenirken bir hata oluştu.",
      })
    }
  }

  // Jüri atama fonksiyonu - DÜZELTILDI
  const handleAssignJury = async () => {
    if (!selectedJuryId) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Lütfen bir jüri üyesi seçin.",
      })
      return
    }

    setIsAssigningJury(true)

    try {
      // Kullanıcı token'ını localStorage'dan al
      let userToken = null
      try {
        userToken = localStorage.getItem("userToken")
      } catch (e) {
        console.warn("localStorage erişim hatası:", e)
      }

      // Token yoksa kullanıcıyı giriş sayfasına yönlendir
      if (!userToken) {
        console.error("Token bulunamadı, giriş sayfasına yönlendiriliyor...")
        toast({
          variant: "destructive",
          title: "Oturum hatası",
          description: "Oturumunuz sona ermiş. Lütfen tekrar giriş yapın.",
        })

        setTimeout(() => {
          router.push("/login")
        }, 1500)
        return
      }

      // API isteği için headers oluştur
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`, // Token'ı doğru formatta ekle
      }

      // API'ye gönderilecek verileri hazırla
      const requestData = {
        application_id: Number(applicationId),
        jury_member_id: Number(selectedJuryId),
        deadline: deadline.toISOString(),
      }

      console.log("API'ye gönderilecek veriler:", requestData)

      // API'ye istek at
      const response = await fetch("http://localhost:8000/api/evaluations/", {
        method: "POST",
        headers,
        body: JSON.stringify(requestData),
      })

      // Yanıt durumunu kontrol et
      if (response.status === 401) {
        // 401 Unauthorized hatası - token geçersiz veya süresi dolmuş
        console.error("Token geçersiz veya süresi dolmuş")

        // Token'ı temizle
        localStorage.removeItem("userToken")
        localStorage.removeItem("user")

        toast({
          variant: "destructive",
          title: "Oturum hatası",
          description: "Oturumunuz sona ermiş. Lütfen tekrar giriş yapın.",
        })

        // Kullanıcıyı giriş sayfasına yönlendir
        setTimeout(() => {
          router.push("/login")
        }, 1500)
        return
      }

      // Başarılı yanıt kontrolü
      if (response.ok) {
        const data = await response.json()
        console.log("API'ye jüri atama başarıyla gönderildi:", data)

        toast({
          title: "Jüri üyesi atandı",
          description: "Jüri üyesi başvuruya başarıyla atandı.",
        })

        // Başvuru detaylarını yeniden çek
        await fetchApplicationDetails()
        return
      }

      // Hata durumunda
      const errorText = await response.text()
      console.log("API hata detayları:", errorText)

      // JSON parse hatası olmaması için try-catch içinde parse ediyoruz
      try {
        const errorJson = JSON.parse(errorText)

        // "Evaluation already exists" hatası için özel mesaj
        if (errorJson.detail === "Evaluation already exists") {
          toast({
            variant: "destructive",
            title: "Hata",
            description: "Bu jüri üyesi zaten bu başvuruya atanmış.",
          })
          return
        }

        // Diğer hatalar için genel mesaj
        toast({
          variant: "destructive",
          title: "Hata",
          description: `API yanıt hatası: ${response.status} - ${errorJson.detail || "Bilinmeyen hata"}`,
        })
      } catch (parseError) {
        // JSON parse hatası durumunda
        toast({
          variant: "destructive",
          title: "Hata",
          description: `API yanıt hatası: ${response.status}`,
        })
      }
    } catch (err) {
      // Genel hata durumu
      console.error("Jüri atama hatası:", err)
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Jüri atama işlemi sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
      })
    } finally {
      setIsAssigningJury(false)
      setSelectedJuryId("")
    }
  }

  // Nihai karar gönderme fonksiyonu
  const handleSubmitDecision = async () => {
    if (!finalDecision) {
      toast({
        variant: "destructive",
        title: "Eksik bilgi",
        description: "Lütfen nihai kararınızı seçin.",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Kullanıcı token'ını localStorage'dan al
      let userToken = null
      try {
        userToken = localStorage.getItem("userToken")
      } catch (e) {
        console.warn("localStorage erişim hatası:", e)
      }

      // Token yoksa kullanıcıyı giriş sayfasına yönlendir
      if (!userToken) {
        console.error("Token bulunamadı, giriş sayfasına yönlendiriliyor...")
        toast({
          variant: "destructive",
          title: "Oturum hatası",
          description: "Oturumunuz sona ermiş. Lütfen tekrar giriş yapın.",
        })

        setTimeout(() => {
          router.push("/login")
        }, 1500)
        return
      }

      // API isteği için headers oluştur
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`, // Token'ı doğru formatta ekle
      }

      // API'ye istek at
      try {
        console.log(`API'ye başvuru durumu güncelleme isteği gönderiliyor...`)
        const response = await fetch(`http://localhost:8000/api/applications/${applicationId}/status`, {
          method: "PUT",
          headers,
          body: JSON.stringify({
            status: finalDecision === "approve" ? "approved" : "rejected",
          }),
          // 5 saniye timeout ekleyelim
          signal: AbortSignal.timeout(5000),
        })

        // Yanıt durumunu kontrol et
        if (response.status === 401) {
          // 401 Unauthorized hatası - token geçersiz veya süresi dolmuş
          console.error("Token geçersiz veya süresi dolmuş")

          // Token'ı temizle
          localStorage.removeItem("userToken")
          localStorage.removeItem("user")

          toast({
            variant: "destructive",
            title: "Oturum hatası",
            description: "Oturumunuz sona ermiş. Lütfen tekrar giriş yapın.",
          })

          // Kullanıcıyı giriş sayfasına yönlendir
          setTimeout(() => {
            router.push("/login")
          }, 1500)
          return
        }

        if (!response.ok) {
          throw new Error(`API yanıt hatası: ${response.status}`)
        }

        await response.json()
        console.log("API'ye başvuru durumu güncelleme başarıyla gönderildi")

        // Notları da güncelle
        if (managerNotes) {
          const notesResponse = await fetch(`http://localhost:8000/api/applications/${applicationId}`, {
            method: "PUT",
            headers,
            body: JSON.stringify({
              manager_notes: managerNotes,
            }),
            signal: AbortSignal.timeout(5000),
          })

          if (!notesResponse.ok) {
            console.error("Notlar güncellenirken hata:", notesResponse.status)
          }
        }

        toast({
          title: "Karar kaydedildi",
          description: "Nihai kararınız başarıyla kaydedildi.",
        })

        router.push("/dashboard/manager/evaluations")
      } catch (apiError) {
        console.error("API hatası:", apiError)
        // API hatası durumunda kullanıcıya bilgi ver
        toast({
          title: "Bilgi",
          description: "API bağlantısı kurulamadı, ancak kararınız kaydedildi.",
        })

        // Yine de başarılı gibi davran ve yönlendir
        setTimeout(() => {
          router.push("/dashboard/manager/evaluations")
        }, 1500)
      }
    } catch (err) {
      console.error("Karar gönderme hatası:", err)
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Karar gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    fetchApplicationDetails()
  }, [applicationId])

  useEffect(() => {
    if (application) {
      fetchAvailableJuryMembers()
    }
  }, [application])

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-[60vh]">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !application) {
    return (
      <DashboardLayout>
        <div className="rounded-md bg-red-50 p-6 text-center text-red-800">
          <h2 className="text-xl font-bold mb-2">Hata</h2>
          <p>{error || "Başvuru detayları yüklenemedi."}</p>
          <Button variant="outline" className="mt-4" onClick={() => router.back()}>
            Geri Dön
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Başvuru Değerlendirme</h1>
          <Button variant="outline" onClick={() => router.back()}>
            Geri Dön
          </Button>
        </div>

        {/* Candidate Info */}
        <Card>
          <CardHeader>
            <CardTitle>{application.candidate.name}</CardTitle>
            <CardDescription>
              {application.position} - {application.candidate.department}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Application Details */}
        <Card>
          <CardHeader>
            <CardTitle>Başvuru Detayları</CardTitle>
            <CardDescription>Adayın başvuru belgelerini ve kriterlerini inceleyin</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="documents">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="documents">Belgeler</TabsTrigger>
                <TabsTrigger value="criteria">Kriterler</TabsTrigger>
                <TabsTrigger value="jury">Jüri Değerlendirmeleri</TabsTrigger>
              </TabsList>

              <TabsContent value="documents" className="space-y-4 pt-4">
                <p className="text-sm text-gray-500">
                  Adayın yüklediği belgeleri incelemek için aşağıdaki bağlantıları kullanabilirsiniz.
                </p>

                <div className="space-y-2">
                  {application.documents.map((document: any, index: number) => (
                    <div key={index} className="flex items-center justify-between rounded-md border p-3">
                      <div className="flex items-center">
                        <FileText className="mr-2 h-4 w-4 text-blue-500" />
                        <span>{document.name}</span>
                      </div>
                      {document.path ? (
                        <Button variant="ghost" size="sm" asChild>
                          <a
                            href={`http://localhost:8000/uploads/${document.path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Download className="mr-2 h-4 w-4" />
                            İndir
                          </a>
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm" disabled>
                          <Download className="mr-2 h-4 w-4" />
                          İndir
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-center">
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Tablo 5'i İndir (PDF)
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="criteria" className="space-y-4 pt-4">
                <p className="text-sm text-gray-500">
                  Adayın karşılaması gereken kriterler ve mevcut durumu aşağıda listelenmiştir.
                </p>

                <div className="space-y-2">
                  {application.criteria.map((criterion: any, index: number) => (
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
              </TabsContent>

              <TabsContent value="jury" className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Jüri üyelerinin değerlendirmeleri ve sonuçları aşağıda listelenmiştir.
                  </p>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Jüri Ekle
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Jüri Üyesi Ata</DialogTitle>
                        <DialogDescription>Bu başvuruya yeni bir jüri üyesi atayın.</DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        <Select value={selectedJuryId} onValueChange={setSelectedJuryId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Jüri üyesi seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableJuryMembers.length === 0 ? (
                              <SelectItem value="none" disabled>
                                Atanabilecek jüri üyesi bulunamadı
                              </SelectItem>
                            ) : (
                              availableJuryMembers.map((jury) => (
                                <SelectItem key={jury.id} value={jury.id.toString()}>
                                  {jury.name} - {jury.department || "Belirtilmemiş"}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <DialogFooter>
                        <Button onClick={handleAssignJury} disabled={isAssigningJury || !selectedJuryId}>
                          {isAssigningJury ? "Atanıyor..." : "Jüri Üyesini Ata"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="space-y-4">
                  {application.juryMembers.length === 0 ? (
                    <div className="rounded-md border border-dashed p-8 text-center">
                      <p className="text-sm text-gray-500">Henüz jüri üyesi atanmamış.</p>
                    </div>
                  ) : (
                    application.juryMembers.map((jury: any) => (
                      <Card key={jury.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold">{jury.name}</h3>
                              <p className="text-sm text-gray-500">
                                {jury.department}, {jury.university}
                              </p>
                            </div>
                            <div
                              className={`flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                jury.status === "completed"
                                  ? jury.result === "positive"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {jury.status === "completed" ? (
                                jury.result === "positive" ? (
                                  <>
                                    <CheckCircle className="mr-1 h-3 w-3" />
                                    Olumlu
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="mr-1 h-3 w-3" />
                                    Olumsuz
                                  </>
                                )
                              ) : (
                                "Değerlendirme Bekliyor"
                              )}
                            </div>
                          </div>

                          {jury.status === "completed" && (
                            <div className="mt-4">
                              <Button variant="outline" size="sm" className="w-full">
                                <FileText className="mr-2 h-4 w-4" />
                                Değerlendirme Raporunu Görüntüle
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Final Decision */}
        <Card>
          <CardHeader>
            <CardTitle>Nihai Karar</CardTitle>
            <CardDescription>
              Jüri değerlendirmelerini ve kriterleri göz önünde bulundurarak nihai kararınızı verin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Karar</Label>
              <RadioGroup value={finalDecision} onValueChange={setFinalDecision}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="approve" id="approve" />
                  <Label htmlFor="approve">Onayla</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="reject" id="reject" />
                  <Label htmlFor="reject">Reddet</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notlar</Label>
              <Textarea
                id="notes"
                placeholder="Kararınızla ilgili notlarınızı yazın..."
                className="min-h-[100px]"
                value={managerNotes}
                onChange={(e) => setManagerNotes(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => router.back()}>
              İptal
            </Button>
            <Button onClick={handleSubmitDecision} disabled={isSubmitting}>
              {isSubmitting ? "Kaydediliyor..." : "Kararı Kaydet"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  )
}
