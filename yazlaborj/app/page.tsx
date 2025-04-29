import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="container mx-auto py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-900">Akademik Personel Başvuru Sistemi</h1>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="outline">Giriş Yap</Button>
            </Link>
            <Link href="/register">
              <Button>Kayıt Ol</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-12">
        <section className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold text-blue-900">Akademik Kariyerinizde İlerleyin</h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600">
            Akademik personel başvuru sistemimiz ile akademik kadrolara başvurularınızı kolayca yapabilir, başvuru
            durumunuzu takip edebilirsiniz.
          </p>
          <Link href="/login">
            <Button size="lg" className="bg-blue-800 hover:bg-blue-700">
              Hemen Başvur
            </Button>
          </Link>
        </section>

        <section className="grid gap-8 sm:grid-cols-1 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Aday</CardTitle>
              <CardDescription>Akademik kadrolara başvuru yapabilirsiniz</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Mevcut akademik ilanları görüntüleyebilir, başvurularınızı yapabilir ve durumlarını takip edebilirsiniz.
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/login" className="w-full">
                <Button className="w-full">Aday Girişi</Button>
              </Link>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Admin</CardTitle>
              <CardDescription>İlanları oluşturun ve düzenleyin</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Yeni ilanlar ekleyebilir, mevcut ilanları düzenleyebilir ve başvuruları yönetebilirsiniz.</p>
            </CardContent>
            <CardFooter>
              <Link href="/login" className="w-full">
                <Button className="w-full" variant="outline">
                  Admin Girişi
                </Button>
              </Link>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Yönetici / Jüri</CardTitle>
              <CardDescription>Başvuruları değerlendirin</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Başvuru kriterlerini belirleyebilir, jüri üyelerini atayabilir ve değerlendirme yapabilirsiniz.</p>
            </CardContent>
            <CardFooter>
              <Link href="/login" className="w-full">
                <Button className="w-full" variant="outline">
                  Yetkili Girişi
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </section>
      </main>

      <footer className="bg-blue-900 py-8 text-white">
        <div className="container mx-auto">
          <p className="text-center">© 2025 Kocaeli Üniversitesi - Akademik Personel Başvuru Sistemi</p>
        </div>
      </footer>
    </div>
  )
}
