import { BrowserRouter, Routes, Route } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";

import UserLayout from "./layouts/UserLayout";
import AdminLayout from "./layouts/AdminLayout";
import PublicLayout from "./layouts/PublicLayout";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/Users";
import AdminSubscriptions from "./pages/admin/Subscriptions";
import AdminScores from "./pages/admin/Scores";
import AdminDraws from "./pages/admin/Draws";
import AdminCharities from "./pages/admin/Charities";
import AdminWinners from "./pages/admin/Winners";
import AdminAnalytics from "./pages/admin/Analytics";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import Home from "./pages/public/Home";
import HowItWorks from "./pages/public/HowItWorks";
import Charities from "./pages/public/Charities";
import CharityDetail from "./pages/public/CharityDetail";
import Pricing from "./pages/public/Pricing";

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
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />

          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/charities" element={<Charities />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/charities/:id" element={<CharityDetail />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
        </Route>


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

        {/* Admin Dashboard */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="subscriptions" element={<AdminSubscriptions />} />
          <Route path="scores" element={<AdminScores />} />
          <Route path="draws" element={<AdminDraws />} />
          <Route path="charities" element={<AdminCharities />} />
          <Route path="winners" element={<AdminWinners />} />
          <Route path="analytics" element={<AdminAnalytics />} />
        </Route>

      </Routes>

    </BrowserRouter>
  );
}

export default App;