import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Trophy,
  Heart,
  Ticket,
  Wallet,
  CreditCard,
  User,
  LogOut,
} from "lucide-react";
import { supabase } from "../lib/supabase";

const menuItems = [
  {
    name: "Overview",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Golf Scores",
    path: "/dashboard/scores",
    icon: Trophy,
  },
  {
    name: "Charity",
    path: "/dashboard/charity",
    icon: Heart,
  },
  {
    name: "Draws",
    path: "/dashboard/draws",
    icon: Ticket,
  },
  {
    name: "Winnings",
    path: "/dashboard/winnings",
    icon: Wallet,
  },
  {
    name: "Subscription",
    path: "/dashboard/subscription",
    icon: CreditCard,
  },
  {
    name: "Profile",
    path: "/dashboard/profile",
    icon: User,
  },
];

export default function DashboardLayout() {
  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-[#080909] text-white flex">

      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 bg-[#0d0e0e] p-5 flex flex-col">

        {/* Logo */}
        <div className="mb-10">
          <h1 className="text-2xl font-bold">
            Digital<span className="text-lime-400">Heroes</span>
          </h1>

          <p className="text-xs text-gray-500 mt-1">
            Golf • Charity • Rewards
          </p>
        </div>

        {/* Navigation */}
        <nav className="space-y-2 flex-1">

          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/dashboard"}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                    isActive
                      ? "bg-lime-400 text-black"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <Icon size={19} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}

        </nav>

        {/* Logout */}
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition"
        >
          <LogOut size={19} />
          Logout
        </button>

      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">

        {/* Top bar */}
        <header className="h-20 border-b border-white/10 flex items-center justify-between px-8">
          <div>
            <p className="text-sm text-gray-500">
              Subscriber Dashboard
            </p>

            <h2 className="text-xl font-semibold">
              Welcome back 👋
            </h2>
          </div>
        </header>

        {/* Page */}
        <section className="p-8">
          <Outlet />
        </section>

      </main>

    </div>
  );
}   