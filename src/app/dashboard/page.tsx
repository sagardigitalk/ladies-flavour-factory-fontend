"use client";

import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/Card";
import { MdShoppingBag, MdWarning, MdInventory, MdTrendingUp, MdArrowForward } from "react-icons/md";
import { clsx } from "clsx";
import { motion } from "framer-motion";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

// Mock Data for Chart
const data = [
  { name: 'Mon', sales: 4000 },
  { name: 'Tue', sales: 3000 },
  { name: 'Wed', sales: 2000 },
  { name: 'Thu', sales: 2780 },
  { name: 'Fri', sales: 1890 },
  { name: 'Sat', sales: 2390 },
  { name: 'Sun', sales: 3490 },
];

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
  trendUp?: boolean;
  color: "indigo" | "red" | "green" | "yellow";
  index: number;
}

function StatCard({ title, value, icon: Icon, trend, trendUp, color, index }: StatCardProps) {
  const colorStyles = {
    indigo: "bg-indigo-50 text-indigo-600 ring-indigo-100",
    red: "bg-red-50 text-red-600 ring-red-100",
    green: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    yellow: "bg-amber-50 text-amber-600 ring-amber-100",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <Card className="border-none shadow-sm hover:shadow-md transition-shadow duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">{title}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2 tracking-tight">{value}</p>
            </div>
            <div className={clsx("p-3 rounded-2xl ring-1", colorStyles[color])}>
              <Icon className="w-6 h-6" />
            </div>
          </div>
          {trend && (
            <div className="mt-4 flex items-center text-sm">
              <span
                className={clsx(
                  "font-semibold flex items-center gap-1",
                  trendUp ? "text-emerald-600" : "text-red-600"
                )}
              >
                {trendUp ? "↑" : "↓"} {trend}
              </span>
              <span className="text-gray-400 ml-2">vs last month</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            Dashboard
          </h2>
          <p className="text-gray-500 mt-1">
            Hi, {user?.name}! Here's your factory overview.
          </p>
        </motion.div>
        
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2"
        >
          <MdTrendingUp className="w-5 h-5" />
          Generate Report
        </motion.button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          index={0}
          title="Total Products"
          value="124"
          icon={MdShoppingBag}
          color="indigo"
          trend="12%"
          trendUp={true}
        />
        <StatCard
          index={1}
          title="Low Stock Items"
          value="3"
          icon={MdWarning}
          color="red"
          trend="2"
          trendUp={true} // Interpretation: Less is better? Or maybe just count change.
        />
        <StatCard
          index={2}
          title="Total Categories"
          value="12"
          icon={MdInventory}
          color="yellow"
        />
        <StatCard
          index={3}
          title="Total Revenue"
          value="$12,450"
          icon={MdTrendingUp}
          color="green"
          trend="8.2%"
          trendUp={true}
        />
      </div>

      {/* Charts & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <motion.div 
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="h-[400px] border-none shadow-sm flex flex-col">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Revenue Analytics</h3>
              <select className="bg-gray-50 border-none text-sm rounded-lg px-3 py-1 focus:ring-0 text-gray-600 cursor-pointer hover:bg-gray-100 transition-colors">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>This Year</option>
              </select>
            </div>
            <div className="flex-1 p-6 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#4F46E5" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorSales)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>
        
        {/* Recent Activity / Quick Actions */}
        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-none shadow-sm">
            <div className="p-6 border-b border-gray-50">
              <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
            </div>
            <div className="p-6 grid gap-4">
              <button className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all group">
                <span className="font-medium text-gray-700 group-hover:text-indigo-700">Add New Product</span>
                <MdArrowForward className="w-5 h-5 text-gray-400 group-hover:text-indigo-500" />
              </button>
              <button className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all group">
                <span className="font-medium text-gray-700 group-hover:text-indigo-700">Check Inventory</span>
                <MdArrowForward className="w-5 h-5 text-gray-400 group-hover:text-indigo-500" />
              </button>
            </div>
          </Card>

          <Card className="border-none shadow-sm bg-gradient-to-br from-indigo-600 to-purple-700 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <div className="p-6 relative z-10">
              <h3 className="text-lg font-bold mb-2">Pro Tip</h3>
              <p className="text-indigo-100 text-sm mb-4">
                Keep your inventory updated daily to get accurate sales forecasts.
              </p>
              <button className="text-sm font-medium bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors backdrop-blur-sm">
                Learn More
              </button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
