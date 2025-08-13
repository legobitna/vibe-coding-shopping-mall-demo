import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainPage from "./pages/MainPage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import AdminPage from "./pages/admin/AdminPage";
import ProductCreatePage from "./pages/admin/ProductCreatePage";
import ProductManagePage from "./pages/admin/ProductManagePage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import OrderFailurePage from "./pages/OrderFailurePage";
import OrderListPage from "./pages/OrderListPage";
import OrderManagePage from "./pages/admin/OrderManagePage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/products/create" element={<ProductCreatePage />} />
        <Route path="/admin/products" element={<ProductManagePage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-success" element={<OrderSuccessPage />} />
        <Route path="/order-failure" element={<OrderFailurePage />} />
        <Route path="/orders" element={<OrderListPage />} />
        <Route path="/admin/orders" element={<OrderManagePage />} />
      </Routes>
    </Router>
  );
}

export default App;
