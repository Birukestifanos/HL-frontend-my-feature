import { useState, useEffect } from "react";
import { Save, Loader2 } from "lucide-react";
import { Modal } from "../Modal";
import { FormInput } from "../FormInput";
import type { NewsForm, News } from "../../types/admin";

interface NewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (form: NewsForm, editingId?: number) => Promise<void>;
  editingNews?: News | null;
}

export function NewsModal({
  isOpen,
  onClose,
  onSave,
  editingNews,
}: NewsModalProps) {
  const [form, setForm] = useState<NewsForm>({
    title: "",
    content: "",
    image_url: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingNews) {
      setForm({
        title: editingNews.title,
        content: editingNews.content,
        image_url: editingNews.image_url || "",
      });
    } else {
      setForm({ title: "", content: "", image_url: "" });
    }
  }, [editingNews, isOpen]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave(form, editingNews?.id);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm({ title: "", content: "", image_url: "" });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={editingNews ? "Edit News" : "Add News"}
    >
      <div className="space-y-4">
        <FormInput
          label="Title"
          value={form.title}
          onChange={(v) => setForm({ ...form, title: v })}
          placeholder="Enter news title"
          required
        />
        <FormInput
          label="Content"
          value={form.content}
          onChange={(v) => setForm({ ...form, content: v })}
          placeholder="Enter news content"
          textarea
          required
        />
        <FormInput
          label="Image URL (optional)"
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
          {editingNews ? "Update News" : "Create News"}
        </button>
      </div>
    </Modal>
  );
}
