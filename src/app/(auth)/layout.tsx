export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50">
      <div className="absolute top-8 left-8 text-2xl font-bold text-slate-900">
        FinFlow
      </div>
      {children}
    </div>
  );
}
