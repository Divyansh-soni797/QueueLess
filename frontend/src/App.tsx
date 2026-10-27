import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ShopLayout from "./layouts/ShopLayout";
import ShopLanding from "./pages/ShopLanding";
import ScanScreen from "./pages/ScanScreen";
import CartScreen from "./pages/CartScreen";
import PaymentScreen from "./pages/PaymentScreen";
import ReceiptScreen from "./pages/ReceiptScreen";
import SecurityVerifyScreen from "./pages/SecurityVerifyScreen";
import OwnerDashboard from "./pages/OwnerDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/shop/demo" replace />} />

        <Route path="/shop/:shopId" element={<ShopLayout />}>
          <Route index element={<ShopLanding />} />
          <Route path="scan" element={<ScanScreen />} />
          <Route path="cart" element={<CartScreen />} />
          <Route path="pay/:orderId" element={<PaymentScreen />} />
          <Route path="receipt/:orderId" element={<ReceiptScreen />} />
          <Route path="verify" element={<SecurityVerifyScreen />} />
          <Route path="owner" element={<OwnerDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
