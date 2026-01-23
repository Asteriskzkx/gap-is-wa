# Admin Audit Logs - Sequence Diagram (High-Level)

```mermaid
sequenceDiagram
    actor Admin as aAdmin:Admin
    participant Page as AuditLogsPage<br/>(src/app/admin/audit-logs/page.tsx)
    participant Hook as useAdminAuditLogs<br/>(src/hooks/useAdminAuditLogs.ts)
    participant LogsAPI as AuditLogs API<br/>(/api/v1/audit-logs/*)
    participant Ctrl as AuditLogController
    participant Svc as AuditLogService
    participant Repo as AuditLogRepository
    participant UserRepo as UserRepository
    participant DB as Database<br/>(Prisma)

    Note over Admin,DB: Step 1: Load Audit Logs List (initial + pagination)
    Admin->>Page: Open "Audit Logs"
    Page->>Hook: useEffect() -> fetchItems()
    Hook->>Hook: check session (useSession)
    Hook->>LogsAPI: GET /api/v1/audit-logs/paginated?limit&offset&filters&sort
    LogsAPI->>Ctrl: getLogsWithPagination(req) (ADMIN only)
    Ctrl->>Svc: getLogsWithPagination(options)
    Svc->>Repo: findAllWithPagination(options)
    Repo-->>DB: prisma.auditLog.findMany + prisma.auditLog.count
    DB-->>Repo: logs + total
    Repo-->>Svc: AuditLogModels + total
    Svc->>UserRepo: findNameMapByIds(userIds)
    UserRepo-->>DB: prisma.user.findMany(select userId,name)
    DB-->>UserRepo: name map
    Svc->>Svc: attach operatorName to each log
    Svc-->>Ctrl: {data,total}
    Ctrl-->>LogsAPI: 200 {results,paginator}
    LogsAPI-->>Hook: JSON response
    Hook-->>Page: items + totalRecords
    Page-->>Admin: Render table + paginator

    Note over Admin,DB: Step 2: Apply Filters / Sorting (server-side)
    Admin->>Page: Set tableName/recordId/userId/action/date range
    Page->>Hook: applyFilters()
    Hook->>Hook: setApplied* + reset offset
    Hook->>LogsAPI: GET /api/v1/audit-logs/paginated?... (updated params)
    LogsAPI->>Ctrl: getLogsWithPagination(req)
    Ctrl->>Svc: getLogsWithPagination(options)
    Svc->>Repo: findAllWithPagination(options)
    Repo-->>DB: query with WHERE + ORDER BY
    DB-->>Repo: results + count
    Repo-->>Svc: data + total
    Svc->>UserRepo: findNameMapByIds(userIds)
    UserRepo-->>DB: query names
    Ctrl-->>LogsAPI: 200
    LogsAPI-->>Hook: results + paginator
    Hook-->>Page: update state
    Page-->>Admin: Update table

    Note over Admin,DB: Step 3: View Log Detail (client-side dialog)
    Admin->>Page: Click row action "รายละเอียด"
    Page->>Page: open detail dialog
    Page-->>Admin: Show oldData/newData (JSON) from selected item

    Note over Admin,DB: Step 4: Data Retention - Count & Delete Old Logs
    Admin->>Page: Open "ลบข้อมูลเก่า" dialog
    Page->>Hook: countOldLogs(days)
    Hook->>LogsAPI: GET /api/v1/audit-logs/old/count?days=N
    LogsAPI->>Ctrl: countOldLogs(req) (ADMIN only)
    Ctrl->>Svc: countOldLogs(days)
    Svc->>Repo: countOlderThan(cutoffDate)
    Repo-->>DB: prisma.auditLog.count(where createdAt < cutoff)
    LogsAPI-->>Hook: 200 {count}
    Hook-->>Page: estimatedCount
    Admin->>Page: Confirm delete
    Page->>Hook: deleteOldLogs(days)
    Hook->>LogsAPI: DELETE /api/v1/audit-logs/old?days=N
    LogsAPI->>Ctrl: deleteOldLogs(req) (ADMIN only)
    Ctrl->>Svc: deleteOldLogs(days)
    Svc->>Repo: deleteOlderThan(cutoffDate)
    Repo-->>DB: prisma.auditLog.deleteMany(where createdAt < cutoff)
    LogsAPI-->>Hook: 200 {deletedCount}
    Hook->>Hook: refresh list (fetchItems)
    Hook-->>Page: updated items
    Page-->>Admin: Toast success + refreshed table
```

## High-Level Overview

### Main Flow

1. **Load Audit Logs** - โหลดรายการ audit logs แบบ server-side pagination
2. **Filter/Sort** - กรองตาม tableName/recordId/userId/action/ช่วงวันที่ และเรียงลำดับผ่าน API
3. **View Detail** - เปิด dialog เพื่อดู `oldData`/`newData` ของรายการที่เลือก
4. **Retention Cleanup** - นับจำนวน log เก่าเกินกำหนด และสั่งลบแบบ bulk

### Key Components

- `src/app/admin/audit-logs/page.tsx` - UI หน้า audit logs + dialogs
- `src/hooks/useAdminAuditLogs.ts` - state, pagination/sort/filter, เรียก API
- `src/app/api/v1/audit-logs/paginated/route.ts` - `GET` แบบ pagination + filter
- `src/app/api/v1/audit-logs/old/count/route.ts` - `GET` นับจำนวน log เก่า
- `src/app/api/v1/audit-logs/old/route.ts` - `DELETE` ลบ log เก่าเกินกำหนด
- `src/controllers/AuditLogController.ts` → `src/services/AuditLogService.ts` → `src/repositories/AuditLogRepository.ts`
- `src/repositories/UserRepository.ts` - map `userId -> name` เพื่อเติม `operatorName`

### Endpoints Used By This Page

- `GET /api/v1/audit-logs/paginated?limit&offset&tableName&recordId&userId&action&startDate&endDate&sortField&sortOrder&multiSortMeta`
- `GET /api/v1/audit-logs/old/count?days=N`
- `DELETE /api/v1/audit-logs/old?days=N`
