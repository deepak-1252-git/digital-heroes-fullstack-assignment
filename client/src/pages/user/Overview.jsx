import { Trophy, Heart, Ticket, Wallet } from "lucide-react";

const stats = [
  {
    title: "Golf Scores",
    value: "0 / 5",
    description: "Scores submitted",
    icon: Trophy,
  },
  {
    title: "Charity",
    value: "10%",
    description: "Current contribution",
    icon: Heart,
  },
  {
    title: "Draws",
    value: "0",
    description: "Participations",
    icon: Ticket,
  },
  {
    title: "Winnings",
    value: "£0",
    description: "Total winnings",
    icon: Wallet,
  },
];

export default function Overview() {
  return (
    <div className="space-y-8">

      {/* Heading */}
      <div>
        <h1 className="text-3xl font-bold">
          Dashboard
        </h1>

        <p className="text-gray-500 mt-2">
          Track your golf scores, charity contribution and rewards.
        </p>
      </div>

      {/* Subscription */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-lime-400/10 to-transparent p-6">

        <div className="flex items-center justify-between">

          <div>
            <p className="text-sm text-gray-400">
              Subscription
            </p>

            <h2 className="text-2xl font-semibold mt-1">
              No Active Subscription
            </h2>

            <p className="text-gray-500 mt-2">
              Subscribe to participate in monthly draws.
            </p>
          </div>

          <button className="px-5 py-3 bg-lime-400 text-black rounded-xl font-semibold hover:bg-lime-300 transition">
            View Plans
          </button>

        </div>

      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="border border-white/10 bg-[#0d0e0e] rounded-2xl p-5"
            >

              <div className="flex items-center justify-between">

                <div className="p-3 rounded-xl bg-white/5">
                  <Icon size={20} />
                </div>

              </div>

              <p className="text-gray-500 text-sm mt-5">
                {stat.title}
              </p>

              <h3 className="text-2xl font-bold mt-1">
                {stat.value}
              </h3>

              <p className="text-xs text-gray-600 mt-1">
                {stat.description}
              </p>

            </div>
          );
        })}

      </div>

    </div>
  );
}