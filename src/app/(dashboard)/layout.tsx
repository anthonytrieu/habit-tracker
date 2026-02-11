import { Suspense } from "react";
import { TopNav } from "@/components/layout/top-nav";
import { DateProvider } from "@/lib/hooks/use-date";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense>
      <DateProvider>
        <div className="min-h-screen bg-background">
          <TopNav />
          <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
        </div>
      </DateProvider>
    </Suspense>
  );
}
