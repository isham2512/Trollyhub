import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import LoginSelect from "./pages/LoginSelect";
import Signup from "./pages/Signup";
import StaffLogin from "./pages/StaffLogin";
import CustomerLogin from "./pages/CustomerLogin";
import Dashboard from "./pages/Dashboard";
import ProductsPage from "./pages/ProductsPage";
import StockPage from "./pages/StockPage";
import BillingPage from "./pages/BillingPage";
import OrdersPage from "./pages/OrdersPage";
import BillsPage from "./pages/BillsPage";
import ReportsPage from "./pages/ReportsPage";
import UsersPage from "./pages/UsersPage";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import PageTransition from "./components/PageTransition";
import CursorBackground from "./components/CursorBackground";

import CustomerShop from "./pages/CustomerShop";
import ScheduledBookings from "./pages/ScheduledBookings";

export default function App() {
  const location = useLocation();

  return (
    <>
      <CursorBackground />
      <Routes location={location}>
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/login" element={<PageTransition><LoginSelect /></PageTransition>} />
        <Route path="/signup" element={<PageTransition><Signup /></PageTransition>} />
        <Route path="/login/:role" element={<PageTransition><StaffLogin /></PageTransition>} />
        <Route path="/login/customer" element={<PageTransition><CustomerLogin /></PageTransition>} />
        <Route path="/unauthorized" element={<PageTransition><Unauthorized /></PageTransition>} />

        <Route element={<ProtectedRoute roles={["admin", "manager", "employee", "customer"]} />}>
          <Route path="/customer/dashboard" element={<PageTransition><Layout><Dashboard /></Layout></PageTransition>} />
          <Route path="/customer/shop" element={<PageTransition><Layout><CustomerShop /></Layout></PageTransition>} />
          <Route path="/orders" element={<PageTransition><Layout><OrdersPage /></Layout></PageTransition>} />
          <Route path="/bills" element={<PageTransition><Layout><BillsPage /></Layout></PageTransition>} />
        </Route>

        <Route element={<ProtectedRoute roles={["admin", "manager"]} />}>
          <Route path="/admin/dashboard" element={<PageTransition><Layout><Dashboard /></Layout></PageTransition>} />
          <Route path="/manager/dashboard" element={<PageTransition><Layout><Dashboard /></Layout></PageTransition>} />
          <Route path="/products" element={<PageTransition><Layout><ProductsPage /></Layout></PageTransition>} />
          <Route path="/stock" element={<PageTransition><Layout><StockPage /></Layout></PageTransition>} />
          <Route path="/reports" element={<PageTransition><Layout><ReportsPage /></Layout></PageTransition>} />
        </Route>

        <Route element={<ProtectedRoute roles={["admin", "manager", "employee"]} />}>
          <Route path="/employee/billing" element={<PageTransition><Layout><BillingPage /></Layout></PageTransition>} />
        </Route>

        <Route element={<ProtectedRoute roles={["admin", "manager", "employee"]} />}>
          <Route path="/bookings" element={<PageTransition><Layout><ScheduledBookings /></Layout></PageTransition>} />
        </Route>

        <Route element={<ProtectedRoute roles={["admin"]} />}>
          <Route path="/users" element={<PageTransition><Layout><UsersPage /></Layout></PageTransition>} />
        </Route>

        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </>
  );
}
