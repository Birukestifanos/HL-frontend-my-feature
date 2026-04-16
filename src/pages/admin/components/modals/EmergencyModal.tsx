import { useState, useEffect } from "react";
import { Save, Loader2 } from "lucide-react";
import { Modal } from "../Modal";
import { FormInput } from "../FormInput";
import type { Emergency } from "../../../../services/api/emergencyApi";

interface EmergencyFormState {
  title: string;
  description: string;
  location: string;
  status: "ACTIVE" | "INACTIVE" | "RESOLVED";
  affected_count: string;
  image_url: string;
}

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    form: {
      title: string;
      description: string;
      location: string;
      status?: string;
      affected_count?: number;
      image_url?: string;
    },
    editingId?: number,
  ) => Promise<void>;
  editingEmergency?: Emergency | null;
}

export function EmergencyModal({
  isOpen,
  onClose,
  onSave,
  editingEmergency,
}: EmergencyModalProps) {
  const [form, setForm] = useState<EmergencyFormState>({
    title: "",
    description: "",
    location: "",
    status: "ACTIVE",
    affected_count: "",
    image_url: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingEmergency) {
      setForm({
        title: editingEmergency.title,
        description: editingEmergency.description,
        location: editingEmergency.location || "",
        status:
          (editingEmergency.status as "ACTIVE" | "INACTIVE" | "RESOLVED") ||
          "ACTIVE",
        affected_count: editingEmergency.affected_count?.toString() || "",
        image_url: editingEmergency.image_url || "",
      });
    } else {
      setForm({
        title: "",
        description: "",
        location: "",
        status: "ACTIVE",
        affected_count: "",
        image_url: "",
      });
    }
  }, [editingEmergency, isOpen]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave(
        {
          title: form.title,
          description: form.description,
          location: form.location,
          status: form.status,
          affected_count: form.affected_count
            ? parseInt(form.affected_count, 10)
            : undefined,
          image_url: form.image_url || undefined,
        },
        editingEmergency?.id,
      );
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm({
      title: "",
      description: "",
      location: "",
      status: "ACTIVE",
      affected_count: "",
      image_url: "",
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={editingEmergency ? "Edit Emergency" : "Add Emergency"}
    >
      <div className="space-y-4">
        <FormInput
          label="Title"
          value={form.title}
          onChange={(v) => setForm({ ...form, title: v })}
          placeholder="Enter emergency title"
          required
        />
        <FormInput
          label="Description"
          value={form.description}
          onChange={(v) => setForm({ ...form, description: v })}
          placeholder="Describe the emergency"
          textarea
          required
        />
        <FormInput
          label="Location"
          value={form.location}
          onChange={(v) => setForm({ ...form, location: v })}
          placeholder="e.g. Oromia Region, Ethiopia"
          required
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <select
            value={form.status}
            onChange={(e) =>
              setForm({
                ...form,
                status: e.target.value as EmergencyFormState["status"],
              })
            }
            className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white"
          >
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
        <FormInput
          label="Affected Count"
          value={form.affected_count}
          onChange={(v) => setForm({ ...form, affected_count: v })}
          placeholder="Enter number of affected people"
          type="number"
        />
        <FormInput
          label="Image URL"
          value={form.image_url}
          onChange={(v) => setForm({ ...form, image_url: v })}
          placeholder="Enter image URL"
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
          {editingEmergency ? "Update Emergency" : "Create Emergency"}
        </button>
      </div>
    </Modal>
  );
}
