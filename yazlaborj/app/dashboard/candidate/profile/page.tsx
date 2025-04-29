"use client"

import type React from "react"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-hooks"
import { User, Mail, Phone, MapPin, Briefcase, GraduationCap } from "lucide-react"

export default function CandidateProfile() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Mock profile data
  const [profileData, setProfileData] = useState({
    personalInfo: {
      name: user?.name || "",
      email: user?.email || "",
      phone: "+90 555 123 4567",
      address: "Kocaeli, Türkiye",
      birthDate: "01.01.1990",
    },
    education: [
      {
        id: "1",
        degree: "Doktora",
        field: "Bilgisayar Mühendisliği",
        institution: "Kocaeli Üniversitesi",
        startYear: "2015",
        endYear: "2020",
      },
      {
        id: "2",
        degree: "Yüksek Lisans",
        field: "Bilgisayar Mühendisliği",
        institution: "Kocaeli Üniversitesi",
        startYear: "2013",
        endYear: "2015",
      },
      {
        id: "3",
        degree: "Lisans",
        field: "Bilgisayar Mühendisliği",
        institution: "Kocaeli Üniversitesi",
        startYear: "2009",
        endYear: "2013",
      },
    ],
    experience: [
      {
        id: "1",
        position: "Araştırma Görevlisi",
        institution: "Kocaeli Üniversitesi",
        department: "Bilgisayar Mühendisliği",
        startYear: "2013",
        endYear: "Devam Ediyor",
      },
      {
        id: "2",
        position: "Yazılım Mühendisi",
        institution: "ABC Teknoloji",
        department: "Ar-Ge",
        startYear: "2011",
        endYear: "2013",
      },
    ],
  })

  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfileData({
      ...profileData,
      personalInfo: {
        ...profileData.personalInfo,
        [name]: value,
      },
    })
  }

  const handleSubmit = () => {
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Profil güncellendi",
        description: "Profil bilgileriniz başarıyla güncellendi.",
      })
      setIsSubmitting(false)
    }, 1500)
  }

  // Don't render until component is mounted
  if (!mounted) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Profil Bilgilerim</h1>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
          </Button>
        </div>

        <Tabs defaultValue="personal">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal">Kişisel Bilgiler</TabsTrigger>
            <TabsTrigger value="education">Eğitim Bilgileri</TabsTrigger>
            <TabsTrigger value="experience">İş Deneyimi</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Kişisel Bilgiler</CardTitle>
                <CardDescription>Kişisel bilgilerinizi güncelleyin</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Ad Soyad</Label>
                    <div className="relative">
                      <User className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        id="name"
                        name="name"
                        value={profileData.personalInfo.name}
                        onChange={handlePersonalInfoChange}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-posta</Label>
                    <div className="relative">
                      <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={profileData.personalInfo.email}
                        onChange={handlePersonalInfoChange}
                        className="pl-8"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefon</Label>
                    <div className="relative">
                      <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        id="phone"
                        name="phone"
                        value={profileData.personalInfo.phone}
                        onChange={handlePersonalInfoChange}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birthDate">Doğum Tarihi</Label>
                    <Input
                      id="birthDate"
                      name="birthDate"
                      value={profileData.personalInfo.birthDate}
                      onChange={handlePersonalInfoChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Adres</Label>
                  <div className="relative">
                    <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      id="address"
                      name="address"
                      value={profileData.personalInfo.address}
                      onChange={handlePersonalInfoChange}
                      className="pl-8"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Şifre Değiştir</CardTitle>
                <CardDescription>Hesap şifrenizi güncelleyin</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Mevcut Şifre</Label>
                  <Input id="currentPassword" type="password" />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Yeni Şifre</Label>
                    <Input id="newPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Yeni Şifre (Tekrar)</Label>
                    <Input id="confirmPassword" type="password" />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline">Şifreyi Değiştir</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="education" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Eğitim Bilgileri</CardTitle>
                <CardDescription>Eğitim geçmişinizi güncelleyin</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {profileData.education.map((edu) => (
                  <div key={edu.id} className="rounded-lg border p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center">
                          <GraduationCap className="mr-2 h-4 w-4 text-blue-500" />
                          <h3 className="font-semibold">
                            {edu.degree} - {edu.field}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-500">{edu.institution}</p>
                      </div>
                      <div className="text-sm text-gray-500">
                        {edu.startYear} - {edu.endYear}
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                      <Button variant="outline" size="sm">
                        Düzenle
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-500">
                        Sil
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <Button variant="outline">Yeni Eğitim Bilgisi Ekle</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="experience" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>İş Deneyimi</CardTitle>
                <CardDescription>İş deneyimlerinizi güncelleyin</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {profileData.experience.map((exp) => (
                  <div key={exp.id} className="rounded-lg border p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center">
                          <Briefcase className="mr-2 h-4 w-4 text-blue-500" />
                          <h3 className="font-semibold">{exp.position}</h3>
                        </div>
                        <p className="text-sm text-gray-500">
                          {exp.institution}, {exp.department}
                        </p>
                      </div>
                      <div className="text-sm text-gray-500">
                        {exp.startYear} - {exp.endYear}
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                      <Button variant="outline" size="sm">
                        Düzenle
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-500">
                        Sil
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <Button variant="outline">Yeni İş Deneyimi Ekle</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
