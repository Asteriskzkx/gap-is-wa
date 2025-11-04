# 🚀 คู่มือการ Deploy บน Azure สำหรับนักศึกษา

> 💰 ใช้ $100 Azure credit จาก [GitHub Student Developer Pack](https://education.github.com/pack)

## 📋 สารบัญ

- [เตรียมความพร้อม](#เตรียมความพร้อม)
- [Deploy แบบอัตโนมัติ](#deploy-แบบอัตโนมัติ)
- [Deploy แบบ Manual](#deploy-แบบ-manual)
- [การใช้ Custom Domain](#การใช้-custom-domain)
- [การ Monitor และ Debug](#การ-monitor-และ-debug)
- [การจัดการค่าใช้จ่าย](#การจัดการค่าใช้จ่าย)

---

## เตรียมความพร้อม

### 1. สมัคร GitHub Student Developer Pack

1. ไปที่ https://education.github.com/pack
2. Verify student status ด้วย email มหาวิทยาลัย
3. รับ $100 Azure credit (ใช้ได้ 12 เดือน)

### 2. ติดตั้ง Azure CLI

**Windows:**

```powershell
winget install Microsoft.AzureCLI
```

**Mac:**

```bash
brew install azure-cli
```

**Linux:**

```bash
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
```

### 3. Login Azure

```bash
az login
```

Browser จะเปิดขึ้นให้ login ด้วย Microsoft account ที่ผูกกับ Azure Student

### 4. ตรวจสอบ Subscription

```bash
# ดู subscription ทั้งหมด
az account list --output table

# ตั้ง default subscription (ถ้ามีหลายอัน)
az account set --subscription "Azure for Students"

# ตรวจสอบ credit คงเหลือ
az consumption budget list
```

---

## Deploy แบบอัตโนมัติ

### 🪟 Windows (PowerShell)

```powershell
# 1. เปิด PowerShell ในโฟลเดอร์โปรเจกต์
cd C:\path\to\gap-is-wa

# 2. รัน deployment script
.\azure-deploy.ps1
```

### 🐧 Linux/Mac (Bash)

```bash
# 1. เปิด Terminal ในโฟลเดอร์โปรเจกต์
cd /path/to/gap-is-wa

# 2. ให้สิทธิ์ execute
chmod +x azure-deploy.sh

# 3. รัน deployment script
./azure-deploy.sh
```

### สิ่งที่ Script จะทำ:

1. ✅ สร้าง Resource Group
2. ✅ สร้าง Container Registry
3. ✅ Build และ Push Docker image
4. ✅ สร้าง Container Apps Environment
5. ✅ สร้าง PostgreSQL Database
6. ✅ Deploy Container App พร้อม HTTPS
7. ✅ Configure environment variables อัตโนมัติ

**เวลาโดยประมาณ:** 10-15 นาที

**หลังจาก deploy เสร็จ:**

- URL: `https://gap-is-wa-app.[unique-id].southeastasia.azurecontainerapps.io`
- HTTPS ทำงานทันที (ไม่ต้องตั้งค่าเพิ่ม)
- Certificate auto-renew

---

## Deploy แบบ Manual

### ขั้นตอนที่ 1: สร้าง Resource Group

```bash
az group create \
  --name gap-is-wa-rg \
  --location southeastasia
```

**หมายเหตุ:** `southeastasia` = Singapore (ใกล้ไทยที่สุด, latency ต่ำ)

### ขั้นตอนที่ 2: สร้าง Container Registry

```bash
az acr create \
  --resource-group gap-is-wa-rg \
  --name gapcontainerreg \
  --sku Basic
```

**ค่าใช้จ่าย:** ~$5/เดือน

### ขั้นตอนที่ 3: Build และ Push Image

```bash
# Build และ push โดย Azure
az acr build \
  --registry gapcontainerreg \
  --image gap-is-wa:latest \
  .
```

**เวลา:** 5-10 นาที (ขึ้นอยู่กับความเร็วอินเทอร์เน็ต)

### ขั้นตอนที่ 4: สร้าง Container Apps Environment

```bash
az containerapp env create \
  --name gap-is-wa-env \
  --resource-group gap-is-wa-rg \
  --location southeastasia
```

### ขั้นตอนที่ 5: สร้าง PostgreSQL Database

```bash
az postgres flexible-server create \
  --name gap-is-wa-db \
  --resource-group gap-is-wa-rg \
  --location southeastasia \
  --admin-user gapuser \
  --admin-password "YourSecurePassword123!" \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --storage-size 32 \
  --version 15 \
  --public-access 0.0.0.0 \
  --yes
```

**ค่าใช้จ่าย:** ~$10-15/เดือน (Burstable tier)

**⚠️ สำคัญ:** เปลี่ยน `YourSecurePassword123!` เป็น password ที่แข็งแรง

### ขั้นตอนที่ 6: Deploy Container App

```bash
az containerapp create \
  --name gap-is-wa-app \
  --resource-group gap-is-wa-rg \
  --environment gap-is-wa-env \
  --image gapcontainerreg.azurecr.io/gap-is-wa:latest \
  --target-port 3000 \
  --ingress external \
  --registry-server gapcontainerreg.azurecr.io \
  --cpu 0.5 \
  --memory 1.0Gi \
  --min-replicas 0 \
  --max-replicas 3 \
  --env-vars \
    NODE_ENV=production \
    DATABASE_URL="postgresql://gapuser:YourSecurePassword123!@gap-is-wa-db.postgres.database.azure.com:5432/postgres?sslmode=require" \
    NEXTAUTH_SECRET="$(openssl rand -base64 32)" \
    POSTGRES_SSL=true
```

**ค่าใช้จ่าย:** ~$5-15/เดือน (ขึ้นอยู่กับการใช้งาน)

### ขั้นตอนที่ 7: รับ URL และอัพเดท NEXTAUTH_URL

```bash
# รับ URL
APP_URL=$(az containerapp show \
  --name gap-is-wa-app \
  --resource-group gap-is-wa-rg \
  --query properties.configuration.ingress.fqdn \
  --output tsv)

# แสดง URL
echo "Your app URL: https://$APP_URL"

# อัพเดท NEXTAUTH_URL
az containerapp update \
  --name gap-is-wa-app \
  --resource-group gap-is-wa-rg \
  --set-env-vars NEXTAUTH_URL="https://$APP_URL"
```

### ขั้นตอนที่ 8: รัน Database Migrations

```bash
# Connect ไปที่ database
az postgres flexible-server execute \
  --name gap-is-wa-db \
  --admin-user gapuser \
  --admin-password "YourSecurePassword123!" \
  --database-name postgres \
  --querytext "CREATE DATABASE gapdb;"

# หรือใช้ Prisma migrate (แนะนำ)
# ตั้งค่า DATABASE_URL local แล้วรัน:
npx prisma migrate deploy
```

---

## การใช้ Custom Domain

### ขั้นตอนที่ 1: เพิ่ม Domain

```bash
az containerapp hostname add \
  --hostname yourdomain.com \
  --resource-group gap-is-wa-rg \
  --name gap-is-wa-app
```

### ขั้นตอนที่ 2: Verify Domain

Script จะแสดง DNS records ที่ต้องเพิ่ม:

```
Type: CNAME
Name: yourdomain.com
Value: gap-is-wa-app.[unique-id].southeastasia.azurecontainerapps.io
```

เพิ่ม DNS record ที่ domain registrar (Namecheap, GoDaddy, Cloudflare, etc.)

### ขั้นตอนที่ 3: Bind Certificate (ฟรี!)

```bash
az containerapp hostname bind \
  --hostname yourdomain.com \
  --resource-group gap-is-wa-rg \
  --name gap-is-wa-app \
  --validation-method CNAME
```

**Azure จะสร้าง managed certificate ให้อัตโนมัติ และ auto-renew!** 🎉

---

## การ Monitor และ Debug

### ดู Application Logs

```bash
# Real-time logs
az containerapp logs show \
  --name gap-is-wa-app \
  --resource-group gap-is-wa-rg \
  --follow

# Logs ย้อนหลัง
az containerapp logs show \
  --name gap-is-wa-app \
  --resource-group gap-is-wa-rg \
  --tail 100
```

### ตรวจสอบสถานะ Container

```bash
az containerapp show \
  --name gap-is-wa-app \
  --resource-group gap-is-wa-rg \
  --query properties.runningStatus
```

### ดู Metrics

```bash
# CPU และ Memory usage
az monitor metrics list \
  --resource gap-is-wa-app \
  --resource-group gap-is-wa-rg \
  --resource-type Microsoft.App/containerApps \
  --metric "CpuUsage" "MemoryUsage"
```

### เข้า Azure Portal

https://portal.azure.com

- ดู real-time metrics
- ตั้งค่า alerts
- ดู cost analysis
- Configure scaling rules

---

## การจัดการค่าใช้จ่าย

### 1. ตั้ง Budget Alert

```bash
# ตั้งแจ้งเตือนเมื่อใช้เงินไป 50%, 75%, 90%
az consumption budget create \
  --amount 100 \
  --budget-name student-budget \
  --time-grain monthly \
  --time-period startDate=$(date +%Y-%m-01) \
  --notifications \
    contactEmails=your-email@example.com \
    threshold=50 \
    thresholdType=Actual
```

### 2. ดูค่าใช้จ่ายปัจจุบัน

```bash
# ดูค่าใช้จ่ายรายเดือน
az consumption usage list \
  --start-date $(date -d "1 month ago" +%Y-%m-%d) \
  --end-date $(date +%Y-%m-%d)
```

**หรือดูที่ Portal:**
https://portal.azure.com/#blade/Microsoft_Azure_CostManagement/Menu/overview

### 3. ประหยัด Credit

**Scale to Zero:**

```bash
# ตั้งให้ scale down เป็น 0 เมื่อไม่มีคนใช้ (ประหยัดสุด)
az containerapp update \
  --name gap-is-wa-app \
  --resource-group gap-is-wa-rg \
  --min-replicas 0
```

**หยุดชั่วคราว (ไม่ delete):**

```bash
# หยุด Container App
az containerapp update \
  --name gap-is-wa-app \
  --resource-group gap-is-wa-rg \
  --min-replicas 0 \
  --max-replicas 0

# เริ่มใหม่
az containerapp update \
  --name gap-is-wa-app \
  --resource-group gap-is-wa-rg \
  --min-replicas 0 \
  --max-replicas 3
```

**ลบทั้งหมด:**

```bash
# ลบ Resource Group (ลบทุกอย่างในนั้น)
az group delete --name gap-is-wa-rg --yes --no-wait
```

### 4. เลือก Tier ที่ประหยัด

| Service            | Tier           | ราคา/เดือน | แนะนำสำหรับ    |
| ------------------ | -------------- | ---------- | -------------- |
| Container Apps     | 0.5 vCPU, 1 GB | $5-15      | Development    |
| PostgreSQL         | Burstable B1ms | $10-15     | Small DB       |
| Container Registry | Basic          | $5         | Small projects |

**รวม:** ~$20-35/เดือน → ใช้ได้ 2.5-5 เดือน

### 5. Tips ประหยัดเพิ่มเติม

- 🔍 ลบ resources ที่ไม่ใช้ทันที
- 📊 ตรวจสอบค่าใช้จ่ายทุก 3-5 วัน
- ⏸️ หยุด resources เมื่อไม่ใช้งาน (เช่น สุดสัปดาห์)
- 🔄 ใช้ scale to zero สำหรับ dev environment
- 🗑️ ลบ old container images จาก registry

---

## การ Update Application

### วิธีที่ 1: Build และ Deploy ใหม่

```bash
# 1. Build image ใหม่
az acr build \
  --registry gapcontainerreg \
  --image gap-is-wa:latest \
  .

# 2. Container App จะ pull image ใหม่อัตโนมัติ
# หรือ restart manual:
az containerapp update \
  --name gap-is-wa-app \
  --resource-group gap-is-wa-rg \
  --image gapcontainerreg.azurecr.io/gap-is-wa:latest
```

### วิธีที่ 2: ใช้ Revision

```bash
# Deploy revision ใหม่
az containerapp revision copy \
  --name gap-is-wa-app \
  --resource-group gap-is-wa-rg \
  --revision-name v2

# Switch traffic
az containerapp revision set-mode \
  --name gap-is-wa-app \
  --resource-group gap-is-wa-rg \
  --mode multiple

az containerapp ingress traffic set \
  --name gap-is-wa-app \
  --resource-group gap-is-wa-rg \
  --revision-weight v2=100
```

---

## Troubleshooting

### ปัญหา: Container ไม่ start

```bash
# ดู logs
az containerapp logs show \
  --name gap-is-wa-app \
  --resource-group gap-is-wa-rg \
  --tail 50
```

### ปัญหา: Database connection failed

```bash
# ตรวจสอบ firewall rules
az postgres flexible-server firewall-rule list \
  --name gap-is-wa-db \
  --resource-group gap-is-wa-rg

# เพิ่ม firewall rule (ถ้าจำเป็น)
az postgres flexible-server firewall-rule create \
  --name gap-is-wa-db \
  --resource-group gap-is-wa-rg \
  --rule-name AllowAll \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 255.255.255.255
```

### ปัญหา: HTTPS ไม่ทำงาน

- ตรวจสอบว่า `--ingress external` ถูกตั้งค่า
- HTTPS จะทำงานอัตโนมัติสำหรับ Azure domain
- สำหรับ custom domain ต้องรอ DNS propagate (15 นาที - 24 ชม.)

---

## ทรัพยากรเพิ่มเติม

- 📚 [Azure Container Apps Documentation](https://learn.microsoft.com/azure/container-apps/)
- 💰 [Azure Pricing Calculator](https://azure.microsoft.com/pricing/calculator/)
- 🎓 [Azure for Students](https://azure.microsoft.com/free/students/)
- 🔐 [Azure Security Best Practices](https://learn.microsoft.com/azure/security/fundamentals/best-practices-and-patterns)
- 📊 [Monitor Azure Container Apps](https://learn.microsoft.com/azure/container-apps/monitor)

---

## 🆘 ติดปัญหา?

1. ดู logs: `az containerapp logs show`
2. ตรวจสอบ resource status ใน Azure Portal
3. ตรวจสอบ environment variables
4. ลอง restart: `az containerapp restart`
5. ถามใน Azure Community Forum หรือ GitHub Issues

---

**Happy deploying to Azure! 🚀☁️**
