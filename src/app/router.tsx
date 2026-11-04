import { createBrowserRouter } from 'react-router-dom'
import { ActivitiesListPage } from '@/features/activities/ActivitiesListPage'
import { ActivityManagementPage } from '@/features/activities/ActivityManagementPage'
import { ActivityRunPage } from '@/features/activities/ActivityRunPage'
import { CertificatesPage } from '@/features/certificates/CertificatesPage'
import { TrophyShelfPage } from '@/features/certificates/TrophyShelfPage'
import { FundPage } from '@/features/fund/FundPage'
import { FunListPage } from '@/features/fun/FunListPage'
import { FunManagementPage } from '@/features/fun/FunManagementPage'
import { PickPage } from '@/features/games/PickPage'
import { KidManagementPage } from '@/features/kids/KidManagementPage'
import { AdjustPointsPage } from '@/features/parent/AdjustPointsPage'
import { ApprovalsPage } from '@/features/parent/ApprovalsPage'
import { ParentDashboard } from '@/features/parent/ParentDashboard'
import { ParentLayout } from '@/features/parent/ParentLayout'
import { SettingsPage } from '@/features/parent/SettingsPage'
import { OverallReportPage } from '@/features/reports/OverallReportPage'
import { WeeklyReportPage } from '@/features/reports/WeeklyReportPage'
import { ScreenTimeManagementPage } from '@/features/screentime/ScreenTimeManagementPage'
import { RewardManagementPage } from '@/features/shop/RewardManagementPage'
import { ShopPage } from '@/features/shop/ShopPage'
import { SpendingHistoryPage } from '@/features/shop/SpendingHistoryPage'
import { TaskManagementPage } from '@/features/tasks/TaskManagementPage'
import { TasksPage } from '@/features/tasks/TasksPage'
import { AppShell } from './AppShell'
import { HomePage } from './HomePage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'tasks', element: <TasksPage /> },
      { path: 'activities', element: <ActivitiesListPage /> },
      { path: 'activities/:id', element: <ActivityRunPage /> },
      { path: 'fun', element: <FunListPage /> },
      { path: 'pick', element: <PickPage /> },
      { path: 'fund', element: <FundPage /> },
      { path: 'shop', element: <ShopPage /> },
      { path: 'shop/history', element: <SpendingHistoryPage /> },
      { path: 'trophies', element: <TrophyShelfPage /> },
      {
        path: 'parent',
        element: <ParentLayout />,
        children: [
          { index: true, element: <ParentDashboard /> },
          { path: 'kids', element: <KidManagementPage /> },
          { path: 'tasks', element: <TaskManagementPage /> },
          { path: 'activities', element: <ActivityManagementPage /> },
          { path: 'fun', element: <FunManagementPage /> },
          { path: 'screentime', element: <ScreenTimeManagementPage /> },
          { path: 'rewards', element: <RewardManagementPage /> },
          { path: 'adjustments', element: <AdjustPointsPage /> },
          { path: 'approvals', element: <ApprovalsPage /> },
          { path: 'reports', element: <WeeklyReportPage /> },
          { path: 'reports/overall', element: <OverallReportPage /> },
          { path: 'certificates', element: <CertificatesPage /> },
          { path: 'settings', element: <SettingsPage /> },
        ],
      },
    ],
  },
], { basename: import.meta.env.BASE_URL })
