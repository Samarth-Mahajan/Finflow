export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-finflow-bg">
      <div className="absolute left-8 top-8">
        <span className="text-2xl font-bold tracking-tight text-finflow-text">
          FinFlow
        </span>
        <span className="mt-0.5 block text-xs font-medium text-finflow-teal">
          Wealth Command
        </span>
      </div>
      {children}
    </div>
  );
}
