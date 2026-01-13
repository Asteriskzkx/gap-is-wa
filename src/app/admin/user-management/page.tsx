"use client";

import { AddUserDialog } from "@/components/admin/AddUserDialog";
import AdminLayout from "@/components/layout/AdminLayout";
import {
  PrimaryButton,
  PrimaryDataTable,
  PrimaryDropdown,
  PrimaryInputText,
} from "@/components/ui";
import { useRouter } from "next/navigation";
import { DataTablePageEvent, DataTableSortEvent } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { Tag } from "primereact/tag";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import toast from "react-hot-toast";

type User = {
  userId: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

enum UserRole {
  FARMER = "FARMER",
  AUDITOR = "AUDITOR",
  COMMITTEE = "COMMITTEE",
  ADMIN = "ADMIN",
}

const userRoleLabelMap: Record<UserRole, string> = {
  [UserRole.FARMER]: "เกษตรกร (FARMER)",
  [UserRole.AUDITOR]: "ผู้ตรวจประเมิน (AUDITOR)",
  [UserRole.COMMITTEE]: "คณะกรรมการ (COMMITTEE)",
  [UserRole.ADMIN]: "ผู้ดูแลระบบ (ADMIN)",
};

const getRoleLabel = (role: string) => {
  const key = role as UserRole;
  return userRoleLabelMap[key] ?? role;
};

function UserActionsCell({
  userId,
  onEdit,
  onDelete,
  onResetPassword,
}: Readonly<{
  userId: number;
  onEdit: (userId: number) => void;
  onDelete: (userId: number) => void;
  onResetPassword: (userId: number) => void;
}>) {
  return (
    <div className="flex justify-center gap-1">
      <PrimaryButton
        icon="pi pi-key"
        color="secondary"
        rounded
        text
        tooltip="รีเซ็ตรหัสผ่าน (DEFAULT_PASSWORD)"
        onClick={() => onResetPassword(userId)}
      />
      <PrimaryButton
        icon="pi pi-pencil"
        color="info"
        rounded
        text
        tooltip="แก้ไข"
        onClick={() => onEdit(userId)}
      />
      <PrimaryButton
        icon="pi pi-trash"
        color="danger"
        rounded
        text
        tooltip="ลบ"
        onClick={() => onDelete(userId)}
      />
    </div>
  );
}

const getRoleSeverity = (role: string) => {
  switch (role) {
    case UserRole.ADMIN:
      return "danger";
    case UserRole.COMMITTEE:
      return "warning";
    case UserRole.AUDITOR:
      return "info";
    case UserRole.FARMER:
      return "success";
    default:
      return null;
  }
};

function RoleTag({ role }: Readonly<{ role: string }>) {
  return (
    <Tag severity={getRoleSeverity(role)} value={getRoleLabel(role)}></Tag>
  );
}

const formatCreatedAt = (createdAt: string) => {
  if (!createdAt) return "";
  const date = new Date(createdAt);
  return date.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

type UserTableColumn = {
  readonly field: string;
  readonly header: string;
  readonly body?: (rowData: any) => React.ReactNode;
  readonly sortable?: boolean;
  readonly style?: React.CSSProperties;
  readonly headerAlign?: "left" | "center" | "right";
  readonly bodyAlign?: "left" | "center" | "right";
  readonly mobileAlign?: "left" | "right";
  readonly mobileHideLabel?: boolean;
};

const buildUserColumns = (args: {
  onEdit: (userId: number) => void;
  onDelete: (userId: number) => void;
  onResetPassword: (userId: number) => void;
}): UserTableColumn[] => {
  const { onEdit, onDelete, onResetPassword } = args;

  return [
    {
      field: "userId",
      header: "รหัส",
      sortable: true,
      headerAlign: "center",
      bodyAlign: "center",
      style: { width: "9%" },
    },
    {
      field: "name",
      header: "ชื่อ",
      sortable: true,
      headerAlign: "left",
      bodyAlign: "left",
      style: { width: "18%" },
    },
    {
      field: "email",
      header: "อีเมล",
      sortable: true,
      headerAlign: "left",
      bodyAlign: "left",
      style: { width: "27%" },
    },
    {
      field: "role",
      header: "บทบาท",
      sortable: true,
      headerAlign: "center",
      bodyAlign: "center",
      body: (r: User) => <RoleTag role={r.role} />,
      style: { width: "20%" },
    },
    {
      field: "createdAt",
      header: "วันที่สร้าง",
      sortable: true,
      headerAlign: "center",
      bodyAlign: "center",
      body: (r: User) => formatCreatedAt(r.createdAt),
      style: { width: "12%" },
    },
    {
      field: "actions",
      header: "",
      headerAlign: "center",
      bodyAlign: "center",
      mobileAlign: "right",
      mobileHideLabel: true,
      style: { width: "13%" },
      body: (rowData: User) => (
        <UserActionsCell
          userId={rowData.userId}
          onEdit={onEdit}
          onDelete={onDelete}
          onResetPassword={onResetPassword}
        />
      ),
    },
  ];
};

const rowsPerPageOptions = [10, 25, 50, 100];
const DEBOUNCE_DELAY = 500; // milliseconds

export default function AdminUserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [visibleAddUserDialog, setVisibleAddUserDialog] = useState(false);
  const [resetVisible, setResetVisible] = useState(false);
  const [resetUserId, setResetUserId] = useState<number | null>(null);
  const [defaultPassword, setDefaultPassword] = useState<string>("");
  const [defaultPasswordLoading, setDefaultPasswordLoading] =
    useState<boolean>(false);
  const [showDefaultPassword, setShowDefaultPassword] =
    useState<boolean>(false);

  // Server-side pagination state
  const [totalRecords, setTotalRecords] = useState(0);
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);

  // Sort state
  const [sortField, setSortField] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<1 | -1>(-1);

  // Filter state - realtime with debounce
  const [searchInput, setSearchInput] = useState<string>("");
  const [roleInput, setRoleInput] = useState<string | null>(null);

  // Debounced search value
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const router = useRouter();

  const showSuccessDelete = () => {
    toast.success("ลบผู้ใช้สำเร็จ");
  };

  const showSuccessResetPassword = () => {
    toast.success("รีเซ็ตรหัสผ่านสำเร็จ (ตั้งเป็น DEFAULT_PASSWORD)");
  };

  const showErrorResetPassword = (message?: string) => {
    toast.error(message || "รีเซ็ตรหัสผ่านไม่สำเร็จ");
  };

  const showSuccessCreated = () => {
    toast.success("สร้างผู้ใช้สำเร็จ");
  };

  const showErrorCreated = () => {
    toast.error("สร้างผู้ใช้ไม่สำเร็จ");
  };

  const showErrorDelete = () => {
    toast.error("ลบผู้ใช้ไม่สำเร็จ");
  };

  const fetchDefaultPassword = useCallback(async () => {
    setDefaultPasswordLoading(true);
    try {
      const res = await fetch("/api/v1/users/default-password", {
        method: "GET",
        cache: "no-store",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || "Failed to load DEFAULT_PASSWORD");
      }
      setDefaultPassword(
        typeof data?.defaultPassword === "string" ? data.defaultPassword : ""
      );
    } catch (e) {
      console.error("Failed to fetch DEFAULT_PASSWORD:", e);
      setDefaultPassword("");
    } finally {
      setDefaultPasswordLoading(false);
    }
  }, []);

  const copyToClipboard = async (text: string) => {
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard API not available");
      }
      await navigator.clipboard.writeText(text);
      toast.success("คัดลอกแล้ว");
    } catch (e) {
      console.error("Copy failed:", e);
      toast.error("คัดลอกไม่สำเร็จ");
    }
  };

  // Debounce search input
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, DEBOUNCE_DELAY);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchInput]);

  // Current filters (memoized)
  const currentFilters = useMemo(
    () => ({
      search: debouncedSearch,
      role: roleInput,
    }),
    [debouncedSearch, roleInput]
  );

  // Build query string from filters, pagination and sorting
  const buildQueryString = useCallback(
    (
      skip: number,
      take: number,
      filters: { search: string; role: string | null },
      sort: { field: string; order: 1 | -1 }
    ) => {
      const params = new URLSearchParams();
      params.set("skip", skip.toString());
      params.set("take", take.toString());

      if (filters.search) params.set("search", filters.search);
      if (filters.role) params.set("role", filters.role);
      if (sort.field) params.set("sortField", sort.field);
      params.set("sortOrder", sort.order.toString());

      return params.toString();
    },
    []
  );

  // Fetch users with server-side filtering, pagination and sorting
  const fetchUsers = useCallback(
    async (
      skip: number,
      take: number,
      filters: { search: string; role: string | null },
      sort: { field: string; order: 1 | -1 }
    ) => {
      setLoading(true);
      try {
        const queryString = buildQueryString(skip, take, filters, sort);
        const res = await fetch(`/api/v1/users?${queryString}`, {
          cache: "no-store",
        });
        const data = await res.json();
        setUsers(Array.isArray(data.users) ? data.users : []);
        setTotalRecords(data.total || 0);
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    },
    [buildQueryString]
  );

  // Current sort (memoized)
  const currentSort = useMemo(
    () => ({
      field: sortField,
      order: sortOrder,
    }),
    [sortField, sortOrder]
  );

  // Fetch when filters, sort, or rows change (also handles initial load)
  useEffect(() => {
    fetchUsers(0, rows, currentFilters, currentSort);
    setFirst(0); // Reset to first page when filters change
  }, [currentFilters, rows, fetchUsers, currentSort]);

  // Handle pagination change
  const handlePageChange = (event: DataTablePageEvent) => {
    setFirst(event.first);
    setRows(event.rows);
    fetchUsers(event.first, event.rows, currentFilters, currentSort);
  };

  // Handle sort change
  const handleSort = (event: DataTableSortEvent) => {
    const newSortField = event.sortField
      ? String(event.sortField)
      : "createdAt";
    const newSortOrder = event.sortOrder === 1 ? 1 : -1;
    setSortField(newSortField);
    setSortOrder(newSortOrder);
    fetchUsers(first, rows, currentFilters, {
      field: newSortField,
      order: newSortOrder,
    });
  };

  // Clear filters
  const handleClearFilters = () => {
    setSearchInput("");
    setRoleInput(null);
    setDebouncedSearch("");
  };

  // Handle role change - immediate filter
  const handleRoleChange = (value: string | null) => {
    setRoleInput(value);
  };

  const roleOptions = useMemo(
    () =>
      Object.values(UserRole).map((role) => ({
        label: getRoleLabel(role),
        value: role,
      })),
    []
  );

  const handleEditUser = useCallback(
    (userId: number) => {
      router.push(`/admin/user-management/edit/${userId}`);
    },
    [router]
  );

  const handleRequestDeleteUser = useCallback((userId: number) => {
    setSelectedId(userId);
    setDeleteVisible(true);
  }, []);

  const handleRequestResetPassword = useCallback((userId: number) => {
    setResetUserId(userId);
    setResetVisible(true);
    setShowDefaultPassword(false);
    fetchDefaultPassword();
  }, []);

  const columns = useMemo(
    () =>
      buildUserColumns({
        onEdit: handleEditUser,
        onDelete: handleRequestDeleteUser,
        onResetPassword: handleRequestResetPassword,
      }),
    [handleEditUser, handleRequestDeleteUser, handleRequestResetPassword]
  );

  // Check if currently debouncing (search input differs from debounced value)
  const isDebouncing = searchInput !== debouncedSearch;

  const headerSection = (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
        <div className="w-full">
          <label
            htmlFor="userSearch"
            className="block text-sm text-gray-600 mb-1"
          >
            ค้นหา
          </label>
          <PrimaryInputText
            id="userSearch"
            name="userSearch"
            value={searchInput}
            onChange={(v) => setSearchInput(v)}
            placeholder="ค้นหาชื่อหรืออีเมล..."
          />
        </div>

        <div className="w-full">
          <label
            htmlFor="userRole"
            className="block text-sm text-gray-600 mb-1"
          >
            บทบาท
          </label>
          <PrimaryDropdown
            id="userRole"
            name="userRole"
            value={roleInput}
            options={roleOptions}
            onChange={handleRoleChange}
            placeholder="เลือกบทบาท"
            showClear
          />
        </div>
      </div>

      <div className="mt-1 grid grid-cols-1 gap-3 md:grid-cols-4 md:items-center">
        <PrimaryButton
          label="ล้างตัวกรอง"
          icon="pi pi-filter-slash"
          color="secondary"
          variant="outlined"
          onClick={handleClearFilters}
          disabled={loading}
          className="w-full md:w-auto md:justify-self-start"
        />

        <PrimaryButton
          label="รีเฟรช"
          icon="pi pi-refresh"
          color="secondary"
          variant="outlined"
          onClick={() => fetchUsers(first, rows, currentFilters, currentSort)}
          disabled={loading}
          className="w-full md:w-auto md:col-start-3 md:justify-self-end"
        />

        <PrimaryButton
          label="เพิ่มผู้ใช้"
          icon="pi pi-plus"
          color="success"
          onClick={() => setVisibleAddUserDialog(true)}
          className="w-full md:w-auto md:col-start-4 md:justify-self-end"
        />
      </div>

      {isDebouncing && (
        <div className="text-sm text-blue-600">
          <i className="pi pi-spin pi-spinner mr-1"></i>
          <span>กำลังรอค้นหา...</span>
        </div>
      )}

      <div className="text-sm text-gray-500">
        แสดง {users.length} จาก {totalRecords.toLocaleString()} รายการ
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            จัดการผู้ใช้ในระบบ
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            จัดการข้อมูลผู้ใช้ในระบบ เช่น การเพิ่ม ลบ หรือแก้ไขข้อมูลผู้ใช้
          </p>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-lg shadow p-6">
          {headerSection}

          <div className="mt-4">
            <PrimaryDataTable
              value={users}
              columns={columns}
              loading={loading}
              lazy
              paginator
              first={first}
              rows={rows}
              totalRecords={totalRecords}
              onPage={handlePageChange}
              sortMode="single"
              sortField={sortField}
              sortOrder={sortOrder}
              onSort={handleSort}
              rowsPerPageOptions={rowsPerPageOptions}
              dataKey="userId"
              emptyMessage="ไม่พบผู้ใช้ในระบบ."
            />
          </div>
          <Dialog
            header="ยืนยันการลบ"
            visible={deleteVisible}
            blockScroll={true}
            draggable={false}
            style={{ width: "25rem" }}
            onHide={() => setDeleteVisible(false)}
          >
            <p className="m-0">
              ต้องการลบผู้ใช้ชื่อ :{" "}
              <span className="text-red font-bold">
                {users.find((u) => u.userId === selectedId)?.name ?? "-"}
              </span>{" "}
              ใช่ไหม?
            </p>

            <div className="flex justify-end gap-3 mt-4">
              <PrimaryButton
                label="ยกเลิก"
                icon="pi pi-times"
                color="secondary"
                variant="outlined"
                className="flex-1"
                onClick={() => setDeleteVisible(false)}
              />

              <PrimaryButton
                label="ลบ"
                icon="pi pi-trash"
                color="danger"
                className="flex-1"
                onClick={async () => {
                  try {
                    const response = await fetch(
                      `/api/v1/users/${selectedId}`,
                      {
                        method: "DELETE",
                      }
                    );
                    if (!response.ok) {
                      throw new Error("Delete failed");
                    }
                    setDeleteVisible(false);
                    await fetchUsers(first, rows, currentFilters, currentSort);
                    showSuccessDelete();
                  } catch (error) {
                    console.error("Delete failed:", error);
                    showErrorDelete();
                  }
                }}
              />
            </div>
          </Dialog>

          <Dialog
            header="ยืนยันการรีเซ็ตรหัสผ่าน"
            visible={resetVisible}
            blockScroll={true}
            draggable={false}
            style={{ width: "clamp(22rem, 92vw, 56rem)" }}
            onHide={() => setResetVisible(false)}
          >
            {(() => {
              const selectedUser = users.find((u) => u.userId === resetUserId);
              const selectedEmail = selectedUser?.email ?? "";
              const selectedName = selectedUser?.name ?? "";

              const resolvedPassword = defaultPasswordLoading
                ? "(กำลังโหลด...)"
                : defaultPassword || "(ไม่พบค่า)";

              let defaultPasswordDisplay = "••••••••";
              if (defaultPasswordLoading || showDefaultPassword) {
                defaultPasswordDisplay = resolvedPassword;
              }

              const passwordForMessage =
                defaultPasswordLoading || !defaultPassword
                  ? "DEFAULT_PASSWORD"
                  : defaultPassword;

              const messageTemplate =
                `บัญชีของคุณถูกรีเซ็ตรหัสผ่านแล้ว\n` +
                `อีเมล: ${selectedEmail}\n` +
                `รหัสผ่านเริ่มต้น: ${passwordForMessage}\n` +
                `กรุณาเข้าสู่ระบบและเปลี่ยนรหัสผ่านทันที`;

              return (
                <>
                  <p className="m-0">
                    ต้องการรีเซ็ตรหัสผ่านผู้ใช้ชื่อ :{" "}
                    <span className="font-bold">
                      {users.find((u) => u.userId === resetUserId)?.name ?? "-"}
                    </span>{" "}
                    ใช่ไหม?
                  </p>
                  <p className="mt-2 text-sm text-gray-600">
                    ระบบจะตั้งรหัสผ่านใหม่เป็นค่า DEFAULT_PASSWORD
                    และบังคับให้ผู้ใช้เปลี่ยนรหัสผ่านหลังเข้าสู่ระบบ
                  </p>

                  <div className="mt-3 rounded-md border border-gray-200 bg-gray-50 p-3">
                    <div className="text-sm text-gray-700">
                      <div>
                        <span className="font-medium">ชื่อ:</span>{" "}
                        {selectedName || "-"}
                      </div>
                      <div className="mt-1">
                        <span className="font-medium">อีเมล:</span>{" "}
                        {selectedEmail || "-"}
                      </div>
                      <div className="mt-1">
                        <span className="font-medium">DEFAULT_PASSWORD:</span>{" "}
                        <span className="font-mono">
                          {defaultPasswordDisplay}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 flex gap-2">
                      <PrimaryButton
                        label="คัดลอกอีเมล"
                        icon="pi pi-copy"
                        color="secondary"
                        variant="outlined"
                        disabled={loading || !selectedEmail}
                        onClick={() => copyToClipboard(selectedEmail)}
                      />
                      <PrimaryButton
                        label="คัดลอกข้อความ"
                        icon="pi pi-copy"
                        color="secondary"
                        variant="outlined"
                        disabled={loading || !selectedEmail}
                        onClick={() => copyToClipboard(messageTemplate)}
                      />
                      <PrimaryButton
                        label={showDefaultPassword ? "ซ่อน" : "แสดง"}
                        icon={
                          showDefaultPassword ? "pi pi-eye-slash" : "pi pi-eye"
                        }
                        color="secondary"
                        variant="outlined"
                        disabled={
                          loading || defaultPasswordLoading || !defaultPassword
                        }
                        onClick={() => setShowDefaultPassword((v) => !v)}
                      />
                      <PrimaryButton
                        label="คัดลอก DEFAULT_PASSWORD"
                        icon="pi pi-copy"
                        color="secondary"
                        variant="outlined"
                        disabled={
                          loading || defaultPasswordLoading || !defaultPassword
                        }
                        onClick={() => copyToClipboard(defaultPassword)}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-4">
                    <PrimaryButton
                      label="ยกเลิก"
                      icon="pi pi-times"
                      color="secondary"
                      variant="outlined"
                      className="flex-1"
                      onClick={() => setResetVisible(false)}
                      disabled={loading}
                    />

                    <PrimaryButton
                      label="รีเซ็ต"
                      icon="pi pi-key"
                      color="secondary"
                      className="flex-1"
                      onClick={async () => {
                        if (!resetUserId) return;
                        try {
                          const response = await fetch(
                            "/api/v1/users/reset-password",
                            {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ userId: resetUserId }),
                            }
                          );

                          const data = await response
                            .json()
                            .catch(() => ({ message: "Reset failed" }));

                          if (!response.ok) {
                            throw new Error(data?.message || "Reset failed");
                          }

                          setResetVisible(false);
                          await fetchUsers(
                            first,
                            rows,
                            currentFilters,
                            currentSort
                          );
                          showSuccessResetPassword();
                        } catch (error) {
                          console.error("Reset password failed:", error);
                          showErrorResetPassword(
                            error instanceof Error ? error.message : undefined
                          );
                        }
                      }}
                      disabled={loading}
                    />
                  </div>
                </>
              );
            })()}
          </Dialog>

          <AddUserDialog
            visible={visibleAddUserDialog}
            onHide={() => setVisibleAddUserDialog(false)}
            onCreated={async () => {
              await fetchUsers(first, rows, currentFilters, currentSort);
            }}
            showSuccess={showSuccessCreated}
            showError={showErrorCreated}
          />
        </div>
      </div>
    </AdminLayout>
  );
}
