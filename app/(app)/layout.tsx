import { Sidebar } from "@/components/shell/Sidebar";
import { QuickAdd } from "@/components/tasks/QuickAdd";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      <QuickAdd />
    </div>
  );
}
