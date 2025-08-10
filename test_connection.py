import pymysql

try:
    conn = pymysql.connect(
        host='localhost',
        port=3307,
        user='root',
        password='',
        database='expense_tracker_db'
    )
    print("Connection successful!")
    
    cursor = conn.cursor()
    cursor.execute("SHOW TABLES")
    tables = cursor.fetchall()
    print(f"Found {len(tables)} tables:")
    for table in tables:
        print(f"  - {table[0]}")
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f"Connection failed: {e}")