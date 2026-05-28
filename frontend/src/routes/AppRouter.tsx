import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { ProtectedRoute } from "../auth/ProtectedRoute";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { DashboardPage } from "../pages/DashboardPage";
import { BotsPage } from "../pages/BotsPage";
import { BotFormPage } from "../pages/BotFormPage";
import { IcpsPage } from "../pages/IcpsPage";
import { IcpFormPage } from "../pages/IcpFormPage";
import { LoginPage } from "../pages/LoginPage";
import { PromptsPage } from "../pages/PromptsPage";
import { LeadsPage } from "../pages/LeadsPage";
import { LeadDetailPage } from "../pages/LeadDetailPage";
import { SettingsPage } from "../pages/SettingsPage";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <DashboardLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: "bots", element: <BotsPage /> },
          { path: "bots/new", element: <BotFormPage /> },
          { path: "bots/:id/edit", element: <BotFormPage /> },
          { path: "icps", element: <IcpsPage /> },
          { path: "icps/new", element: <IcpFormPage /> },
          { path: "icps/:id/edit", element: <IcpFormPage /> },
          { path: "prompts", element: <PromptsPage /> },
          { path: "leads", element: <LeadsPage /> },
          { path: "leads/:id", element: <LeadDetailPage /> },
          { path: "settings", element: <SettingsPage /> },
        ],
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
