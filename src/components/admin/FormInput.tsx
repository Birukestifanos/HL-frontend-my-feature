interface FormInputProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  textarea?: boolean;
}

export function FormInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
  textarea,
}: FormInputProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label} {required && <span className="text-[#B91C1C]">*</span>}
      </label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border-0 focus:ring-2 focus:ring-[#B91C1C]/20 text-gray-900 dark:text-white"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border-0 focus:ring-2 focus:ring-[#B91C1C]/20 text-gray-900 dark:text-white"
        />
      )}
    </div>
  );
}
