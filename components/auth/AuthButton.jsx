export default function AuthButton({
  children,
  type = "submit",
}) {
  return (
    <button
      type={type}
      className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition font-semibold text-white"
    >
      {children}
    </button>
  );
}