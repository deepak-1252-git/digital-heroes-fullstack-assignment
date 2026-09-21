import { BrowserRouter, Routes, Route } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";

// import DashboardLayout from "./layouts/DashboardLayout";
import UserLayout from "./layouts/UserLayout";

import AdminDashboard from "./pages/admin/AdminDashboard";
import Users from "./pages/admin/Users";
import AdminDraws from "./pages/admin/Draws";
import Winners from "./pages/admin/Winners";
import Charities from "./pages/admin/Charities";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import Home from "./pages/public/Home";

import Overview from "./pages/user/Overview";
import Scores from "./pages/user/Scores";
import Charity from "./pages/user/Charity";
import Draws from "./pages/user/Draws";
import Subscription from "./pages/user/Subscription";
import Winnings from "./pages/user/Winnings";
import Profile from "./pages/user/Profile";

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
              <UserLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Overview />} />

          <Route path="scores" element={<Scores />} />
          <Route path="charity" element={<Charity />} />
          <Route path="draws" element={<Draws />} />
          <Route path="subscription" element={<Subscription />} />
          <Route path="winnings" element={<Winnings />} />
          <Route path="profile" element={<Profile />} />

        </Route>

        <Route
          path="/admin"
          element={<AdminDashboard />}
        />

        <Route
          path="/admin/users"
          element={<Users />}
        />

        <Route
          path="/admin/draws"
          element={<AdminDraws />}
        />

        <Route
          path="/admin/winners"
          element={<Winners />}
        />

        <Route
          path="/admin/charities"
          element={<Charities />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;