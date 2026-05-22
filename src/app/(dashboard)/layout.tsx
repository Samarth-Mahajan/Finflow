import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-finflow-bg">
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-60">
        <Sidebar />
      </div>

      <div className="flex min-w-0 flex-1 flex-col lg:pl-60">
        <Topbar />

        <main className="flex-1 overflow-y-auto">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
