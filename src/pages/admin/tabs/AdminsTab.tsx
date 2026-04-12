import { Plus } from "lucide-react";
import { AdminTable, Column } from "../../../components/admin/AdminTable";
import type { Admin } from "../../../types/admin";

interface AdminsTabProps {
  admins: Admin[];
  loadingData: boolean;
  onAdd: () => void;
  columns: Column<Admin>[];
  onRowClick: (item: Admin) => void;
}

export function AdminsTab({
  admins,
  loadingData,
  onAdd,
  columns,
  onRowClick,
}: AdminsTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-900 dark:text-white">
            Admin Management
          </h1>
          <p className="text-gray-500 mt-1">
            Manage admin accounts (Super Admin only)
          </p>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-6 py-3 bg-[#B91C1C] text-white rounded-xl font-medium hover:bg-[#991B1B] transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Admin
        </button>
      </div>

      <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden">
        <AdminTable
          data={admins}
          columns={columns}
          loading={loadingData}
          emptyMessage="No admins found"
          onRowClick={onRowClick}
        />
      </div>
    </div>
  );
}
