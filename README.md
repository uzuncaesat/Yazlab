### Akademik Personel Başvuru Sistemi

## Proje Özeti

- Akademik personel başvurularını yönetmek için geliştirilmiş web tabanlı bir sistemdir.
- Adayların başvuru yapmasını, yöneticilerin başvuruları değerlendirmesini ve jüri üyelerinin değerlendirme yapmasını sağlar.
- TC Kimlik doğrulama ve E-Devlet entegrasyonu ile güvenli giriş imkanı sunar.
- Farklı kullanıcı rolleri (aday, admin, yönetici, jüri) için özelleştirilmiş paneller içerir.


## Geliştirme Ortamı

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: FastAPI, Python, SQLAlchemy
- **Veritabanı**: PostgreSQL
- **Konteynerizasyon**: Docker, Docker Compose
- **Kimlik Doğrulama**: JWT, TC Kimlik Doğrulama Servisi


## Kurulum ve Çalıştırma

### Gereksinimler

- Node.js (v18 veya üzeri)
- Python (v3.10 veya üzeri)
- Docker ve Docker Compose
- PostgreSQL


### Backend Kurulumu

1. Projeyi klonlayın:

```shellscript
git clone https://github.com/kullanici/akademik-basvuru-sistemi.git
cd akademik-basvuru-sistemi
```


2. Python sanal ortamı oluşturun ve bağımlılıkları yükleyin:

```shellscript
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```


3. Veritabanını oluşturun:

```shellscript
python create_db.py
```


4. Backend'i çalıştırın:

```shellscript
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```




### Frontend Kurulumu

1. Frontend bağımlılıklarını yükleyin:

```shellscript
npm install
```


2. Çevre değişkenlerini ayarlayın:

```shellscript
cp .env.example .env.local
# .env.local dosyasını düzenleyin
```


3. Frontend'i geliştirme modunda çalıştırın:

```shellscript
npm run dev
```




### Docker ile Kurulum

1. Docker Compose ile tüm sistemi başlatın:

```shellscript
docker-compose up -d
```

2. Tarayıcınızda `http://localhost:3000` adresine giderek uygulamaya erişebilirsiniz.


## Kullanıcı Rolleri ve Özellikler

- **Aday**: İlanlara başvuru yapabilir, başvuru durumunu takip edebilir, belgelerini yükleyebilir.
- **Admin**: İlanları oluşturabilir, düzenleyebilir, kullanıcıları yönetebilir.
- **Yönetici**: Başvuruları değerlendirebilir, jüri atayabilir, kriterleri belirleyebilir.
- **Jüri**: Kendisine atanan başvuruları değerlendirebilir, rapor yazabilir.


## Güvenlik Özellikleri

- JWT tabanlı kimlik doğrulama
- TC Kimlik doğrulama entegrasyonu
- E-Devlet ile giriş imkanı
- Rol tabanlı yetkilendirme
- Güvenli dosya yükleme ve doğrulama


## Ekran Resimleri
C:\Users\esat berat\Desktop\Yeni klasör\resim1.jpg
