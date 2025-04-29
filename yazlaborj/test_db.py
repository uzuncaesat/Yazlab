import psycopg2

try:
    # Açıkça encoding parametresini belirtelim
    conn = psycopg2.connect(
        host="localhost",
        port="5432",
        user="postgres",
        password="postgres",
        database="academic_db",
        client_encoding='utf8'
    )
    print("Bağlantı başarılı!")
    
    # Veritabanı encoding'ini kontrol edelim
    cursor = conn.cursor()
    cursor.execute("SHOW client_encoding;")
    client_encoding = cursor.fetchone()[0]
    print(f"Client encoding: {client_encoding}")
    
    cursor.execute("SHOW server_encoding;")
    server_encoding = cursor.fetchone()[0]
    print(f"Server encoding: {server_encoding}")
    
    cursor.close()
    conn.close()
except Exception as e:
    print(f"Bağlantı hatası: {e}")
