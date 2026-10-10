import { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Banknote, ShoppingCart, TrendingUp, Clock } from 'lucide-react';
import { adminSalesDashboard, AdminSalesDashboardOutputType } from 'zitejs/api';
import { Skeleton } from '@project/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@project/components/ui/select';
import { formatPrice } from '@/data/sampleData';

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))', 'hsl(var(--muted-foreground))'];

function Stat({ icon: Icon, label, value }: { icon: typeof Banknote; label: string; value: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2"><Icon className="h-4 w-4 text-accent" />{label}</div>
      <p className="text-2xl font-bold tabular-nums">{value}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <h3 className="font-semibold text-sm mb-4">{title}</h3>
      {children}
    </div>
  );
}

export default function DashboardTab() {
  const [days, setDays] = useState('30');
  const [data, setData] = useState<AdminSalesDashboardOutputType | null>(null);

  useEffect(() => {
    setData(null);
    adminSalesDashboard({ days: Number(days) }).then(setData).catch(() => setData(null));
  }, [days]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold">Sales overview</h2>
        <Select value={days} onValueChange={setDays}>
          <SelectTrigger className="w-36 h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {!data ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}<Skeleton className="h-72 rounded-xl col-span-full" /></div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Stat icon={Banknote} label="Revenue" value={formatPrice(data.totalRevenue)} />
            <Stat icon={ShoppingCart} label="Orders" value={String(data.totalOrders)} />
            <Stat icon={TrendingUp} label="Avg. order" value={formatPrice(data.avgOrder)} />
            <Stat icon={Clock} label="Pending" value={String(data.pendingOrders)} />
          </div>

          <Panel title="Revenue per day">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={data.revenueByDay}>
                <defs><linearGradient id="rev" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.35} /><stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="date" tickFormatter={d => format(parseISO(d), 'MMM d')} fontSize={11} tickLine={false} axisLine={false} minTickGap={20} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} width={40} />
                <Tooltip labelFormatter={d => format(parseISO(String(d)), 'EEE, MMM d')} formatter={(v: number, n) => n === 'revenue' ? [formatPrice(v), 'Revenue'] : [v, 'Orders']} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--accent))" strokeWidth={2} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </Panel>

          <div className="grid lg:grid-cols-3 gap-4">
            <Panel title="Top products">
              {data.topProducts.length === 0 ? <p className="text-sm text-muted-foreground">No sales yet</p> : (
                <div className="space-y-3">
                  {data.topProducts.map((p, i) => (
                    <div key={p.name} className="flex items-center gap-3 text-sm">
                      <span className="h-6 w-6 rounded-full bg-accent/10 text-accent text-xs font-bold flex items-center justify-center">{i + 1}</span>
                      <span className="flex-1 truncate">{p.name}</span>
                      <span className="text-muted-foreground text-xs">×{p.qty}</span>
                      <span className="font-semibold tabular-nums">{formatPrice(p.revenue)}</span>
                    </div>
                  ))}
                </div>
              )}
            </Panel>

            <Panel title="Orders by status">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={data.byStatus} dataKey="count" nameKey="status" innerRadius={50} outerRadius={80} paddingAngle={2}>
                    {data.byStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center">
                {data.byStatus.map((s, i) => <span key={s.status} className="flex items-center gap-1 text-xs"><span className="h-2 w-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />{s.status} ({s.count})</span>)}
              </div>
            </Panel>

            <Panel title="Revenue by area">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.byArea} layout="vertical" margin={{ left: 10 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="area" fontSize={11} width={80} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(v: number) => formatPrice(v)} />
                  <Bar dataKey="revenue" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Panel>
          </div>
        </>
      )}
    </div>
  );
}
