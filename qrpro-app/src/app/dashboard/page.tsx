import DashboardPage from './dashboard-page';
import { RouteGuard } from '@/components/security/RouteGuard';

export default function Page() {
  return (
    <RouteGuard requiredLevel="user">
      <DashboardPage />
    </RouteGuard>
  );
}
