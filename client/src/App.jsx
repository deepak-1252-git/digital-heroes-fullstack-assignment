import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/public/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import Overview from "./pages/user/Overview";
import Scores from "./pages/user/Scores";
import Charity from "./pages/user/Charity";
import Subscription from "./pages/user/Subscription";

import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* User Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          
          <Route index element={<Overview />} />
          <Route path="scores" element={<Scores />} />
          <Route path="charity" element={<Charity />} />
          <Route path="subscription" element={<Subscription />} />

        </Route>

      </Routes>

    </BrowserRouter>
  );
}

export default App;