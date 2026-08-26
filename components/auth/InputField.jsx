export default function InputField({
  label,
  type = "text",
  placeholder,
}) {
  return (
    <div>

      <label className="block text-gray-300 mb-2">
        {label}
      </label>

      <input
        type={type}
        placeholder={placeholder}
        className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-blue-500"
      />

    </div>
  );
}