"use client"

import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { UploadIcon as FileUpload, CheckCircle, AlertCircle, ExternalLink } from "lucide-react"
import { useState, useEffect } from "react"
import { use } from "react"

export default function ListingDetail({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [apiStatus, setApiStatus] = useState<"checking" | "online" | "offline">("checking")

  // params'ı React.use() ile çözelim ve tipini açıkça belirtelim
  const resolvedParams = use<{ id: string }>(params)
  // Çözülmüş params'tan id'yi alalım
  const [listingId, setListingId] = useState<string>(resolvedParams.id)

  const [uploadedFiles, setUploadedFiles] = useState<Record<string, boolean>>({
    cv: false,
    diploma: false,
    publications: false,
    citations: false,
    conferences: false,
  })

  // Mock data for demonstration
  const [listing, setListing] = useState({
    id: "",
    position: "Dr. Öğretim Üyesi",
    department: "Bilişim Sistemleri Mühendisliği",
    faculty: "Mühendislik Fakültesi",
    publishDate: "01.03.2025",
    deadline: "30.04.2025",
    requirements: "Doktora derecesine sahip olmak, en az 2 adet SCI/SSCI/AHCI indeksli yayın yapmış olmak.",
    description:
      "Bilişim Sistemleri Mühendisliği Bölümü'nde Dr. Öğretim Üyesi olarak görev yapacak akademik personel aranmaktadır. Adayların doktora derecesine sahip olması ve alanında yayın yapmış olması gerekmektedir.",
    criteria: [
      {
        name: "A1-A5 Yayınlar",
        description: "A1-A5 arasındaki yayınlardan en az 4 tane olmalıdır.",
        required: true,
      },
      {
        name: "A1 veya A2 Yayın",
        description: "En az 1 tane A1 veya A2 kategorisinde yayın olmalıdır.",
        required: true,
      },
      {
        name: "A1-A4 Yayın",
        description: "En az 3 tane A1-A4 kategorisinde yayın olmalıdır.",
        required: true,
      },
      {
        name: "Başlıca Yazar",
        description: "En az 1 makalede başlıca yazar olunmalıdır.",
        required: true,
      },
    ],
  })

  // API sunucusunun durumunu kontrol et
  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        // Basit bir GET isteği yap
        const response = await fetch("http://localhost:8000/", {
          method: "GET",
          mode: "no-cors", // CORS hatalarını önlemek için
        })

        console.log("API durumu kontrol edildi:", response)
        setApiStatus("online")
      } catch (error) {
        console.error("API sunucusu erişilebilir değil:", error)
        setApiStatus("offline")
      }
    }

    checkApiStatus()
  }, [])

  const handleFileUpload = (fileType: string) => {
    // Simulate file upload
    setUploadedFiles((prev) => ({ ...prev, [fileType]: true }))

    toast({
      title: "Dosya yüklendi",
      description: `${fileType.charAt(0).toUpperCase() + fileType.slice(1)} başarıyla yüklendi.`,
    })
  }

  // Detay sayfasında API çağrısı ekleyelim
  useEffect(() => {
    // Sadece listingId varsa API çağrısı yap
    if (listingId) {
      // Listing detaylarını API'den çekelim
      const fetchListingDetails = async () => {
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
            console.log(`API'den ilan detayları çekiliyor... ID: ${listingId}`)
            const response = await fetch(`http://localhost:8000/api/listings/${listingId}`, {
              headers,
              // 5 saniye timeout ekleyelim
              signal: AbortSignal.timeout(5000),
            })

            if (!response.ok) {
              throw new Error(`API yanıt hatası: ${response.status}`)
            }

            const data = await response.json()
            console.log("API'den ilan detayları başarıyla alındı:", data)

            // API'den gelen verileri kullanabiliriz, ancak şimdilik mock veri kullanmaya devam edelim
            console.log("API bağlantısı başarılı, ancak mock veri kullanılıyor")

            // Listing state'ini güncelleyelim
            setListing((prev) => ({
              ...prev,
              id: listingId,
            }))
          } catch (apiError) {
            console.error("API hatası:", apiError)
            console.log("Mock veri kullanılıyor...")
            // Mock veri kullanmaya devam ediyoruz
            setListing((prev) => ({
              ...prev,
              id: listingId,
            }))
          }
        } catch (err) {
          console.error("Veri çekme hatası:", err)
        }
      }

      fetchListingDetails()
    }
  }, [listingId])

  // Başvuru gönderme fonksiyonunu güncelleyelim
  const handleSubmit = async () => {
    setIsSubmitting(true)
    setApiError(null)

    // Check if all required files are uploaded
    const allFilesUploaded = Object.values(uploadedFiles).every((uploaded) => uploaded)

    if (!allFilesUploaded) {
      toast({
        variant: "destructive",
        title: "Eksik belgeler",
        description: "Lütfen tüm gerekli belgeleri yükleyin.",
      })
      setIsSubmitting(false)
      return
    }

    try {
      // Kullanıcı token'ını localStorage'dan al
      let userToken = null
      try {
        userToken = localStorage.getItem("userToken")
      } catch (e) {
        console.warn("localStorage erişim hatası:", e)
        setApiError("Kullanıcı oturumu bulunamadı. Lütfen tekrar giriş yapın.")
        setIsSubmitting(false)
        return
      }

      if (!userToken) {
        toast({
          variant: "destructive",
          title: "Oturum hatası",
          description: "Oturumunuz sonlanmış. Lütfen tekrar giriş yapın.",
        })
        router.push("/login")
        return
      }

      // API isteği için headers oluştur
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      }

      console.log("API'ye başvuru gönderiliyor...")
      console.log("Headers:", headers)
      console.log("Body:", JSON.stringify({ listing_id: Number.parseInt(listingId) }))

      // Başvuruyu simüle et ve başarılı olarak işaretle
      // API sunucusu çalışmadığı için gerçek API çağrısı yapmıyoruz
      toast({
        title: "Başvuru tamamlandı",
        description: "Başvurunuz başarıyla alınmıştır (API sunucusu çalışmadığı için simüle edildi).",
      })

      // Başvurular sayfasına yönlendir
      setTimeout(() => {
        router.push("/dashboard/candidate/applications")
      }, 1500)
    } catch (error) {
      console.error("Başvuru gönderme hatası:", error)

      // Hata detaylarını göster
      const errorMessage = error instanceof Error ? `${error.name}: ${error.message}` : "Bilinmeyen bir hata oluştu."

      setApiError(errorMessage)

      toast({
        variant: "destructive",
        title: "Bağlantı Hatası",
        description: "API sunucusuna bağlanırken bir hata oluştu. Lütfen sunucunun çalıştığından emin olun.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // API durumuna göre bilgi mesajı göster
  const renderApiStatus = () => {
    if (apiStatus === "checking") {
      return (
        <div className="rounded-md bg-gray-50 p-4 text-gray-800">
          <h3 className="font-medium">API Durumu Kontrol Ediliyor</h3>
          <p className="text-sm mt-1">API sunucusunun durumu kontrol ediliyor...</p>
        </div>
      )
    } else if (apiStatus === "offline") {
      return (
        <div className="rounded-md bg-red-50 p-4 text-red-800">
          <h3 className="font-medium">API Sunucusu Erişilebilir Değil</h3>
          <p className="text-sm mt-1">API sunucusuna bağlanılamıyor. Lütfen aşağıdaki adımları kontrol edin:</p>
          <ul className="list-disc list-inside text-sm mt-2 space-y-1">
            <li>API sunucusunun çalıştığından emin olun</li>
            <li>
              Terminal veya komut istemcisinde <code className="bg-red-100 px-1 rounded">docker-compose up</code>{" "}
              komutunu çalıştırın
            </li>
            <li>
              API sunucusunun <code className="bg-red-100 px-1 rounded">http://localhost:8000</code> adresinde
              çalıştığından emin olun
            </li>
            <li>
              Tarayıcınızda{" "}
              <a
                href="http://localhost:8000/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline flex items-center"
              >
                API dokümantasyonunu kontrol edin <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </li>
          </ul>
          <p className="text-sm mt-2">API sunucusu çalışana kadar başvurular simüle edilecektir.</p>
        </div>
      )
    }
    return null
  }

  return (
    <DashboardLayout>
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{listing.position} İlanı</h1>
          <Button variant="outline" onClick={() => router.back()}>
            Geri Dön
          </Button>
        </div>

        {/* API Durumu */}
        {renderApiStatus()}

        {/* API Hata Mesajı */}
        {apiError && (
          <div className="rounded-md bg-red-50 p-4 text-red-800">
            <h3 className="font-medium">API Hatası</h3>
            <p className="text-sm mt-1">{apiError}</p>
            <p className="text-sm mt-2">
              Lütfen API sunucusunun çalıştığından emin olun ve tarayıcı konsolunu kontrol edin.
            </p>
          </div>
        )}

        {/* Listing Details */}
        <Card>
          <CardHeader>
            <CardTitle>{listing.position}</CardTitle>
            <CardDescription>
              {listing.department} - {listing.faculty}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold">İlan Açıklaması</h3>
              <p className="text-sm text-gray-600">{listing.description}</p>
            </div>
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
          </CardContent>
        </Card>

        {/* Application Form */}
        <Card>
          <CardHeader>
            <CardTitle>Başvuru Formu</CardTitle>
            <CardDescription>Başvurunuzu tamamlamak için gerekli belgeleri yükleyin</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="general">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="general">Genel</TabsTrigger>
                <TabsTrigger value="publications">Yayınlar</TabsTrigger>
                <TabsTrigger value="citations">Atıflar</TabsTrigger>
                <TabsTrigger value="conferences">Konferanslar</TabsTrigger>
                <TabsTrigger value="criteria">Kriterler</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="cv">Özgeçmiş (CV)</Label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Input id="cv" type="file" className="hidden" onChange={() => handleFileUpload("cv")} />
                      <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                        <label htmlFor="cv" className="flex w-full cursor-pointer items-center">
                          {uploadedFiles.cv ? (
                            <>
                              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                              <span>CV yüklendi</span>
                            </>
                          ) : (
                            <>
                              <FileUpload className="mr-2 h-4 w-4" />
                              <span>CV yükleyin</span>
                            </>
                          )}
                        </label>
                      </div>
                    </div>
                    {uploadedFiles.cv && (
                      <Button variant="outline" size="sm">
                        Görüntüle
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="diploma">Diploma</Label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Input id="diploma" type="file" className="hidden" onChange={() => handleFileUpload("diploma")} />
                      <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                        <label htmlFor="diploma" className="flex w-full cursor-pointer items-center">
                          {uploadedFiles.diploma ? (
                            <>
                              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                              <span>Diploma yüklendi</span>
                            </>
                          ) : (
                            <>
                              <FileUpload className="mr-2 h-4 w-4" />
                              <span>Diploma yükleyin</span>
                            </>
                          )}
                        </label>
                      </div>
                    </div>
                    {uploadedFiles.diploma && (
                      <Button variant="outline" size="sm">
                        Görüntüle
                      </Button>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="publications" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="publications">Yayınlar</Label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Input
                        id="publications"
                        type="file"
                        className="hidden"
                        onChange={() => handleFileUpload("publications")}
                      />
                      <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                        <label htmlFor="publications" className="flex w-full cursor-pointer items-center">
                          {uploadedFiles.publications ? (
                            <>
                              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                              <span>Yayınlar yüklendi</span>
                            </>
                          ) : (
                            <>
                              <FileUpload className="mr-2 h-4 w-4" />
                              <span>Yayınlarınızı yükleyin</span>
                            </>
                          )}
                        </label>
                      </div>
                    </div>
                    {uploadedFiles.publications && (
                      <Button variant="outline" size="sm">
                        Görüntüle
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Yayınlarınızı tek bir PDF dosyası olarak yükleyin. Her yayın için indeks bilgisi ve kanıt belgeleri
                    ekleyin.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="citations" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="citations">Atıflar</Label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Input
                        id="citations"
                        type="file"
                        className="hidden"
                        onChange={() => handleFileUpload("citations")}
                      />
                      <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                        <label htmlFor="citations" className="flex w-full cursor-pointer items-center">
                          {uploadedFiles.citations ? (
                            <>
                              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                              <span>Atıflar yüklendi</span>
                            </>
                          ) : (
                            <>
                              <FileUpload className="mr-2 h-4 w-4" />
                              <span>Atıflarınızı yükleyin</span>
                            </>
                          )}
                        </label>
                      </div>
                    </div>
                    {uploadedFiles.citations && (
                      <Button variant="outline" size="sm">
                        Görüntüle
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Atıflarınızı tek bir PDF dosyası olarak yükleyin. Her atıf için kanıtlayıcı belge ekleyin.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="conferences" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="conferences">Konferanslar</Label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Input
                        id="conferences"
                        type="file"
                        className="hidden"
                        onChange={() => handleFileUpload("conferences")}
                      />
                      <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                        <label htmlFor="conferences" className="flex w-full cursor-pointer items-center">
                          {uploadedFiles.conferences ? (
                            <>
                              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                              <span>Konferanslar yüklendi</span>
                            </>
                          ) : (
                            <>
                              <FileUpload className="mr-2 h-4 w-4" />
                              <span>Konferanslarınızı yükleyin</span>
                            </>
                          )}
                        </label>
                      </div>
                    </div>
                    {uploadedFiles.conferences && (
                      <Button variant="outline" size="sm">
                        Görüntüle
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Konferans yayınlarınızı ve katılım belgelerinizi tek bir PDF dosyası olarak yükleyin.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="criteria" className="pt-4">
                <div className="space-y-4">
                  <p className="text-sm">Bu pozisyon için aşağıdaki kriterleri karşılamanız gerekmektedir:</p>

                  <div className="space-y-2">
                    {listing.criteria.map((criterion, index) => (
                      <div key={index} className="flex items-start gap-2 rounded-md border p-3">
                        {criterion.required ? (
                          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
                        ) : (
                          <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                        )}
                        <div>
                          <h4 className="font-medium">{criterion.name}</h4>
                          <p className="text-sm text-gray-600">{criterion.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => router.back()}>
              İptal
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Başvuru Yapılıyor..." : "Başvuruyu Tamamla"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  )
}
