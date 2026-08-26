export default function AuthCard({ title, subtitle, children }) {
  return (
    <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">

      <div className="text-center mb-8">

        <h1 className="text-4xl font-bold text-white">
          {title}
        </h1>

        <p className="text-gray-400 mt-3">
          {subtitle}
        </p>

      </div>

      {children}

    </div>
  );
}