import React, { useState, useEffect } from "react";
import CountUp from "react-countup";
import { 
  Users, UserPlus, FileText, Gift, Landmark, Coins, Wallet,
  ClipboardCheck, RefreshCw, Download, ArrowUpRight, ArrowDownRight,
  User
} from "lucide-react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell
} from "recharts";
import { formatDistanceToNow } from "date-fns";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

// --- MOCK DATA ---
const generateMockData = () => ({
  kpi: [
    { title: "Total Users", value: 14205, delta: 12.5, isPositive: true, icon: Users },
    { title: "New Today", value: 342, delta: 5.2, isPositive: true, icon: UserPlus },
    { title: "Surveys Completed Today", value: 1845, delta: -2.4, isPositive: false, icon: FileText },
    { title: "Pending Redemptions", value: 89, delta: 18.2, isPositive: true, icon: Gift },
    { title: "Pending Withdrawals", value: 12, delta: 0, isPositive: true, icon: Landmark },
    { title: "Total Berry in Circulation", value: 4520500, delta: 8.4, isPositive: true, icon: Coins },
    { title: "Total Wallet Balance (₦)", value: 1245000, delta: 3.1, isPositive: true, icon: Wallet },
  ],
  registrations: Array.from({ length: 30 }).map((_, i) => ({
    date: `Apr ${i + 1}`,
    count: Math.floor(Math.random() * 200) + 50,
  })),
  surveyCategories: Array.from({ length: 14 }).map((_, i) => ({
    date: `Apr ${i + 1}`,
    Tech: Math.floor(Math.random() * 100) + 20,
    Health: Math.floor(Math.random() * 80) + 10,
    Finance: Math.floor(Math.random() * 60) + 5,
    Lifestyle: Math.floor(Math.random() * 40),
  })),
  berryFlow: [
    { name: "Surveys", value: 1540000, color: "#CA3F73" },
    { name: "Profile Builder", value: 820000, color: "#E0C3FC" },
    { name: "Cash Rewards", value: 2100000, color: "#F1B347" },
    { name: "Raffle Tickets", value: 450000, color: "#0F1115" },
  ],
  topSurveys: [
    { title: "Tech Habits 2026", completions: 8450 },
    { title: "Remote Work Setup", completions: 6200 },
    { title: "Finance App Usage", completions: 5120 },
    { title: "Favorite Snacks", completions: 4800 },
    { title: "Weekly Fitness", completions: 3200 },
    { title: "Streaming Services", completions: 2900 },
  ],
  activityFeed: Array.from({ length: 20 }).map((_, i) => {
    const types = ["survey", "redemption", "user"];
    const type = types[Math.floor(Math.random() * types.length)];
    const timeOffset = Math.floor(Math.random() * 3600000 * 24); // up to 24h ago
    const time = new Date(Date.now() - (i * 300000) - timeOffset);
    return {
      id: i,
      type,
      user: `User ${Math.floor(Math.random() * 1000)}`,
      action: type === "survey" ? "completed Tech Habits 2026 (+150 Berry)" :
              type === "redemption" ? "redeemed ₦5,000 Cash (-5,000 Berry)" :
              "registered an account",
      icon: type === "survey" ? ClipboardCheck :
            type === "redemption" ? Gift : UserPlus,
      timestamp: time,
    };
  }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()),
});

// --- COMPONENTS ---

interface KPICardProps {
  item: any;
  isLoading: boolean;
  key?: string | number;
}

const KPICard = ({ item, isLoading }: KPICardProps) => {
  const Icon = item.icon;
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Icon className="w-6 h-6" />
          </div>
          <div className={`flex items-center space-x-1 text-sm font-medium ${
            item.isPositive ? "text-green-600" : "text-red-600"
          }`}>
            {item.isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            <span>{Math.abs(item.delta)}%</span>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm font-medium text-muted-foreground">{item.title}</p>
          <h3 className="text-2xl font-bold mt-1 text-foreground">
            {isLoading ? (
              <Skeleton className="h-8 w-1/2" />
            ) : (
              <CountUp 
                end={item.value} 
                separator="," 
                duration={1.5} 
                prefix={item.title.includes("₦") ? "₦" : ""}
              />
            )}
          </h3>
        </div>
      </CardContent>
    </Card>
  );
};

export default function Dashboard() {
  const [data, setData] = useState<ReturnType<typeof generateMockData> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState("last-30");

  const loadData = () => {
    setIsLoading(true);
    // Simulate network delay
    setTimeout(() => {
      setData(generateMockData());
      setIsLoading(false);
    }, 1000);
  };

  useEffect(() => {
    loadData();
  }, [dateRange]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Overview of portal activity and metrics.</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-48">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue placeholder="Select date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="last-7">Last 7 Days</SelectItem>
                <SelectItem value="last-30">Last 30 Days</SelectItem>
                <SelectItem value="last-90">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" size="icon" onClick={loadData} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
          <Button className="bg-primary hover:bg-primary/90">
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* KPI ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading && !data
          ? Array.from({ length: 7 }).map((_, i) => (
              <Card key={i}><CardContent className="p-6"><Skeleton className="h-24 w-full" /></CardContent></Card>
            ))
          : data?.kpi.map((kpi, i) => (
              <KPICard key={kpi.title} item={kpi} isLoading={isLoading} />
            ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          {/* CHARTS ROW 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Registrations Over Time</CardTitle>
                <CardDescription>User signups for the selected period.</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {isLoading ? <Skeleton className="w-full h-full" /> : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data?.registrations}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                      <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Line type="monotone" dataKey="count" stroke="#CA3F73" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Berry Flow</CardTitle>
                <CardDescription>Economy distribution across the app.</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {isLoading ? <Skeleton className="w-full h-full" /> : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data?.berryFlow}
                        cx="50%"
                        cy="45%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {data?.berryFlow.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(val: number) => val.toLocaleString()} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* CHARTS ROW 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Surveys by Category</CardTitle>
                <CardDescription>Daily completions segmented by topic.</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {isLoading ? <Skeleton className="w-full h-full" /> : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data?.surveyCategories}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                      <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                      <Bar dataKey="Tech" stackId="a" fill="#CA3F73" radius={[0, 0, 4, 4]} />
                      <Bar dataKey="Health" stackId="a" fill="#F1B347" />
                      <Bar dataKey="Finance" stackId="a" fill="#10B981" />
                      <Bar dataKey="Lifestyle" stackId="a" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top Surveys</CardTitle>
                <CardDescription>Most completed surveys all-time.</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {isLoading ? <Skeleton className="w-full h-full" /> : (
                  <ResponsiveContainer width="100%" height="100%" layout="vertical">
                    <BarChart data={data?.topSurveys} layout="vertical" margin={{ left: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                      <YAxis dataKey="title" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} width={100} />
                      <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="completions" fill="#F1B347" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ACTIVITY FEED */}
        <div className="xl:col-span-1">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg">Live Activity</CardTitle>
              <CardDescription>Recent events across the platform.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              {isLoading ? (
                <div className="p-6 space-y-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex items-start space-x-4">
                      <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                      <div className="space-y-2 w-full">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <ScrollArea className="h-[650px] px-6">
                  <div className="space-y-6 pb-6 pr-4">
                    {data?.activityFeed.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-4 group">
                        <div className={`w-8 h-8 rounded-full flex flex-shrink-0 items-center justify-center mt-1
                          ${activity.type === 'survey' ? 'bg-primary/10 text-primary' : 
                            activity.type === 'redemption' ? 'bg-secondary/20 text-secondary-foreground' : 
                            'bg-blue-100 text-blue-600'}`
                        }>
                          <activity.icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium leading-none text-foreground">
                            {activity.user}
                          </p>
                          <p className="text-sm text-muted-foreground break-words line-clamp-2">
                            {activity.action}
                          </p>
                          <p className="text-xs text-muted-foreground pt-1 flex items-center">
                            {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
