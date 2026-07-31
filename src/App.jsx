import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import AllBill from "./pages/allBill";
import Payment from "./pages/Payment";
import Bill from "./pages/Bill";
import SaleEditor from "./pages/SalesEditor";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

// ProtectedRoute wrapper
const ProtectedRoute = ({ children }) => {
  const user = localStorage.getItem("user");
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        
        <Route
        path="/AllBill"
        element={
          <ProtectedRoute>
            <AllBill/>
          </ProtectedRoute>
        }
        />

        <Route
          path="/payment"
          element={
            <ProtectedRoute>
              <Payment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sale-editor/:saleId"
          element={
            <ProtectedRoute>
              <SaleEditor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bill"
          element={
            <ProtectedRoute>
              <Bill />
            </ProtectedRoute>
          }
        />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
