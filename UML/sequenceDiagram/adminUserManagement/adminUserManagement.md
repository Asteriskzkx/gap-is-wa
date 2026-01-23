# Admin User Management - Sequence Diagram (High-Level)

```mermaid
sequenceDiagram
    actor Admin as aAdmin:Admin
    participant Page as UserManagementPage<br/>(src/app/admin/user-management/page.tsx)
    participant AddDialog as AddUserDialog<br/>(src/components/admin/AddUserDialog.tsx)
    participant UsersAPI as Users API<br/>(/api/v1/users)
    participant UserCtrl as UserController
    participant UserSvc as UserService
    participant UserRepo as UserRepository
    participant AuditSvc as AuditLogService
    participant AuditRepo as AuditLogRepository
    participant DB as Database<br/>(Prisma)

    Note over Admin,DB: Step 1: Load Users List (initial + pagination)
    Admin->>Page: Open "User Management"
    Page->>Page: useEffect() -> fetchUsers(skip,take,filters,sort)
    Page->>UsersAPI: GET /api/v1/users?skip&take&search&role&sortField&sortOrder
    UsersAPI->>UserCtrl: getAllUsersWithPagination(req) (ADMIN only)
    UserCtrl->>UserSvc: getUsersWithFilterAndPagination(params)
    UserSvc->>UserRepo: findWithFilterAndPagination(params)
    UserRepo-->>DB: prisma.user.findMany + prisma.user.count
    DB-->>UserRepo: users + total
    UserRepo-->>UserSvc: UserModels + total
    UserSvc-->>UserCtrl: users(toJSON) + total
    UserCtrl-->>UsersAPI: 200 {users,total,skip,take}
    UsersAPI-->>Page: JSON response
    Page-->>Admin: Render table + paginator

    Note over Admin,DB: Step 2: Filter / Sort / Search (server-side)
    Admin->>Page: Type search (debounced) / choose role / sort column
    Page->>Page: rebuild queryString
    Page->>UsersAPI: GET /api/v1/users?... (updated params)
    UsersAPI->>UserCtrl: getAllUsersWithPagination(req)
    UserCtrl->>UserSvc: getUsersWithFilterAndPagination(params)
    UserSvc->>UserRepo: findWithFilterAndPagination(params)
    UserRepo-->>DB: query with WHERE + ORDER BY
    DB-->>UserRepo: results + count
    UserRepo-->>UserSvc: users + total
    UserSvc-->>UserCtrl: users(toJSON) + total
    UserCtrl-->>UsersAPI: 200
    UsersAPI-->>Page: JSON response
    Page-->>Admin: Update table

    Note over Admin,DB: Step 3: Create User (via dialog)
    Admin->>Page: Click "เพิ่มผู้ใช้"
    Page->>AddDialog: Open dialog
    Admin->>AddDialog: Fill form + click "บันทึก"
    AddDialog->>UsersAPI: POST /api/v1/users (role-specific payload)
    UsersAPI->>UserCtrl: createUser(req) (ADMIN only)
    UserCtrl->>UserCtrl: checkAuthorization() + attach createdBy
    UserCtrl->>UserSvc: UserRegistrationFactoryService.createUserWithRole(payload)
    UserSvc-->>DB: Create user + role table record(s)
    DB-->>UserCtrl: created user
    UserCtrl-->>UsersAPI: 201 created user (sanitized)
    UsersAPI-->>AddDialog: success
    AddDialog-->>Page: onCreated() -> fetchUsers(...)
    Page-->>Admin: Table refreshed

    Note over Admin,DB: Step 4: Delete User (with audit log)
    Admin->>Page: Click delete (pi-trash) on a row
    Page->>Page: Open confirm dialog
    Admin->>Page: Confirm delete
    Page->>UsersAPI: DELETE /api/v1/users/{userId}
    UsersAPI->>UserCtrl: delete(req, {id}) (ADMIN only)
    UserCtrl->>UserSvc: delete(userId, actorId)
    UserSvc->>UserRepo: findById(userId) (oldData)
    UserRepo-->>DB: prisma.user.findUnique
    UserSvc->>UserRepo: delete(userId)
    UserRepo-->>DB: prisma.user.delete
    UserSvc->>AuditSvc: logAction("User","DELETE",userId,actorId,oldData)
    AuditSvc->>AuditRepo: create(auditLog)
    AuditRepo-->>DB: prisma.auditLog.create
    UserCtrl-->>UsersAPI: 200 {message}
    UsersAPI-->>Page: success
    Page->>Page: fetchUsers(...) to refresh
    Page-->>Admin: Toast success + table refreshed

    Note over Admin,DB: Step 5: Reset Password To Default
    Admin->>Page: Click reset password (pi-key)
    Page->>UsersAPI: GET /api/v1/users/default-password (ADMIN only)
    UsersAPI-->>Page: 200 {defaultPassword} (from ENV)
    Page->>Page: Show reset dialog + copy helpers
    Admin->>Page: Confirm reset
    Page->>UsersAPI: POST /api/v1/users/reset-password {userId}
    UsersAPI->>UserCtrl: resetPasswordToDefault(req) (ADMIN only)
    UserCtrl->>UserSvc: resetPasswordToDefault(userId)
    UserSvc->>UserRepo: update(userId,{hashedPassword,requirePasswordChange:true})
    UserRepo-->>DB: prisma.user.update
    UserCtrl-->>UsersAPI: 200 updated user
    UsersAPI-->>Page: success
    Page->>Page: fetchUsers(...) to refresh
    Page-->>Admin: Toast success + table refreshed

    Note over Admin,DB: Step 6: Edit User (navigation only)
    Admin->>Page: Click edit (pi-pencil)
    Page->>Page: router.push(/admin/user-management/edit/{userId})
    Page-->>Admin: Navigate to edit page
```

## High-Level Overview

### Main Flow

1. **Load Users List** - โหลดรายการผู้ใช้แบบ server-side pagination
2. **Filter/Sort/Search** - ค้นหา/กรองบทบาท/เรียงลำดับ และโหลดข้อมูลใหม่จาก API
3. **Create User** - เพิ่มผู้ใช้ผ่าน `AddUserDialog` แล้ว refresh ตาราง
4. **Delete User** - ลบผู้ใช้ (พร้อมบันทึก `AuditLog` ประเภท `DELETE`)
5. **Reset Password** - รีเซ็ตรหัสผ่านเป็นค่าเริ่มต้น (DEFAULT_PASSWORD) และบังคับเปลี่ยนรหัสผ่านครั้งถัดไป
6. **Edit User** - ไปหน้าแก้ไขผู้ใช้ (routing)

### Key Components

- `src/app/admin/user-management/page.tsx` - หน้า list + filter + actions (add/edit/delete/reset)
- `src/components/admin/AddUserDialog.tsx` - ฟอร์มเพิ่มผู้ใช้และยิง `POST /api/v1/users`
- `src/app/api/v1/users/*` - Route handlers ตรวจสิทธิ์ `ADMIN` แล้วเรียก controller/service
- `src/controllers/UserController.ts` → `src/services/UserService.ts` → `src/repositories/UserRepository.ts`
- `src/services/AuditLogService.ts` → `src/repositories/AuditLogRepository.ts` (ตอนลบผู้ใช้)

### Endpoints Used By This Page

- `GET /api/v1/users?skip&take&search&role&sortField&sortOrder` - ดึงรายการผู้ใช้แบบ pagination
- `POST /api/v1/users` - สร้างผู้ใช้ใหม่
- `DELETE /api/v1/users/{id}` - ลบผู้ใช้
- `GET /api/v1/users/default-password` - ดึง DEFAULT_PASSWORD (admin-only)
- `POST /api/v1/users/reset-password` - รีเซ็ตรหัสผ่านเป็นค่าเริ่มต้น
