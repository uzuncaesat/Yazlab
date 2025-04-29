import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

# Önce postgres veritabanına bağlanın
try:
    # Herhangi bir veritabanına bağlanın (postgres varsayılan veritabanıdır)
    conn = psycopg2.connect(
        host="localhost",
        port="5432",
        user="postgres",
        password="postgres",
        database="postgres"
    )
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    
    cursor = conn.cursor()
    
    # Veritabanının var olup olmadığını kontrol edin
    cursor.execute("SELECT 1 FROM pg_database WHERE datname = 'academic_db'")
    exists = cursor.fetchone()
    
    if not exists:
        print("academic_db veritabanı oluşturuluyor...")
        # UTF8 encoding ile veritabanı oluşturun
        cursor.execute("CREATE DATABASE academic_db WITH ENCODING 'UTF8'")
        print("Veritabanı başarıyla oluşturuldu!")
    else:
        print("academic_db veritabanı zaten mevcut.")
    
    cursor.close()
    conn.close()
    
    # Şimdi yeni veritabanına bağlanıp test edelim
    test_conn = psycopg2.connect(
        host="localhost",
        port="5432",
        user="postgres",
        password="postgres",
        database="academic_db"
    )
    print("academic_db veritabanına bağlantı başarılı!")
    test_conn.close()
    
except Exception as e:
    print(f"Hata: {e}")
