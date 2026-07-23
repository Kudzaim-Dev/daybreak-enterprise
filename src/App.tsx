import { BrowserRouter, Route, Routes } from "react-router-dom";
import { DefaultProviders } from "./components/providers/default.tsx";
import AuthCallback from "./pages/auth/Callback.tsx";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import AppLayoutWrapper from "./pages/app/_components/AppLayout.tsx";
import DashboardPage from "./pages/dashboard/page.tsx";
import ClientsPage from "./pages/clients/page.tsx";
import ProductsPage from "./pages/products/page.tsx";
import QuotationsPage from "./pages/quotations/page.tsx";
import InvoicesPage from "./pages/invoices/page.tsx";
import ReceiptsPage from "./pages/receipts/page.tsx";
import SettingsPage from "./pages/settings/page.tsx";

export default function App() {
  return (
    <DefaultProviders>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route element={<AppLayoutWrapper />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/quotations" element={<QuotationsPage />} />
            <Route path="/invoices" element={<InvoicesPage />} />
            <Route path="/receipts" element={<ReceiptsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </DefaultProviders>
  );
}
