import { DashboardPage } from "@/components/dashboard/dashboard-page";
import { MainLayout } from "@/components/layout/main-layout";

export default function Home() {
  return (
    <MainLayout>
      <DashboardPage />
    </MainLayout>
  );
}
