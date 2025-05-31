# ระบบสารสนเทศสำหรับการจัดการข้อมูลทางการเกษตรผลผลิตยางพาราตามมาตรฐานจีเอพี

## 🚀 ภาพรวม
ระบบสารสนเทศสำหรับการจัดการข้อมูลทางการเกษตรผลผลิตยางพาราตามมาตรฐานจีเอพี (GAP - Good Agricultural Practices) เป็นแพลตฟอร์มที่พัฒนาขึ้นเพื่อช่วยเกษตรกรผู้ปลูกยางพาราและหน่วยงานรับรองมาตรฐาน ในการบริหารจัดการข้อมูลฟาร์ม ผลผลิตยางพารา และกระบวนการรับรองมาตรฐานจีเอพีอย่างเป็นระบบ

## ✨ คุณสมบัติ
- 👨‍🌾 การจัดการข้อมูลเกษตรกรและสวนยางพารา
- 🌱 การบันทึกและติดตามข้อมูลการเพาะปลูก การดูแล และการเก็บเกี่ยวผลผลิตยางพารา
- 📋 ระบบประเมินและรับรองมาตรฐานจีเอพีสำหรับผลผลิตยางพารา
- 📊 การวิเคราะห์และรายงานผลข้อมูลการผลิตและคุณภาพยางพารา
- 🔐 ระบบจัดการสิทธิ์และความปลอดภัยสำหรับผู้ใช้งานหลายระดับ

## 🛠️ เทคโนโลยีที่ใช้
- **Frontend**: Next.js, React
- **Backend**: Node.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js, JWT
- **Containerization**: Docker, Docker Compose
- **CI/CD**: GitHub Actions

## 📋 ความต้องการเบื้องต้น
- Node.js (v18+)
- Docker และ Docker Compose
- Git

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

### 4. เริ่มใช้งานด้วย Docker Compose
```bash
docker-compose up -d
```

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
- [มาตรฐาน GAP สำหรับยางพารา](https://www.acfs.go.th/)

## 📝 License
MIT License

---

พัฒนาโดย [วุฒิกานต์ ชัยสาร](https://github.com/Asteriskzkx)
