import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import {
  TrendingUp,
  CheckCircle,
  Clock,
  Wallet,
  Star,
} from "lucide-react";

/* ===============================
   STATIC DATA (UNCHANGED)
================================ */
const stats = [
  { title: "Total Requests", value: 12, icon: TrendingUp, color: "blue" },
  { title: "Completed", value: 6, icon: CheckCircle, color: "green" },
  { title: "Pending", value: 4, icon: Clock, color: "yellow" },
  { title: "Earnings", value: "₹8,500", icon: Wallet, color: "indigo" },
];

const rating = 4.5;

const earningsData = [
  { month: "Jan", earnings: 4000 },
  { month: "Feb", earnings: 3000 },
  { month: "Mar", earnings: 5000 },
  { month: "Apr", earnings: 4500 },
  { month: "May", earnings: 6000 },
];

const statusData = [
  { name: "Completed", value: 6 },
  { name: "Pending", value: 4 },
  { name: "Rejected", value: 2 },
];

const jobsData = [
  { month: "Jan", jobs: 8 },
  { month: "Feb", jobs: 6 },
  { month: "Mar", jobs: 10 },
  { month: "Apr", jobs: 9 },
  { month: "May", jobs: 12 },
];

const ratingDistribution = [
  { stars: "5★", count: 8 },
  { stars: "4★", count: 5 },
  { stars: "3★", count: 2 },
  { stars: "2★", count: 1 },
  { stars: "1★", count: 0 },
];

const COLORS = ["#22c55e", "#facc15", "#ef4444"];

/* ===============================
   PROVIDER DASHBOARD
================================ */
const ProviderDashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50 to-blue-100 p-8 space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-slate-900">
          Provider Dashboard
        </h1>
        <p className="mt-1 text-slate-600">
          Track your performance, earnings & ratings
        </p>
      </div>

      {/* Stats + Rating */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {stats.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur p-6 shadow-md hover:shadow-xl transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{item.title}</p>
                  <h3 className="mt-2 text-3xl font-bold text-slate-900">
                    {item.value}
                  </h3>
                </div>

                <div
                  className={`rounded-xl p-3 bg-${item.color}-100 text-${item.color}-600`}
                >
                  <Icon size={22} />
                </div>
              </div>

              {/* Accent bar */}
              <div
                className={`absolute bottom-0 left-0 h-1 w-full bg-${item.color}-500`}
              />
            </div>
          );
        })}

        {/* Rating Card */}
        <div className="rounded-2xl bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 shadow-md hover:shadow-xl transition">
          <p className="text-sm text-slate-600">Average Rating</p>
          <h3 className="mt-2 text-3xl font-bold text-slate-900">
            {rating} / 5
          </h3>

          <div className="mt-3 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                size={20}
                className={
                  i <= Math.floor(rating)
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-slate-300"
                }
              />
            ))}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Earnings */}
        <div className="lg:col-span-2 rounded-2xl bg-white/80 backdrop-blur p-6 shadow-md">
          <h3 className="mb-4 text-lg font-semibold text-slate-800">
            Earnings Trend
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={earningsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="earnings"
                stroke="#4f46e5"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Status Pie */}
        <div className="rounded-2xl bg-white/80 backdrop-blur p-6 shadow-md">
          <h3 className="mb-4 text-lg font-semibold text-slate-800">
            Request Status
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                outerRadius={90}
                label
              >
                {statusData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Rating Distribution */}
        <div className="rounded-2xl bg-white/80 backdrop-blur p-6 shadow-md">
          <h3 className="mb-4 text-lg font-semibold text-slate-800">
            Rating Distribution
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={ratingDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="stars" />
              <YAxis />
              <Tooltip />
              <Bar
                dataKey="count"
                fill="#facc15"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;
