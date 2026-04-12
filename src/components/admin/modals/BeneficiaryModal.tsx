import { useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { Modal } from "../Modal";
import { FormInput } from "../FormInput";
import type { BeneficiaryForm } from "../../../types/admin";

interface BeneficiaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (form: BeneficiaryForm) => Promise<void>;
  initialData?: BeneficiaryForm;
}

export function BeneficiaryModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: BeneficiaryModalProps) {
  const [form, setForm] = useState<BeneficiaryForm>(
    initialData || { total_beneficiaries: 0, countries_count: 0 },
  );
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave(form);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Update Beneficiary Stats">
      <div className="space-y-4">
        <FormInput
          label="Total Beneficiaries"
          type="number"
          value={form.total_beneficiaries}
          onChange={(v) =>
            setForm({ ...form, total_beneficiaries: Number(v) })
          }
          placeholder="Enter total beneficiaries"
          required
        />
        <FormInput
          label="Countries Count"
          type="number"
          value={form.countries_count}
          onChange={(v) =>
            setForm({ ...form, countries_count: Number(v) })
          }
          placeholder="Enter countries count"
          required
        />
        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#B91C1C] text-white rounded-xl font-medium hover:bg-[#991B1B] transition-colors disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          Save Changes
        </button>
      </div>
    </Modal>
  );
}
