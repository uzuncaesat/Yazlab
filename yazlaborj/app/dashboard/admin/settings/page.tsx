"use client"

import type React from "react"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

export default function AdminSettings() {
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Mock settings data
  const [settings, setSettings] = useState({
    general: {
      siteName: "Akademik Personel Başvuru Sistemi",
      contactEmail: "akademik@example.com",
      footerText: "© 2025 Kocaeli Üniversitesi - Akademik Personel Başvuru Sistemi",
    },
    notifications: {
      emailNotifications: true,
      applicationUpdates: true,
      systemAnnouncements: true,
      reminderEmails: false,
    },
    security: {
      twoFactorAuth: false,
      passwordExpiry: "90",
      sessionTimeout: "30",
    },
  })

  const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setSettings({
      ...settings,
      general: {
        ...settings.general,
        [name]: value,
      },
    })
  }

  const handleNotificationChange = (name: string, checked: boolean) => {
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [name]: checked,
      },
    })
  }

  const handleSecurityChange = (name: string, value: string | boolean) => {
    setSettings({
      ...settings,
      security: {
        ...settings.security,
        [name]: value,
      },
    })
  }

  const handleSubmit = () => {
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Ayarlar kaydedildi",
        description: "Sistem ayarları başarıyla güncellendi.",
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
          <h1 className="text-2xl font-bold">Sistem Ayarları</h1>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
          </Button>
        </div>

        <Tabs defaultValue="general">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">Genel</TabsTrigger>
            <TabsTrigger value="notifications">Bildirimler</TabsTrigger>
            <TabsTrigger value="security">Güvenlik</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Genel Ayarlar</CardTitle>
                <CardDescription>Sistem genel ayarlarını yapılandırın</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Adı</Label>
                  <Input
                    id="siteName"
                    name="siteName"
                    value={settings.general.siteName}
                    onChange={handleGeneralChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">İletişim E-postası</Label>
                  <Input
                    id="contactEmail"
                    name="contactEmail"
                    type="email"
                    value={settings.general.contactEmail}
                    onChange={handleGeneralChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="footerText">Alt Bilgi Metni</Label>
                  <Textarea
                    id="footerText"
                    name="footerText"
                    value={settings.general.footerText}
                    onChange={handleGeneralChange}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Görünüm Ayarları</CardTitle>
                <CardDescription>Sistem görünüm ayarlarını yapılandırın</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="theme">Tema</Label>
                  <Select defaultValue="light">
                    <SelectTrigger id="theme">
                      <SelectValue placeholder="Tema seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Açık Tema</SelectItem>
                      <SelectItem value="dark">Koyu Tema</SelectItem>
                      <SelectItem value="system">Sistem Teması</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Dil</Label>
                  <Select defaultValue="tr">
                    <SelectTrigger id="language">
                      <SelectValue placeholder="Dil seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tr">Türkçe</SelectItem>
                      <SelectItem value="en">İngilizce</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Bildirim Ayarları</CardTitle>
                <CardDescription>E-posta ve sistem bildirim ayarlarını yapılandırın</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="emailNotifications">E-posta Bildirimleri</Label>
                    <p className="text-sm text-gray-500">Sistem bildirimleri için e-posta gönder</p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={settings.notifications.emailNotifications}
                    onCheckedChange={(checked) => handleNotificationChange("emailNotifications", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="applicationUpdates">Başvuru Güncellemeleri</Label>
                    <p className="text-sm text-gray-500">Başvuru durumu değiştiğinde bildirim gönder</p>
                  </div>
                  <Switch
                    id="applicationUpdates"
                    checked={settings.notifications.applicationUpdates}
                    onCheckedChange={(checked) => handleNotificationChange("applicationUpdates", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="systemAnnouncements">Sistem Duyuruları</Label>
                    <p className="text-sm text-gray-500">Sistem duyuruları için bildirim gönder</p>
                  </div>
                  <Switch
                    id="systemAnnouncements"
                    checked={settings.notifications.systemAnnouncements}
                    onCheckedChange={(checked) => handleNotificationChange("systemAnnouncements", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="reminderEmails">Hatırlatma E-postaları</Label>
                    <p className="text-sm text-gray-500">Son başvuru tarihi yaklaşan ilanlar için hatırlatma gönder</p>
                  </div>
                  <Switch
                    id="reminderEmails"
                    checked={settings.notifications.reminderEmails}
                    onCheckedChange={(checked) => handleNotificationChange("reminderEmails", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Güvenlik Ayarları</CardTitle>
                <CardDescription>Sistem güvenlik ayarlarını yapılandırın</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="twoFactorAuth">İki Faktörlü Doğrulama</Label>
                    <p className="text-sm text-gray-500">Kullanıcılar için iki faktörlü doğrulamayı zorunlu kıl</p>
                  </div>
                  <Switch
                    id="twoFactorAuth"
                    checked={settings.security.twoFactorAuth as boolean}
                    onCheckedChange={(checked) => handleSecurityChange("twoFactorAuth", checked)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passwordExpiry">Şifre Geçerlilik Süresi (Gün)</Label>
                  <Select
                    value={settings.security.passwordExpiry}
                    onValueChange={(value) => handleSecurityChange("passwordExpiry", value)}
                  >
                    <SelectTrigger id="passwordExpiry">
                      <SelectValue placeholder="Süre seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 Gün</SelectItem>
                      <SelectItem value="60">60 Gün</SelectItem>
                      <SelectItem value="90">90 Gün</SelectItem>
                      <SelectItem value="180">180 Gün</SelectItem>
                      <SelectItem value="365">365 Gün</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Oturum Zaman Aşımı (Dakika)</Label>
                  <Select
                    value={settings.security.sessionTimeout}
                    onValueChange={(value) => handleSecurityChange("sessionTimeout", value)}
                  >
                    <SelectTrigger id="sessionTimeout">
                      <SelectValue placeholder="Süre seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 Dakika</SelectItem>
                      <SelectItem value="30">30 Dakika</SelectItem>
                      <SelectItem value="60">60 Dakika</SelectItem>
                      <SelectItem value="120">120 Dakika</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
