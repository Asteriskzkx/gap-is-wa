# การติดตั้งและตั้งค่าระบบ

ในบทนี้จะอธิบายขั้นตอนการติดตั้งระบบ การตั้งค่าพื้นฐานหลังการติดตั้ง และการเชื่อมต่อกับระบบอื่น ๆ เพื่อให้สามารถใช้งานได้อย่างสมบูรณ์

## 2.1 วิธีการติดตั้งระบบและการตั้งค่าพื้นฐานหลังการติดตั้ง

ระบบนี้ทำงานบน Next.js สำหรับเว็บแอปพลิเคชัน และ PostgreSQL สำหรับฐานข้อมูล โดยใช้ Docker ในการจัดการ Container ทั้งหมด และใช้ Nginx เป็น Reverse Proxy สำหรับจัดการ SSL/TLS โดยคู่มือนี้จะใช้ Terminal ในการตั้งค่าระบบและใช้ Docker ในการติดตั้งและจัดการตัวระบบ

### 2.1.1 ความต้องการเบื้องต้น (Prerequisites)

ก่อนเริ่มติดตั้งระบบ ผู้ติดตั้งจะต้องเตรียมซอฟต์แวร์ต่อไปนี้ให้พร้อมบนเครื่องเซิร์ฟเวอร์หรือเครื่องที่ต้องการติดตั้ง

- **Git** – สำหรับ Clone ซอร์สโค้ดของโปรเจกต์จาก GitHub Repository
- **Docker** และ **Docker Compose** – สำหรับสร้างและจัดการ Container ของแอปพลิเคชัน ฐานข้อมูล และ Nginx
- **OpenSSL** – สำหรับสร้าง SSL Certificate (กรณีใช้งานในโหมด Development)
- **Node.js เวอร์ชัน 18 ขึ้นไป** – สำหรับการพัฒนาบนเครื่องโดยตรง (กรณีไม่ใช้ Docker)

### 2.1.2 ขั้นตอนการติดตั้งระบบ

#### 2.1.2.1 Clone ซอร์สโค้ดจาก GitHub Repository

เปิด Terminal หรือ Command Prompt แล้วใช้คำสั่งต่อไปนี้เพื่อดาวน์โหลดซอร์สโค้ดของโปรเจกต์

```bash
git clone https://github.com/Asteriskzkx/gap-is-wa.git
cd gap-is-wa
```

#### 2.1.2.2 การตั้งค่าไฟล์ Environment Variables (.env)

ไฟล์ `.env` เป็นไฟล์ที่ใช้เก็บค่าตัวแปรสภาพแวดล้อม (Environment Variables) ที่ระบบต้องการ โดยใช้คำสั่งต่อไปนี้เพื่อสร้างไฟล์ `.env` จากไฟล์ตัวอย่าง

```bash
cp .env.example .env
```

จากนั้นเปิดไฟล์ `.env` ด้วยโปรแกรมแก้ไขข้อความ (Text Editor) เช่น nano, vim หรือ VS Code เพื่อกำหนดค่าตัวแปรต่าง ๆ ให้ตรงกับสภาพแวดล้อมที่ต้องการ

โดยไฟล์ `.env` จะมีค่าที่เกี่ยวข้องทั้งหมดซึ่งประกอบไปด้วยดังต่อไปนี้

| ตัวแปร                 | คำอธิบาย                                                                                                                             |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| POSTGRES_USER          | ชื่อผู้ใช้สำหรับเชื่อมต่อกับฐานข้อมูล PostgreSQL                                                                                     |
| POSTGRES_PASSWORD      | รหัสผ่านสำหรับเชื่อมต่อกับฐานข้อมูล PostgreSQL                                                                                       |
| POSTGRES_DB            | ชื่อฐานข้อมูลที่ใช้งานใน PostgreSQL                                                                                                  |
| POSTGRES_PORT          | พอร์ตที่ใช้งานสำหรับ PostgreSQL (ค่าเริ่มต้นคือ 5433)                                                                                |
| DATABASE_URL           | URL สำหรับเชื่อมต่อฐานข้อมูล PostgreSQL ผ่าน Prisma ORM โดยจะแตกต่างกันตามสภาพแวดล้อม (Local, Docker, Azure)                         |
| NEXTAUTH_SECRET        | คีย์ลับที่ใช้สำหรับการยืนยันตัวตน (Authentication) และการเข้ารหัสข้อมูล Session ของ NextAuth.js (ต้องมีความยาวอย่างน้อย 32 ตัวอักษร) |
| NEXTAUTH_URL           | URL ของแอปพลิเคชันที่ NextAuth.js จะเรียกใช้ เช่น http://localhost:3000 หรือ URL ใน Production                                       |
| UPLOADTHING_TOKEN      | Token สำหรับเชื่อมต่อกับบริการ UploadThing (ใช้สำหรับอัปโหลดไฟล์)                                                                    |
| NODE_ENV               | ระบุว่าเปิดใช้งานโหมดใด (ค่าตัวอย่าง: development หรือ production)                                                                   |
| DEFAULT_ADMIN_EMAIL    | อีเมลของผู้ดูแลระบบเริ่มต้น                                                                                                          |
| DEFAULT_ADMIN_PASSWORD | รหัสผ่านของผู้ดูแลระบบเริ่มต้น                                                                                                       |
| DEFAULT_ADMIN_NAME     | ชื่อของผู้ดูแลระบบเริ่มต้น                                                                                                           |
| DEFAULT_PASSWORD       | รหัสผ่านเริ่มต้นสำหรับผู้ใช้ที่ถูกสร้างขึ้นในระบบ                                                                                    |

เมื่อตั้งค่าเรียบร้อยแล้ว ให้บันทึกค่า จากนั้นใช้คำสั่ง `cd ~/<ชื่อโฟลเดอร์ที่ใช้>` เพื่อกลับไปยังโฟลเดอร์หลัก

**หมายเหตุ:** สำหรับการใช้งานบน Docker Compose ให้ตั้งค่า DATABASE_URL เป็น

```
DATABASE_URL="postgresql://gapuser:gappassword@postgres:5432/gapdb?schema=public"
```

สำหรับการพัฒนาบนเครื่องโดยตรง (Local Development) ให้ตั้งค่า DATABASE_URL เป็น

```
DATABASE_URL="postgresql://gapuser:gappassword@localhost:5433/gapdb?schema=public"
```

#### 2.1.2.3 การสร้าง SSL Certificate

ระบบใช้ HTTPS ในการสื่อสารเพื่อความปลอดภัยของข้อมูล สำหรับการใช้งานในโหมด Development จะต้องสร้าง Self-Signed SSL Certificate โดยใช้คำสั่งต่อไปนี้

**สำหรับ Linux/macOS:**

```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/server.key \
  -out ssl/server.crt \
  -subj "/C=TH/ST=Bangkok/L=Bangkok/O=Development/OU=IT/CN=localhost"
```

**สำหรับ Windows PowerShell:**

```powershell
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ssl/server.key -out ssl/server.crt -subj "/C=TH/ST=Bangkok/L=Bangkok/O=Development/OU=IT/CN=localhost"
```

คำสั่งนี้จะสร้างไฟล์ Certificate 2 ไฟล์ในโฟลเดอร์ `ssl/` ดังนี้

- `server.crt` – ไฟล์ Certificate
- `server.key` – ไฟล์ Private Key

**หมายเหตุ:** Self-Signed Certificate ใช้ได้เฉพาะในโหมด Development เท่านั้น สำหรับ Production ต้องใช้ Certificate จาก Certificate Authority (CA) ที่เชื่อถือได้ หรือใช้บริการ Azure ที่จัดการ SSL/TLS ให้อัตโนมัติ

#### 2.1.2.4 การตั้งค่าเพื่อเริ่มใช้งานบน Docker

ใช้คำสั่งต่อไปนี้เพื่อ Build และเริ่มใช้งาน Container ทั้งหมด

```bash
docker compose -f docker-compose.yml up -d
```

หรือ

```bash
docker-compose up -d --build
```

(อาจใช้เวลาสักครู่ขึ้นอยู่กับความเร็วอินเทอร์เน็ต)

คำสั่งนี้จะสร้างและเริ่มต้น Container จำนวน 4 ตัว ดังนี้

| Container         | คำอธิบาย                                        |
| ----------------- | ----------------------------------------------- |
| gap-is-wa-db      | ฐานข้อมูล PostgreSQL 15                         |
| gap-is-wa-app     | แอปพลิเคชัน Next.js (เว็บแอปพลิเคชันหลัก)       |
| gap-is-wa-migrate | Prisma Migration (รันครั้งเดียวเพื่อสร้างตาราง) |
| gap-is-wa-nginx   | Nginx Reverse Proxy พร้อม SSL                   |

เมื่อเรียบร้อยแล้วใช้คำสั่ง `docker ps` เพื่อตรวจสอบสถานะของ Container ทั้งหมด

```bash
docker ps
```

ตัวอย่างผลลัพธ์:

| CONTAINER ID | IMAGE              | STATUS | PORTS                                    |
| ------------ | ------------------ | ------ | ---------------------------------------- |
| xxxxxxxxxxxx | nginx:alpine       | Up     | 0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp |
| xxxxxxxxxxxx | gap-is-wa          | Up     | 0.0.0.0:3000->3000/tcp                   |
| xxxxxxxxxxxx | postgres:15-alpine | Up     | 0.0.0.0:5433->5432/tcp                   |

**หมายเหตุ:** กรณีเกิดข้อผิดพลาดดังข้อความต่อไปนี้ "permission denied while trying to connect to the Docker daemon socket at unix:///var/run/docker.sock: Get "http://%2Fvar%2Frun%2Fdocker.sock/v1.48/containers/json":dial unix /var/run/docker.sock: connect: permission denied" ให้เติม `sudo` หน้าคำสั่ง

```bash
sudo docker compose -f docker-compose.yml up -d
```

#### 2.1.2.5 การตั้งค่า Nginx

ระบบใช้ Nginx เป็น Reverse Proxy สำหรับส่งต่อการเชื่อมต่อไปยังแอปพลิเคชัน Next.js พร้อมจัดการ SSL/TLS

ไฟล์การตั้งค่า Nginx อยู่ที่ `nginx.conf` ในโฟลเดอร์หลักของโปรเจกต์ โดยมีการตั้งค่าหลักดังนี้

- **HTTP (พอร์ต 80)** – Redirect การเชื่อมต่อทั้งหมดไปยัง HTTPS อัตโนมัติ
- **HTTPS (พอร์ต 443)** – จัดการ SSL Certificate และส่งต่อการเชื่อมต่อไปยัง Next.js ที่พอร์ต 3000

กรณีต้องการเปลี่ยน Domain ให้เปิดไฟล์ `nginx.conf` ด้วยโปรแกรมแก้ไขข้อความ แล้วเปลี่ยนค่า `server_name` จาก `localhost` เป็น Domain ที่ต้องการ ดังนี้

```nginx
# HTTP Server Block - Redirect to HTTPS
server {
    listen 80;
    server_name your-domain.com;    # (A) เปลี่ยนเป็น Domain ที่ต้องการ
    return 301 https://$host$request_uri;
}

# HTTPS Server Block
server {
    listen 443 ssl http2;
    server_name your-domain.com;    # (B) เปลี่ยนเป็น Domain ที่ต้องการ
    ...
}
```

**สำหรับ Azure Deployment:** ใช้ไฟล์ `nginx.azure.conf` แทน เนื่องจาก Azure จัดการ SSL/TLS ให้อัตโนมัติ Nginx เพียงรับฟังพอร์ต 80 เท่านั้น

### 2.1.3 การตั้งค่าพื้นฐานหลังการติดตั้ง

#### 2.1.3.1 การเข้าถึงแอปพลิเคชัน

หลังจากติดตั้งเสร็จสมบูรณ์ สามารถเข้าถึงแอปพลิเคชันได้ผ่าน

- **HTTPS (แนะนำ):** `https://localhost`
- **HTTP:** `http://localhost` (จะ Redirect ไป HTTPS อัตโนมัติ)

**หมายเหตุ:** เมื่อเข้า HTTPS ครั้งแรก เว็บเบราว์เซอร์จะเตือนเรื่อง Certificate เนื่องจากเป็น Self-Signed Certificate ซึ่งเป็นเรื่องปกติสำหรับการใช้งานในโหมด Development

- **Google Chrome/Microsoft Edge:** กด "Advanced" → "Proceed to localhost (unsafe)"
- **Mozilla Firefox:** กด "Advanced" → "Accept the Risk and Continue"

#### 2.1.3.2 การเข้าสู่ระบบครั้งแรก

ระบบจะสร้างบัญชีผู้ดูแลระบบ (Admin) เริ่มต้นจากค่าที่กำหนดไว้ในไฟล์ `.env` โดยใช้ค่าต่อไปนี้ในการเข้าสู่ระบบครั้งแรก

- **อีเมล:** ค่าที่กำหนดใน `DEFAULT_ADMIN_EMAIL`
- **รหัสผ่าน:** ค่าที่กำหนดใน `DEFAULT_ADMIN_PASSWORD`

หลังเข้าสู่ระบบครั้งแรก ผู้ดูแลระบบสามารถดำเนินการจัดการระบบเบื้องต้นได้ เช่น

1. **เปลี่ยนรหัสผ่าน** – แนะนำให้เปลี่ยนรหัสผ่านเริ่มต้นเพื่อความปลอดภัย
2. **สร้างบัญชีผู้ใช้** – สร้างบัญชีสำหรับเกษตรกร ผู้ตรวจประเมิน และคณะกรรมการ ผ่านเมนูจัดการผู้ใช้ (User Management)
3. **ตรวจสอบการเชื่อมต่อฐานข้อมูล** – ตรวจสอบว่าระบบเชื่อมต่อกับฐานข้อมูล PostgreSQL ได้ถูกต้อง

#### 2.1.3.3 การเข้าถึงฐานข้อมูล PostgreSQL

สามารถเข้าถึงฐานข้อมูลโดยตรงผ่าน Terminal ด้วยคำสั่ง

```bash
docker exec -it gap-is-wa-db psql -U gapuser -d gapdb
```

หรือใช้โปรแกรม Database Client เช่น DBeaver โดยใช้ข้อมูลการเชื่อมต่อดังนี้

| รายการ   | ค่า         |
| -------- | ----------- |
| Host     | localhost   |
| Port     | 5433        |
| Database | gapdb       |
| Username | gapuser     |
| Password | gappassword |

#### 2.1.3.4 การใช้ Prisma Studio

Prisma Studio เป็นเครื่องมือสำหรับดูและแก้ไขข้อมูลในฐานข้อมูลผ่านหน้าเว็บ สามารถเปิดใช้งานด้วยคำสั่ง

```bash
npx prisma studio
```

จากนั้นเข้าถึงผ่าน `http://localhost:5555`
