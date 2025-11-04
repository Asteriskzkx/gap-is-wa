# ระบบสารสนเทศสำหรับการจัดการข้อมูลทางการเกษตรผลผลิตยางพาราตามมาตรฐานจีเอพี

[![Deploy to Azure](https://img.shields.io/badge/Deploy%20to-Azure-0078D4?logo=microsoft-azure)](https://portal.azure.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)](https://www.docker.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14-000000?logo=next.js)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql)](https://www.postgresql.org/)
[![HTTPS](https://img.shields.io/badge/HTTPS-Enabled-00C853?logo=letsencrypt)](https://letsencrypt.org/)

> 💡 **สำหรับนักศึกษา:** Deploy ฟรีบน Azure ด้วย $100 credit จาก [GitHub Student Developer Pack](https://education.github.com/pack)

## 🚀 ภาพรวม

ระบบสารสนเทศสำหรับการจัดการข้อมูลทางการเกษตรผลผลิตยางพาราตามมาตรฐานจีเอพี (GAP - Good Agricultural Practices) เป็นแพลตฟอร์มที่พัฒนาขึ้นเพื่อช่วยเกษตรกรผู้ปลูกยางพาราและหน่วยงานรับรองมาตรฐาน ในการบริหารจัดการข้อมูลฟาร์ม ผลผลิตยางพารา และกระบวนการรับรองมาตรฐานจีเอพีอย่างเป็นระบบ

## ✨ คุณสมบัติ

- 👨‍🌾 การจัดการข้อมูลเกษตรกรและสวนยางพารา
- 🌱 การบันทึกและติดตามข้อมูลการเพาะปลูก การดูแล และการเก็บเกี่ยวผลผลิตยางพารา
- 📋 ระบบประเมินและรับรองมาตรฐานจีเอพีสำหรับผลผลิตยางพารา
- 📊 การวิเคราะห์และรายงานผลข้อมูลการผลิตและคุณภาพยางพารา
- 🔐 ระบบจัดการสิทธิ์และความปลอดภัยสำหรับผู้ใช้งานหลายระดับ

## 🛠️ เทคโนโลยีที่ใช้

- **Fullstack**: Next.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js, JWT
- **Containerization**: Docker, Docker Compose
- **CI/CD**: GitHub Actions

## 📋 ความต้องการเบื้องต้น

### สำหรับ Development (Local)

- Node.js (v18+)
- Docker และ Docker Compose
- Git
- OpenSSL (สำหรับสร้าง SSL certificate)

### สำหรับ Production (Azure)

- Azure Account (ใช้ GitHub Student Pack สำหรับ $100 credit)
- Azure CLI (`az`)
- Docker (สำหรับ build image)

## 🚀 Quick Start

### 🏠 Local Development (Docker)

```bash
# 1. Clone และติดตั้ง
git clone https://github.com/Asteriskzkx/gap-is-wa.git
cd gap-is-wa

# 2. สร้าง SSL certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/server.key -out ssl/server.crt \
  -subj "/C=TH/ST=Bangkok/L=Bangkok/O=Development/OU=IT/CN=localhost"

# 3. ตั้งค่า environment
cp .env.example .env

# 4. เริ่มใช้งาน
docker-compose up -d

# 5. เข้าถึง: https://localhost
```

### ☁️ Deploy to Azure (Production)

```bash
# 1. Login Azure
az login

# 2. ติดตั้ง Azure CLI (ถ้ายังไม่มี)
# Windows: winget install Microsoft.AzureCLI
# Mac: brew install azure-cli
# Linux: curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# 3. Deploy (รายละเอียดดูในส่วน "การ Deploy Production")
az group create --name gap-is-wa-rg --location southeastasia
# ... (ดูขั้นตอนเต็มด้านล่าง)
```

---

## 🚀 การติดตั้งและการตั้งค่า

### 1. Clone repository

```bash
git clone https://github.com/Asteriskzkx/gap-is-wa.git
cd gap-is-wa
```

### 2. สร้างไฟล์ .env (หรือใช้ตัวอย่าง)

```bash
cp .env.example .env
```

### 3. ปรับแต่งการตั้งค่าใน .env ตามต้องการ

```
# Database Configuration
POSTGRES_USER=gapuser
POSTGRES_PASSWORD=gappassword
POSTGRES_DB=gapdb
POSTGRES_PORT=5433

# เลือกใช้ DATABASE_URL ตามสภาพแวดล้อม
# สำหรับพัฒนาบน localhost
DATABASE_URL="postgresql://gapuser:gappassword@localhost:5433/gapdb?schema=public"
# หรือสำหรับ Docker Compose
# DATABASE_URL="postgresql://gapuser:gappassword@postgres:5432/gapdb?schema=public"
```

### 4. สร้าง SSL Certificate สำหรับ Development

**⚠️ สำคัญ:** Certificate files จะไม่ถูก commit ลง GitHub เพื่อความปลอดภัย

```bash
# สร้าง self-signed certificate (ใช้ได้ 365 วัน)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/server.key \
  -out ssl/server.crt \
  -subj "/C=TH/ST=Bangkok/L=Bangkok/O=Development/OU=IT/CN=localhost"
```

**Windows PowerShell:**

```powershell
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ssl/server.key -out ssl/server.crt -subj "/C=TH/ST=Bangkok/L=Bangkok/O=Development/OU=IT/CN=localhost"
```

### 5. เริ่มใช้งานด้วย Docker Compose

```bash
docker-compose up -d
```

### 6. เข้าถึงแอปพลิเคชัน

- **HTTPS (แนะนำ):** `https://localhost`
- **HTTP:** `http://localhost` (จะ redirect ไป HTTPS อัตโนมัติ)

**หมายเหตุ:** เมื่อเข้า HTTPS ครั้งแรก browser จะเตือนเรื่อง certificate เนื่องจากเป็น self-signed certificate (ปกติสำหรับ development)

- **Chrome/Edge:** กด "Advanced" → "Proceed to localhost (unsafe)"
- **Firefox:** กด "Advanced" → "Accept the Risk and Continue"

## 💻 การพัฒนา

### การพัฒนาบนเครื่องโดยตรง

```bash
# ติดตั้ง dependencies
npm install

# รัน migration ฐานข้อมูล
npx prisma migrate dev

# สร้าง Prisma Client
npx prisma generate

# รัน development server
npm run dev
```

### การใช้ Prisma Studio

```bash
npx prisma studio
```

### การรัน Next.js เชื่อมต่อกับ Docker Database

```bash
# ปรับ DATABASE_URL ใน .env เป็น
# DATABASE_URL="postgresql://gapuser:gappassword@postgres:5432/gapdb?schema=public""

npm run dev
```

## 🐛 การแก้ไขปัญหา

### การเข้าถึงฐานข้อมูล PostgreSQL

- **Terminal**: `docker exec -it gap-is-wa-db psql -U gapuser -d gapdb`
- **DBeaver หรือ Database Client อื่นๆ**:
  - Host: `localhost`
  - Port: `5433`
  - Database: `gapdb`
  - Username: `gapuser`
  - Password: `gappassword`

### ปัญหาการ Migrate ฐานข้อมูล

```bash
# ตรวจสอบสถานะ migration
npx prisma migrate status

# รีเซ็ตฐานข้อมูล (ใช้ระวัง - ข้อมูลจะหายทั้งหมด)
npx prisma migrate reset
```

### ปัญหาการเชื่อมต่อ Port

ถ้ามีปัญหา port 5432 ถูกใช้งานโดย PostgreSQL ในเครื่อง ให้ตรวจสอบด้วย:

```bash
netstat -aon | findstr :5432
```

### ปัญหา SSL Certificate

ถ้าลบหรือสูญหาย SSL certificate สามารถสร้างใหม่ได้ตามขั้นตอนในส่วน "สร้าง SSL Certificate" ด้านบน

## 🚀 การ Deploy Production

### สำหรับ Production Environment

**⚠️ สำคัญมาก:** ห้ามใช้ self-signed certificate ใน production!

#### ตัวเลือกที่ 1: ใช้ Let's Encrypt (ฟรี - แนะนำ)

```bash
# ติดตั้ง Certbot
apt-get update
apt-get install certbot python3-certbot-nginx

# ขอ certificate (จะอัพเดท nginx.conf อัตโนมัติ)
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# ตั้งค่า auto-renewal
certbot renew --dry-run
```

**หมายเหตุ:** Let's Encrypt ต้องการ:

- Domain name ที่ชี้ไปยัง server (ไม่สามารถใช้กับ localhost)
- Port 80 และ 443 เปิดและเข้าถึงได้จากอินเทอร์เน็ต

#### ตัวเลือกที่ 2: ใช้ Certificate จาก Certificate Authority

1. ซื้อ certificate จาก CA (DigiCert, Comodo, GoDaddy, ฯลฯ)
2. วางไฟล์ certificate ใน `ssl/`:
   ```
   ssl/
   ├── production.crt  # Certificate
   ├── production.key  # Private key
   └── ca-bundle.crt   # CA Bundle (ถ้ามี)
   ```
3. แก้ไข `nginx.conf`:
   ```nginx
   ssl_certificate /etc/nginx/ssl/production.crt;
   ssl_certificate_key /etc/nginx/ssl/production.key;
   ```

#### ตัวเลือกที่ 3: Deploy บน Azure (แนะนำสำหรับ GitHub Student Pack)

> 💡 **สำหรับนักศึกษา:** ใช้ Azure Student credit $100 จาก GitHub Education Pack
>
> 📖 **คู่มือเต็ม:**
>
> - **[AZURE_DEPLOYMENT.md](./AZURE_DEPLOYMENT.md)** - วิธี Deploy ทีละขั้นตอน
> - **[NGINX_AZURE_GUIDE.md](./NGINX_AZURE_GUIDE.md)** - การแก้ไข Nginx Config สำหรับ Azure

**ข้อดี:**

- ✅ ไม่ต้องจัดการ SSL certificate เอง (Azure จัดการให้อัตโนมัติ)
- ✅ ใช้ HTTPS ได้ทันทีผ่าน Azure domain (\*.azurewebsites.net)
- ✅ รองรับ custom domain + free managed certificate
- ✅ Auto-scaling และ monitoring built-in

**🔧 สำคัญ: Nginx Configuration สำหรับ Azure**

Azure จัดการ SSL/TLS ให้ ดังนั้น:

- ใช้ `nginx.azure.conf` (ไม่ใช่ `nginx.conf`)
- ไม่ต้องมี SSL certificates ใน container
- Nginx listen port 80 เท่านั้น (Azure handle HTTPS)
- อ่าน [NGINX_AZURE_GUIDE.md](./NGINX_AZURE_GUIDE.md) สำหรับรายละเอียด

##### วิธีที่ 1: Azure Container Apps (แนะนำ - ง่ายและประหยัด)

**ทำไมต้องเลือก Container Apps:**

- 💰 Pay-per-use (คิดเฉพาะเวลาที่มีคนใช้งาน)
- 🚀 Scale to zero (ไม่มีค่าใช้จ่ายเมื่อไม่มีคนใช้)
- 🔒 HTTPS อัตโนมัติด้วย managed certificate
- 🐳 Deploy Docker image โดยตรง

**🚀 Deploy แบบอัตโนมัติ (แนะนำ):**

```bash
# Linux/Mac
chmod +x azure-deploy.sh
./azure-deploy.sh

# Windows PowerShell
.\azure-deploy.ps1
```

Script จะทำทุกอย่างให้อัตโนมัติ รวมถึง:

- สร้าง Resource Group, Container Registry, Database
- Build และ Push Docker image
- Deploy Container App พร้อม HTTPS
- Configure environment variables

---

**📋 Deploy แบบ Manual (ทีละขั้นตอน):**

```bash
# 1. Login Azure
az login

# 2. สร้าง Resource Group
az group create --name gap-is-wa-rg --location southeastasia

# 3. สร้าง Container Registry (สำหรับเก็บ Docker image)
az acr create --resource-group gap-is-wa-rg \
  --name gapcontainerreg --sku Basic

# 4. Build และ Push Docker image
az acr build --registry gapcontainerreg \
  --image gap-is-wa:latest .

# 5. สร้าง Container Apps Environment
az containerapp env create \
  --name gap-is-wa-env \
  --resource-group gap-is-wa-rg \
  --location southeastasia

# 6. สร้าง PostgreSQL Database
az postgres flexible-server create \
  --name gap-is-wa-db \
  --resource-group gap-is-wa-rg \
  --location southeastasia \
  --admin-user gapuser \
  --admin-password "YourSecurePassword123!" \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --storage-size 32

# 7. Deploy Container App
az containerapp create \
  --name gap-is-wa-app \
  --resource-group gap-is-wa-rg \
  --environment gap-is-wa-env \
  --image gapcontainerreg.azurecr.io/gap-is-wa:latest \
  --target-port 3000 \
  --ingress external \
  --registry-server gapcontainerreg.azurecr.io \
  --env-vars \
    NODE_ENV=production \
    DATABASE_URL="postgresql://gapuser:YourSecurePassword123!@gap-is-wa-db.postgres.database.azure.com:5432/postgres" \
    NEXTAUTH_SECRET="your-nextauth-secret" \
    NEXTAUTH_URL="https://gap-is-wa-app.kindsky-12345678.southeastasia.azurecontainerapps.io"
```

**HTTPS จะทำงานอัตโนมัติ!** ✨

- Azure Container Apps จัดการ SSL/TLS ให้อัตโนมัติ
- URL จะเป็น: `https://gap-is-wa-app.[environment-unique-id].southeastasia.azurecontainerapps.io`
- Certificate จะ renew อัตโนมัติ (ไม่ต้องกังวล)

**การใช้ Custom Domain (Optional):**

```bash
# 1. เพิ่ม custom domain
az containerapp hostname add \
  --hostname yourdomain.com \
  --resource-group gap-is-wa-rg \
  --name gap-is-wa-app

# 2. Azure จะสร้าง managed certificate ให้ฟรี!
az containerapp hostname bind \
  --hostname yourdomain.com \
  --resource-group gap-is-wa-rg \
  --name gap-is-wa-app \
  --validation-method CNAME
```

**ประมาณการค่าใช้จ่าย (จาก $100 credit):**

- Container Apps: ~$5-15/เดือน (ขึ้นอยู่กับการใช้งาน)
- PostgreSQL Flexible Server: ~$10-20/เดือน (Burstable tier)
- Container Registry: ~$5/เดือน (Basic tier)
- **รวม:** ~$20-40/เดือน → ใช้ได้ 2.5-5 เดือน จาก $100 credit

---

##### วิธีที่ 2: Azure App Service for Containers (ทางเลือก)

**เหมาะสำหรับ:**

- ต้องการ always-on application
- ไม่ต้องการ scale to zero

**ขั้นตอนการ Deploy:**

```bash
# 1. สร้าง App Service Plan
az appservice plan create \
  --name gap-is-wa-plan \
  --resource-group gap-is-wa-rg \
  --sku B1 \
  --is-linux

# 2. สร้าง Web App
az webapp create \
  --resource-group gap-is-wa-rg \
  --plan gap-is-wa-plan \
  --name gap-is-wa \
  --deployment-container-image-name gapcontainerreg.azurecr.io/gap-is-wa:latest

# 3. Configure environment variables
az webapp config appsettings set \
  --resource-group gap-is-wa-rg \
  --name gap-is-wa \
  --settings \
    NODE_ENV=production \
    DATABASE_URL="your-connection-string" \
    NEXTAUTH_SECRET="your-secret" \
    WEBSITES_PORT=3000

# 4. เปิด HTTPS-only
az webapp update \
  --resource-group gap-is-wa-rg \
  --name gap-is-wa \
  --https-only true
```

**HTTPS Configuration:**

- URL: `https://gap-is-wa.azurewebsites.net` (HTTPS อัตโนมัติ)
- Free managed certificate สำหรับ \*.azurewebsites.net
- Custom domain: ได้ฟรี managed certificate ด้วย!

**การใช้ Custom Domain:**

```bash
# 1. เพิ่ม custom domain
az webapp config hostname add \
  --webapp-name gap-is-wa \
  --resource-group gap-is-wa-rg \
  --hostname yourdomain.com

# 2. สร้าง managed certificate (ฟรี!)
az webapp config ssl create \
  --resource-group gap-is-wa-rg \
  --name gap-is-wa \
  --hostname yourdomain.com

# 3. Bind certificate
az webapp config ssl bind \
  --resource-group gap-is-wa-rg \
  --name gap-is-wa \
  --certificate-thumbprint <thumbprint> \
  --ssl-type SNI
```

**ประมาณการค่าใช้จ่าย:**

- App Service (B1): ~$13/เดือน
- PostgreSQL: ~$10-20/เดือน
- Container Registry: ~$5/เดือน
- **รวม:** ~$28-38/เดือน

---

##### วิธีที่ 3: Azure Container Instances (สำหรับ Testing/Demo)

**เหมาะสำหรับ:**

- Testing/Demo environment
- ค่าใช้จ่ายต่ำมาก
- ไม่มี HTTPS built-in (ต้องใช้ร่วมกับ Application Gateway)

```bash
# Deploy container
az container create \
  --resource-group gap-is-wa-rg \
  --name gap-is-wa-container \
  --image gapcontainerreg.azurecr.io/gap-is-wa:latest \
  --dns-name-label gap-is-wa \
  --ports 3000 \
  --environment-variables \
    NODE_ENV=production \
    DATABASE_URL="your-connection-string"
```

**⚠️ สำหรับ HTTPS บน Container Instances:**
ต้องใช้ Azure Application Gateway หรือ Azure Front Door (เพิ่มค่าใช้จ่าย ~$20-50/เดือน)

---

##### 📊 สรุปเปรียบเทียบ:

| Service                 | HTTPS            | ราคา/เดือน | Scale to Zero | แนะนำสำหรับ            |
| ----------------------- | ---------------- | ---------- | ------------- | ---------------------- |
| **Container Apps**      | ✅ ฟรี (Auto)    | $5-15      | ✅ ใช่        | **Production**         |
| **App Service**         | ✅ ฟรี (Auto)    | $13+       | ❌ ไม่        | Production (Always-on) |
| **Container Instances** | ⚠️ ต้องซื้อเพิ่ม | $2-5       | ✅ ใช่        | Testing/Demo           |

**💡 คำแนะนำ:** ใช้ **Azure Container Apps** เพราะ:

- HTTPS ฟรีอัตโนมัติ (ไม่ต้องจัดการ certificate)
- Scale to zero ประหยัด credit
- รองรับ custom domain + managed certificate ฟรี
- เหมาะกับ Docker container และงบ $100

---

##### 🔧 การตั้งค่า Nginx สำหรับ Azure Deployment

เมื่อ deploy บน Azure Container Apps/App Service คุณ**ไม่จำเป็นต้องใช้ Nginx** เพราะ:

- Azure จัดการ HTTPS/SSL ให้แล้ว
- มี built-in load balancer และ reverse proxy

**แต่ถ้าต้องการใช้ Nginx (Optional):**

- ใช้สำหรับ caching, rate limiting, custom routing
- SSL/TLS termination จะทำที่ Azure layer (ไม่ใช่ใน container)
- ตั้งค่า Nginx ให้ listen port 80 เท่านั้น (Azure จัดการ HTTPS)

```nginx
# nginx.conf สำหรับ Azure
server {
    listen 80;  # ไม่ต้อง listen 443 (Azure จัดการ)
    server_name _;

    location / {
        proxy_pass http://gap-is-wa:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $http_x_forwarded_proto;
    }
}
```

---

##### 📚 ทรัพยากรเพิ่มเติม:

- [Azure for Students](https://azure.microsoft.com/free/students/)
- [Azure Container Apps Documentation](https://learn.microsoft.com/azure/container-apps/)
- [Deploy Docker containers to Azure](https://learn.microsoft.com/azure/container-apps/quickstart-portal)
- [Azure Database for PostgreSQL](https://learn.microsoft.com/azure/postgresql/)

---

#### ตัวเลือกที่ 4: Cloudflare (ฟรี - เหมาะสำหรับเสริม)

**ใช้ Cloudflare เป็น CDN + SSL Proxy หน้า server:**

1. **สมัครใช้งาน Cloudflare (ฟรี)**
   - ชี้ Domain nameservers ไปที่ Cloudflare
2. **เปิดใช้งาน SSL/TLS**

   - ไปที่ SSL/TLS → Overview
   - เลือก "Full" หรือ "Full (Strict)"
   - Cloudflare จะสร้าง certificate ให้อัตโนมัติ

3. **ข้อดี:**
   - ✅ SSL/TLS ฟรีอัตโนมัติ
   - ✅ CDN ทำให้เว็บเร็วขึ้น
   - ✅ DDoS protection
   - ✅ ใช้ได้กับ server ใดก็ได้

---

### Environment Variables สำหรับ Production

```bash
# .env.production (สำหรับ Azure Container Apps)
NODE_ENV=production
NEXTAUTH_URL=https://gap-is-wa-app.[unique-id].southeastasia.azurecontainerapps.io
DATABASE_URL=postgresql://gapuser:password@gap-is-wa-db.postgres.database.azure.com:5432/postgres?sslmode=require
NEXTAUTH_SECRET=your-random-secret-min-32-chars
POSTGRES_SSL=true

# สำหรับ custom domain
NEXTAUTH_URL=https://yourdomain.com
```

**การสร้าง NEXTAUTH_SECRET:**

```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

---

### Security Checklist สำหรับ Production

#### 🔐 SSL/TLS

- [ ] ใช้ certificate จาก trusted CA (ไม่ใช่ self-signed)
- [ ] ตั้งค่า HSTS (Strict-Transport-Security header)
- [ ] Force HTTPS-only (ไม่อนุญาต HTTP)
- [ ] ใช้ TLS 1.2+ เท่านั้น (ปิด TLS 1.0, 1.1)

#### 🔒 Azure Specific

- [ ] เปิด "HTTPS Only" ใน Container Apps/App Service
- [ ] ใช้ Managed Identity สำหรับเข้าถึง Azure services
- [ ] เก็บ secrets ใน Azure Key Vault
- [ ] เปิด Azure Monitor สำหรับ logging

#### 💾 Database

- [ ] เปิด SSL connection สำหรับ PostgreSQL
- [ ] ใช้ strong password (มากกว่า 16 ตัวอักษร)
- [ ] จำกัด IP ที่สามารถเชื่อมต่อ database
- [ ] สำรองข้อมูลอัตโนมัติ (Azure backup)

#### 🛡️ Application

- [ ] อัพเดท dependencies เป็น version ล่าสุด
- [ ] ตั้งค่า rate limiting
- [ ] ตั้งค่า CORS อย่างเหมาะสม
- [ ] ห้าม expose error stack ใน production
- [ ] ใช้ environment variables สำหรับ secrets

#### 🗂️ Version Control

- [ ] ห้าม commit `.env` files
- [ ] ห้าม commit certificates (_.crt, _.key)
- [ ] ห้าม commit passwords หรือ API keys
- [ ] Review code ก่อน merge ทุกครั้ง

---

### 💰 การประหยัด Azure Credit ($100)

**Tips สำหรับนักศึกษา:**

1. **ใช้ Scale to Zero services:**

   - Azure Container Apps (คิดเงินเฉพาะเมื่อมีคนใช้)
   - Azure Functions Consumption Plan

2. **เลือก tier ที่เหมาะสม:**

   - Database: เริ่มจาก Burstable/Basic tier
   - Container Apps: 0.5 vCPU, 1 GB RAM เพียงพอสำหรับ development

3. **ตั้ง Budget Alert:**

   ```bash
   # ตั้งแจ้งเตือนเมื่อใช้เงินไป 50%, 75%, 90%
   az consumption budget create \
     --amount 100 \
     --budget-name student-budget \
     --time-grain monthly
   ```

4. **ลบ resources ที่ไม่ใช้:**

   ```bash
   # ลบ resource group ทั้งหมด
   az group delete --name gap-is-wa-rg --yes
   ```

5. **Monitor ค่าใช้จ่าย:**
   - ดูที่ [Azure Portal → Cost Management](https://portal.azure.com/#blade/Microsoft_Azure_CostManagement/Menu/overview)
   - ตรวจสอบทุก 3-5 วัน

**ประมาณการอายุการใช้งาน:**

- ใช้เต็มที่ 24/7: ~2.5 เดือน
- ใช้แค่วันทำงาน: ~4-5 เดือน
- Scale to zero: ~5-6 เดือน

## 🏗️ โครงสร้างโปรเจค

```
gap-is-wa/
├── prisma/            # Prisma schema และ migration files
├── src/               # Source code
│   ├── app/           # Next.js App Router
│   │   └── api/       # APIs
│   ├── components/    # React components
│   ├── controllers/   # Controller classes
│   ├── data/          # Jsons
│   ├── mappers/       # Mapper classes
│   ├── middleware/    # Middleware class
│   ├── models/        # Mapper classes
│   ├── repositories/  # Repositorie classes
│   ├── services/      # Service classes
│   ├── types/         # Type classes
│   └── utils/         # Utils classes
├── public/            # Static files
├── Dockerfile         # สำหรับสร้าง application image
├── Dockerfile.migrate # สำหรับ database migration
├── docker-compose.yml # การกำหนดค่า services
└── migrate.sh         # Script สำหรับ migration
```

## 📄 การอ้างอิง

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Docker Documentation](https://docs.docker.com/)
- [มาตรฐานการปฏิบัติทางการเกษตรที่ดี (Good Agricultural Practices: GAP)](https://www.acfs.go.th/)

## 📝 License

MIT License

---

พัฒนาโดย [วุฒิกานต์ ชัยสาร](https://github.com/Asteriskzkx) และ
[อัครนันท์ โฆษิตโชติอนันต์](https://github.com/Nud-Akkaranant)
