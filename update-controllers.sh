#!/bin/bash

# สคริปต์สำหรับแก้ไข Controllers ทั้งหมดให้ใช้ NextAuth

echo "🔄 กำลังอัพเดท Controllers ให้ใช้ NextAuth..."

# รายการไฟล์ที่ต้องแก้ไข
FILES=(
  "src/controllers/CommitteeController.ts"
  "src/controllers/AdminController.ts"
  "src/controllers/UserController.ts"
  "src/controllers/InspectionController.ts"
  "src/controllers/AuditorInspectionController.ts"
)

echo "📝 Controllers ที่ต้องแก้ไขเพิ่มเติม:"
for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✓ $file"
  else
    echo "  ✗ $file (ไม่พบไฟล์)"
  fi
done

echo ""
echo "✅ Controllers ที่แก้ไขแล้ว:"
echo "  ✓ src/controllers/FarmerController.ts - getCurrentFarmer()"
echo "  ✓ src/controllers/RubberFarmController.ts - updateRubberFarmWithDetails()"
echo "  ✓ src/controllers/AuditorController.ts - getCurrentAuditor()"

echo ""
echo "📋 วิธีการแก้ไขไฟล์ที่เหลือ:"
echo ""
echo "1. เพิ่ม import:"
echo "   import { checkAuthorization } from '@/lib/session';"
echo ""
echo "2. แทนที่โค้ดเดิม:"
echo "   const authHeader = req.headers.get('Authorization');"
echo "   if (!authHeader || !authHeader.startsWith('Bearer ')) { ... }"
echo "   const token = authHeader.split(' ')[1];"
echo "   const decoded = service.verifyToken(token);"
echo ""
echo "3. ด้วยโค้ดใหม่:"
echo "   const { authorized, session, error } = await checkAuthorization(req, ['ROLE']);"
echo "   if (!authorized || !session) {"
echo "     return NextResponse.json({ message: error || 'Unauthorized' }, { status: 401 });"
echo "   }"
echo "   const roleData = session.user.roleData;"
echo ""
echo "📖 ดูตัวอย่างเพิ่มเติมได้ที่: NEXTAUTH_API_MIGRATION.md"
