import { useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { Modal } from "../Modal";
import { FormInput } from "../FormInput";
import type { TransparencyForm } from "../../../types/admin";

interface TransparencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (form: TransparencyForm) => Promise<void>;
}

export function TransparencyModal({
  isOpen,
  onClose,
  onUpload,
}: TransparencyModalProps) {
  const [form, setForm] = useState<TransparencyForm>({
    title: "",
    file_type: "annual_report",
    file: null,
  });
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!form.file || !form.title) return;
    setLoading(true);
    try {
      await onUpload(form);
      setForm({ title: "", file_type: "annual_report", file: null });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm({ title: "", file_type: "annual_report", file: null });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Upload Transparency Document"
    >
      <div className="space-y-4">
        <FormInput
          label="Document Title"
          value={form.title}
          onChange={(v) => setForm({ ...form, title: v })}
          placeholder="Enter document title"
          required
        />
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Document Type <span className="text-[#B91C1C]">*</span>
          </label>
          <select
            value={form.file_type}
            onChange={(e) =>
              setForm({
                ...form,
                file_type: e.target.value as TransparencyForm["file_type"],
              })
            }
            className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border-0 focus:ring-2 focus:ring-[#B91C1C]/20 text-gray-900 dark:text-white"
          >
            <option value="annual_report">Annual Report</option>
            <option value="audit_report">Audit Report</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            PDF File <span className="text-[#B91C1C]">*</span>
          </label>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) =>
              setForm({ ...form, file: e.target.files?.[0] || null })
            }
            className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border-0 focus:ring-2 focus:ring-[#B91C1C]/20 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#B91C1C] file:text-white hover:file:bg-[#991B1B]"
          />
        </div>
        <button
          onClick={handleUpload}
          disabled={loading || !form.file || !form.title}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#B91C1C] text-white rounded-xl font-medium hover:bg-[#991B1B] transition-colors disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Upload className="w-5 h-5" />
          )}
          Upload Document
        </button>
      </div>
    </Modal>
  );
}
