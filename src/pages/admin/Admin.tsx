import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { fmt, getBookings } from "@/utils/booking";
import type { Booking } from "@/utils/booking";
import { addCredits } from "@/utils/retention";
import { setWalkerOnboarding } from "@/utils/booking";
import { MOCK_WALKERS } from "@/data/walkers";
import {
  getAdminBookings,
  getMockOwners,
  getMockAdminWalkers,
  getLogs,
  getAlerts,
  resolveAlert,
  toggleBlockUser,
  addAdminLog,
  type AdminUser,
  type AdminAlert,
} from "@/utils/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  LayoutDashboard,
  Calendar,
  Users,
  TrendingUp,
  Star,
  FileText,
  LogOut,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Shield,
  ShieldOff,
  Search,
  Bell,
  Activity,
  Banknote,
  BarChart3,
  MapPin,
  FlaskConical,
  Trash2,
  ArrowRight,
  Gift,
  UserCheck,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────

type Section = "dashboard" | "bookings" | "users" | "financials" | "quality" | "logs" | "testlab";

const NAV: { key: Section; label: string; icon: React.ElementType }[] = [
  { key: "dashboard",  label: "Dashboard",  icon: LayoutDashboard },
  { key: "bookings",   label: "Bookings",   icon: Calendar        },
  { key: "users",      label: "Users",      icon: Users           },
  { key: "financials", label: "Financials", icon: TrendingUp      },
  { key: "quality",    label: "Quality",    icon: Star            },
  { key: "logs",       label: "Logs",       icon: FileText        },
  { key: "testlab",    label: "Test Lab",   icon: FlaskConical    },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function logCatCls(cat: string): string {
  const m: Record<string, string> = {
    booking: "bg-primary/10 text-primary",
    payment: "bg-green-100 text-green-700",
    user:    "bg-blue-100 text-blue-700",
    review:  "bg-amber-100 text-amber-700",
    system:  "bg-muted text-muted-foreground",
  };
  return m[cat] ?? "bg-muted text-muted-foreground";
}

function logCatEmoji(cat: string): string {
  const m: Record<string, string> = { booking: "📅", payment: "💳", user: "👤", review: "⭐", system: "⚙️" };
  return m[cat] ?? "•";
}

// ─── Shared components ─────────────────────────────────────────────────────────

function StatCard({
  title, value, sub, icon: Icon, iconCls = "text-primary bg-primary/10",
}: {
  title: string; value: string; sub?: string; icon: React.ElementType; iconCls?: string;
}) {
  return (
    <Card className="border-border">
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground mb-1">{title}</p>
            <p className="text-2xl font-bold text-foreground leading-tight">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </div>
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${iconCls}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cls: Record<string, string> = {
    confirmed: "bg-green-100 text-green-700",
    active:    "bg-green-100 text-green-700",
    pending:   "bg-amber-100 text-amber-700",
    cancelled: "bg-red-100 text-red-700",
    suspended: "bg-red-100 text-red-700",
    refunded:  "bg-orange-100 text-orange-700",
    paid:      "bg-green-100 text-green-700",
  };
  return (
    <Badge className={`${cls[status] ?? "bg-muted text-muted-foreground"} border-0 text-xs capitalize`}>
      {status}
    </Badge>
  );
}

// ─── Dashboard ─────────────────────────────────────────────────────────────────

function DashboardSection() {
  const allBookings = useMemo(() => getAdminBookings(), []);
  const logs        = useMemo(() => getLogs(), []);
  const alerts      = useMemo(() => getAlerts(), []);

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const todayStr = new Date().toISOString().slice(0, 10);

  const paid           = allBookings.filter((b) => b.paymentStatus === "paid");
  const todayBookings  = allBookings.filter((b) => b.createdAt.startsWith(todayStr));
  const weekBookings   = allBookings.filter((b) => b.createdAt >= weekAgo);
  const totalRevenue   = paid.reduce((s, b) => s + b.total, 0);
  const totalFees      = paid.reduce((s, b) => s + b.platformFee, 0);
  const avgTransaction = paid.length > 0 ? totalRevenue / paid.length : 0;
  const cancelRate     = allBookings.length > 0
    ? Math.round((allBookings.filter((b) => b.status === "cancelled").length / allBookings.length) * 100)
    : 0;

  const owners  = getMockOwners();
  const walkers = getMockAdminWalkers();
  const activeUsers     = owners.filter((u) => u.status === "active").length + walkers.filter((u) => u.status === "active").length;
  const unresolvedAlerts = alerts.filter((a) => !a.resolved);
  const criticalCount   = unresolvedAlerts.filter((a) => a.severity === "critical").length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Overview</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Platform health at a glance</p>
      </div>

      {/* Primary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total bookings" value={String(allBookings.length)}
          sub={`${weekBookings.length} this week · ${todayBookings.length} today`}
          icon={Calendar} iconCls="text-primary bg-primary/10"
        />
        <StatCard
          title="Gross revenue" value={fmt(totalRevenue)}
          sub="Lifetime · paid bookings only"
          icon={Banknote} iconCls="text-green-700 bg-green-100"
        />
        <StatCard
          title="Platform earnings" value={fmt(totalFees)}
          sub="20% commission"
          icon={TrendingUp} iconCls="text-accent bg-accent/10"
        />
        <StatCard
          title="Active users" value={String(activeUsers)}
          sub={`${owners.filter((u) => u.status === "active").length} owners · ${walkers.filter((u) => u.status === "active").length} walkers`}
          icon={Users} iconCls="text-blue-700 bg-blue-100"
        />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Ongoing walks" value="3"
          sub="Live right now"
          icon={Activity} iconCls="text-emerald-700 bg-emerald-100"
        />
        <StatCard
          title="Avg transaction" value={fmt(avgTransaction)}
          sub="Per paid booking"
          icon={BarChart3} iconCls="text-violet-700 bg-violet-100"
        />
        <StatCard
          title="Cancellation rate" value={`${cancelRate}%`}
          sub={`${allBookings.filter((b) => b.status === "cancelled").length} cancelled total`}
          icon={XCircle} iconCls="text-red-700 bg-red-100"
        />
        <StatCard
          title="Open alerts" value={String(unresolvedAlerts.length)}
          sub={criticalCount > 0 ? `${criticalCount} critical` : "No critical alerts"}
          icon={Bell} iconCls={unresolvedAlerts.length > 0 ? "text-amber-700 bg-amber-100" : "text-muted-foreground bg-muted"}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent activity */}
        <Card className="border-border">
          <CardHeader className="pb-3 pt-4">
            <CardTitle className="text-sm font-semibold">Recent activity</CardTitle>
          </CardHeader>
          <CardContent className="pb-4 space-y-3">
            {logs.slice(0, 7).map((log) => (
              <div key={log.id} className="flex items-start gap-3">
                <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-medium ${logCatCls(log.category)}`}>
                  {logCatEmoji(log.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground leading-tight">{log.action}</p>
                  <p className="text-xs text-muted-foreground truncate">{log.actorName} · {log.detail}</p>
                </div>
                <p className="text-xs text-muted-foreground shrink-0 tabular-nums">{fmtTime(log.timestamp)}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Open alerts */}
        <Card className="border-border">
          <CardHeader className="pb-3 pt-4">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-semibold">Open alerts</CardTitle>
              {unresolvedAlerts.length > 0 && (
                <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">{unresolvedAlerts.length}</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="pb-4 space-y-3">
            {unresolvedAlerts.length === 0 ? (
              <div className="text-center py-6">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">All clear — no open alerts</p>
              </div>
            ) : (
              unresolvedAlerts.map((alert) => (
                <div key={alert.id} className="flex items-start gap-2.5">
                  <AlertTriangle className={`h-4 w-4 shrink-0 mt-0.5 ${alert.severity === "critical" ? "text-red-500" : "text-amber-500"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{alert.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{alert.detail}</p>
                  </div>
                  <Badge className={`shrink-0 border-0 text-xs ${alert.severity === "critical" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                    {alert.severity}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Bookings ──────────────────────────────────────────────────────────────────

function BookingsSection() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const all = useMemo(() => getAdminBookings(), []);

  const filtered = useMemo(() =>
    all.filter((b) => {
      const matchStatus = statusFilter === "all" || b.status === statusFilter;
      const q = search.toLowerCase();
      const matchSearch = q === "" ||
        b.ownerName.toLowerCase().includes(q) ||
        b.walkerName.toLowerCase().includes(q) ||
        b.id.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    }),
    [all, statusFilter, search]
  );

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground">Bookings</h2>
        <p className="text-sm text-muted-foreground">{filtered.length} of {all.length} bookings</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by owner, walker or booking ID..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border-border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="text-xs font-semibold">ID</TableHead>
                <TableHead className="text-xs font-semibold">Owner</TableHead>
                <TableHead className="text-xs font-semibold">Walker</TableHead>
                <TableHead className="text-xs font-semibold">Date & Time</TableHead>
                <TableHead className="text-xs font-semibold">Duration</TableHead>
                <TableHead className="text-xs font-semibold">Total</TableHead>
                <TableHead className="text-xs font-semibold">Platform</TableHead>
                <TableHead className="text-xs font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-muted-foreground text-sm">
                    No bookings match your filters
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((b) => (
                  <TableRow key={b.id} className="text-sm">
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {b.id.slice(0, 8).toUpperCase()}
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-foreground">{b.ownerName}</p>
                      <p className="text-xs text-muted-foreground">{b.ownerDog}</p>
                    </TableCell>
                    <TableCell className="font-medium">{b.walkerName}</TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap text-xs">
                      {b.date}<br />{b.time}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{b.duration} min</TableCell>
                    <TableCell className="font-semibold">{fmt(b.total)}</TableCell>
                    <TableCell className="text-primary font-medium">{fmt(b.platformFee)}</TableCell>
                    <TableCell><StatusBadge status={b.status} /></TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}

// ─── Users ─────────────────────────────────────────────────────────────────────

function UsersSection() {
  const [owners,  setOwners]  = useState(() => getMockOwners());
  const [walkers, setWalkers] = useState(() => getMockAdminWalkers());
  const [search, setSearch]   = useState("");

  const handleToggle = (userId: string, role: "owner" | "walker") => {
    const willBlock = toggleBlockUser(userId);
    const users = role === "owner" ? owners : walkers;
    const target = users.find((u) => u.id === userId);
    const newStatus = willBlock ? "suspended" : "active";

    if (role === "owner") {
      setOwners((prev) => prev.map((u) => u.id === userId ? { ...u, status: newStatus } : u));
    } else {
      setWalkers((prev) => prev.map((u) => u.id === userId ? { ...u, status: newStatus } : u));
    }
    if (target) {
      addAdminLog({
        category: "user",
        action: willBlock ? "User suspended" : "User reinstated",
        actorName: "Admin",
        detail: `${target.name} · ${role}`,
      });
    }
  };

  const filter = (list: AdminUser[]) =>
    search === ""
      ? list
      : list.filter((u) =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase()) ||
          u.location.toLowerCase().includes(search.toLowerCase())
        );

  const UserTable = ({ list, role }: { list: AdminUser[]; role: "owner" | "walker" }) => (
    <Card className="border-border overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="text-xs font-semibold">User</TableHead>
              <TableHead className="text-xs font-semibold">Location</TableHead>
              <TableHead className="text-xs font-semibold">Joined</TableHead>
              <TableHead className="text-xs font-semibold">Bookings</TableHead>
              {role === "walker" && <TableHead className="text-xs font-semibold">Rating</TableHead>}
              <TableHead className="text-xs font-semibold">Status</TableHead>
              <TableHead className="text-xs font-semibold">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filter(list).map((u) => (
              <TableRow key={u.id} className={`text-sm ${u.status === "suspended" ? "opacity-60" : ""}`}>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <Avatar className="h-7 w-7 shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                        {u.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">{u.name}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 shrink-0" />{u.location}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">{fmtDate(u.joinedAt)}</TableCell>
                <TableCell className="font-medium">{u.bookingCount}</TableCell>
                {role === "walker" && (
                  <TableCell>
                    <span className={`font-semibold text-sm ${
                      (u.rating ?? 5) < 4.7 ? "text-red-600" :
                      (u.rating ?? 5) < 4.8 ? "text-amber-600" :
                      "text-green-700"
                    }`}>
                      {u.rating}★
                    </span>
                  </TableCell>
                )}
                <TableCell><StatusBadge status={u.status} /></TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant={u.status === "active" ? "outline" : "default"}
                    className={`h-7 text-xs px-3 ${u.status === "active" ? "text-destructive border-destructive/30 hover:bg-destructive/10" : ""}`}
                    onClick={() => handleToggle(u.id, role)}
                  >
                    {u.status === "active"
                      ? <><ShieldOff className="h-3 w-3 mr-1" />Suspend</>
                      : <><Shield className="h-3 w-3 mr-1" />Reinstate</>
                    }
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-foreground">Users</h2>
          <p className="text-sm text-muted-foreground">
            {owners.length + walkers.length} total ·{" "}
            {owners.filter((u) => u.status === "active").length + walkers.filter((u) => u.status === "active").length} active
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search users..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <Tabs defaultValue="owners">
        <TabsList>
          <TabsTrigger value="owners">Dog owners ({owners.length})</TabsTrigger>
          <TabsTrigger value="walkers">Walkers ({walkers.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="owners" className="mt-4">
          <UserTable list={owners} role="owner" />
        </TabsContent>
        <TabsContent value="walkers" className="mt-4">
          <UserTable list={walkers} role="walker" />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── Financials ────────────────────────────────────────────────────────────────

function FinancialsSection() {
  const all  = useMemo(() => getAdminBookings(), []);
  const paid = all.filter((b) => b.paymentStatus === "paid");

  const totalVolume    = paid.reduce((s, b) => s + b.total, 0);
  const platformTotal  = paid.reduce((s, b) => s + b.platformFee, 0);
  const walkerTotal    = paid.reduce((s, b) => s + b.walkerEarnings, 0);
  const avgTransaction = paid.length > 0 ? totalVolume / paid.length : 0;

  // Monthly breakdown
  const monthlyMap: Record<string, { volume: number; fees: number; walkerPay: number; count: number }> = {};
  paid.forEach((b) => {
    const m = b.createdAt.slice(0, 7);
    if (!monthlyMap[m]) monthlyMap[m] = { volume: 0, fees: 0, walkerPay: 0, count: 0 };
    monthlyMap[m].volume   += b.total;
    monthlyMap[m].fees     += b.platformFee;
    monthlyMap[m].walkerPay+= b.walkerEarnings;
    monthlyMap[m].count++;
  });
  const monthly = Object.entries(monthlyMap)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([month, d]) => ({ month, ...d }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Financials</h2>
        <p className="text-sm text-muted-foreground">{paid.length} paid transactions</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Gross volume"       value={fmt(totalVolume)}    sub="All paid bookings"   icon={Banknote}  iconCls="text-green-700 bg-green-100"  />
        <StatCard title="Platform commission" value={fmt(platformTotal)}  sub="20% of gross"       icon={TrendingUp} iconCls="text-primary bg-primary/10"   />
        <StatCard title="Walker payouts"     value={fmt(walkerTotal)}    sub="80% of gross"        icon={Users}     iconCls="text-violet-700 bg-violet-100" />
        <StatCard title="Avg transaction"    value={fmt(avgTransaction)} sub="Per paid booking"    icon={BarChart3} iconCls="text-accent bg-accent/10"      />
      </div>

      {/* Monthly breakdown */}
      <Card className="border-border overflow-hidden">
        <CardHeader className="pb-2 pt-4">
          <CardTitle className="text-sm font-semibold">Monthly breakdown</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="text-xs font-semibold">Month</TableHead>
                <TableHead className="text-xs font-semibold">Bookings</TableHead>
                <TableHead className="text-xs font-semibold">Gross volume</TableHead>
                <TableHead className="text-xs font-semibold">Platform fees</TableHead>
                <TableHead className="text-xs font-semibold">Walker payouts</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monthly.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground text-sm">No data</TableCell>
                </TableRow>
              ) : monthly.map(({ month, volume, fees, walkerPay, count }) => (
                <TableRow key={month} className="text-sm">
                  <TableCell className="font-medium">
                    {new Date(month + "-15").toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
                  </TableCell>
                  <TableCell>{count}</TableCell>
                  <TableCell className="font-semibold">{fmt(volume)}</TableCell>
                  <TableCell className="text-primary font-medium">{fmt(fees)}</TableCell>
                  <TableCell className="text-muted-foreground">{fmt(walkerPay)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Recent transactions */}
      <Card className="border-border overflow-hidden">
        <CardHeader className="pb-2 pt-4">
          <CardTitle className="text-sm font-semibold">Recent transactions</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="text-xs font-semibold">Date</TableHead>
                <TableHead className="text-xs font-semibold">Owner</TableHead>
                <TableHead className="text-xs font-semibold">Walker</TableHead>
                <TableHead className="text-xs font-semibold">Total</TableHead>
                <TableHead className="text-xs font-semibold">Platform</TableHead>
                <TableHead className="text-xs font-semibold">Walker</TableHead>
                <TableHead className="text-xs font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paid.slice(0, 12).map((b) => (
                <TableRow key={b.id} className="text-sm">
                  <TableCell className="text-muted-foreground text-xs whitespace-nowrap">{fmtDate(b.createdAt)}</TableCell>
                  <TableCell className="font-medium">{b.ownerName}</TableCell>
                  <TableCell>{b.walkerName}</TableCell>
                  <TableCell className="font-semibold">{fmt(b.total)}</TableCell>
                  <TableCell className="text-primary font-medium">{fmt(b.platformFee)}</TableCell>
                  <TableCell className="text-muted-foreground">{fmt(b.walkerEarnings)}</TableCell>
                  <TableCell><StatusBadge status={b.paymentStatus} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}

// ─── Quality ───────────────────────────────────────────────────────────────────

function QualitySection() {
  const [alerts, setAlerts] = useState(() => getAlerts());
  const walkerStatuses = useMemo(() => {
    const ws = getMockAdminWalkers();
    return Object.fromEntries(ws.map((w) => [w.id, w.status]));
  }, []);

  const handleResolve = (alertId: string) => {
    resolveAlert(alertId);
    setAlerts(getAlerts());
    addAdminLog({ category: "system", action: "Alert resolved", actorName: "Admin", detail: `Alert ID ${alertId}` });
  };

  const alertTypeIcon = (type: AdminAlert["type"]) => {
    if (type === "low_rating")         return <Star className="h-4 w-4" />;
    if (type === "high_cancellations") return <XCircle className="h-4 w-4" />;
    return <MapPin className="h-4 w-4" />;
  };

  const sortedWalkers = [...MOCK_WALKERS].sort((a, b) => a.rating - b.rating);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Quality control</h2>
        <p className="text-sm text-muted-foreground">Walker performance and platform alerts</p>
      </div>

      {/* Walker performance table */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Walker performance</h3>
        <Card className="border-border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="text-xs font-semibold">Walker</TableHead>
                  <TableHead className="text-xs font-semibold">Location</TableHead>
                  <TableHead className="text-xs font-semibold">Rating</TableHead>
                  <TableHead className="text-xs font-semibold">Reviews</TableHead>
                  <TableHead className="text-xs font-semibold">Experience</TableHead>
                  <TableHead className="text-xs font-semibold">Verified</TableHead>
                  <TableHead className="text-xs font-semibold">Status</TableHead>
                  <TableHead className="text-xs font-semibold">Flag</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedWalkers.map((w) => {
                  const flag = w.rating < 4.7 ? "critical" : w.rating < 4.8 ? "watch" : null;
                  return (
                    <TableRow key={w.id} className="text-sm">
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-7 w-7 shrink-0">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                              {w.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <p className="font-medium text-foreground">{w.name}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">{w.location}</TableCell>
                      <TableCell>
                        <span className={`font-bold ${
                          w.rating < 4.7 ? "text-red-600" :
                          w.rating < 4.8 ? "text-amber-600" :
                          "text-green-700"
                        }`}>
                          {w.rating}★
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{w.reviews}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">{w.experience}</TableCell>
                      <TableCell>
                        {w.verified
                          ? <CheckCircle className="h-4 w-4 text-green-600" />
                          : <XCircle className="h-4 w-4 text-muted-foreground" />
                        }
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={walkerStatuses[w.id] ?? "active"} />
                      </TableCell>
                      <TableCell>
                        {flag === "critical" && <Badge className="bg-red-100 text-red-700 border-0 text-xs">Review needed</Badge>}
                        {flag === "watch"    && <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">Watch</Badge>}
                        {!flag              && <Badge className="bg-green-100 text-green-700 border-0 text-xs">Good</Badge>}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {/* Alerts */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">
          Alerts{" "}
          <span className="font-normal text-muted-foreground">
            ({alerts.filter((a) => !a.resolved).length} open · {alerts.filter((a) => a.resolved).length} resolved)
          </span>
        </h3>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <Card
              key={alert.id}
              className={`border ${
                alert.resolved
                  ? "border-border opacity-60"
                  : alert.severity === "critical"
                  ? "border-red-200 bg-red-50/30"
                  : "border-amber-200 bg-amber-50/30"
              }`}
            >
              <CardContent className="py-3 px-4">
                <div className="flex items-start gap-3">
                  <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
                    alert.resolved
                      ? "bg-muted text-muted-foreground"
                      : alert.severity === "critical"
                      ? "bg-red-100 text-red-600"
                      : "bg-amber-100 text-amber-600"
                  }`}>
                    {alertTypeIcon(alert.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <p className="font-semibold text-sm text-foreground">{alert.title}</p>
                      {!alert.resolved && (
                        <Badge className={`border-0 text-xs ${
                          alert.severity === "critical" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                        }`}>
                          {alert.severity}
                        </Badge>
                      )}
                      {alert.resolved && (
                        <Badge className="bg-muted text-muted-foreground border-0 text-xs">resolved</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{alert.detail}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{fmtDateTime(alert.triggeredAt)}</p>
                  </div>
                  {!alert.resolved && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs shrink-0"
                      onClick={() => handleResolve(alert.id)}
                    >
                      <CheckCircle className="h-3.5 w-3.5 mr-1" />
                      Resolve
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Logs ──────────────────────────────────────────────────────────────────────

function LogsSection() {
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [search, setSearch] = useState("");
  const logs = useMemo(() => getLogs(), []);

  const filtered = useMemo(() =>
    logs.filter((l) => {
      const matchCat = categoryFilter === "all" || l.category === categoryFilter;
      const q = search.toLowerCase();
      const matchSearch = q === "" ||
        l.action.toLowerCase().includes(q) ||
        l.actorName.toLowerCase().includes(q) ||
        l.detail.toLowerCase().includes(q);
      return matchCat && matchSearch;
    }),
    [logs, categoryFilter, search]
  );

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground">Activity logs</h2>
        <p className="text-sm text-muted-foreground">{filtered.length} of {logs.length} entries</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search logs..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            <SelectItem value="booking">Booking</SelectItem>
            <SelectItem value="payment">Payment</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="review">Review</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border-border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="text-xs font-semibold">Timestamp</TableHead>
                <TableHead className="text-xs font-semibold">Category</TableHead>
                <TableHead className="text-xs font-semibold">Action</TableHead>
                <TableHead className="text-xs font-semibold">Actor</TableHead>
                <TableHead className="text-xs font-semibold">Detail</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground text-sm">
                    No log entries match your filters
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((log) => (
                  <TableRow key={log.id} className="text-sm">
                    <TableCell className="text-muted-foreground text-xs whitespace-nowrap tabular-nums">
                      {fmtDateTime(log.timestamp)}
                    </TableCell>
                    <TableCell>
                      <Badge className={`border-0 text-xs ${logCatCls(log.category)}`}>
                        {log.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{log.action}</TableCell>
                    <TableCell className="text-muted-foreground">{log.actorName}</TableCell>
                    <TableCell className="text-muted-foreground text-xs max-w-xs truncate">{log.detail}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}

// ─── Test Lab ──────────────────────────────────────────────────────────────────

const PAWGO_KEYS = [
  "pawgo_user", "pawgo_bookings", "pawgo_messages",
  "pawgo_favs", "pawgo_credits", "pawgo_walker_ob",
  "pawgo_admin_logs", "pawgo_blocked_users", "pawgo_resolved_alerts",
];

function daysAgo(n: number) {
  return new Date(Date.now() - n * 86_400_000).toISOString();
}

function injectOwnerBooking(ownerId: string, ownerName: string, daysSince: number, status: "confirmed" | "completed") {
  const createdAt = daysAgo(daysSince);
  const walkDate = new Date(Date.now() - (daysSince - 1) * 86_400_000).toISOString().split("T")[0];
  const booking: Booking = {
    id: `testbk-${ownerId}-${daysSince}`,
    ownerId,
    ownerName,
    ownerDog: "Buddy",
    walkerId: "w1",
    walkerName: "Emily Carter",
    date: walkDate,
    time: "10:00 AM",
    duration: 30,
    pricePerWalk: 15,
    total: 15,
    platformFee: 3,
    walkerEarnings: 12,
    serviceFee: 0,
    creditsUsed: 0,
    currency: "GBP",
    status,
    paymentStatus: "paid",
    createdAt,
  };
  const existing = getBookings().filter((b) => !b.id.startsWith(`testbk-${ownerId}`));
  localStorage.setItem("pawgo_bookings", JSON.stringify([...existing, booking]));
}

const SCENARIOS = [
  {
    id: "fresh-owner",
    emoji: "🆕",
    title: "Fresh owner",
    subtitle: "New account, 0 bookings",
    what: "Fee: Welcome free period banner · FTUE empty state · Book first walk CTA",
    color: "border-blue-200 bg-blue-50/50",
    badgeCls: "bg-blue-100 text-blue-700",
    badgeLabel: "New user",
    setup: (loginAs: (u: Parameters<ReturnType<typeof useAuth>["loginAs"]>[0]) => void) => {
      const user = {
        id: "test-owner-fresh",
        name: "Sarah Demo",
        email: "sarah.new@test.com",
        role: "owner" as const,
        location: "London, UK",
        signedUpAt: new Date().toISOString(),
      };
      loginAs(user);
    },
  },
  {
    id: "active-owner",
    emoji: "✅",
    title: "Active owner",
    subtitle: "90-day account · last booking 5 days ago",
    what: "Fee: Waived (active member) · green banner · credits toggle in booking",
    color: "border-green-200 bg-green-50/50",
    badgeCls: "bg-green-100 text-green-700",
    badgeLabel: "No fee",
    setup: (loginAs: (u: Parameters<ReturnType<typeof useAuth>["loginAs"]>[0]) => void) => {
      const user = {
        id: "test-owner-active",
        name: "James Demo",
        email: "james.active@test.com",
        role: "owner" as const,
        location: "London, UK",
        signedUpAt: daysAgo(90),
      };
      injectOwnerBooking(user.id, user.name, 5, "confirmed");
      loginAs(user);
    },
  },
  {
    id: "inactive-owner",
    emoji: "⚠️",
    title: "Inactive owner",
    subtitle: "90-day account · last booking 20 days ago",
    what: "Fee: £1.50 charged · amber dashboard banner · fee line in Confirm step",
    color: "border-amber-200 bg-amber-50/50",
    badgeCls: "bg-amber-100 text-amber-700",
    badgeLabel: "£1.50 fee",
    setup: (loginAs: (u: Parameters<ReturnType<typeof useAuth>["loginAs"]>[0]) => void) => {
      const user = {
        id: "test-owner-inactive",
        name: "Alex Demo",
        email: "alex.inactive@test.com",
        role: "owner" as const,
        location: "London, UK",
        signedUpAt: daysAgo(90),
      };
      injectOwnerBooking(user.id, user.name, 20, "completed");
      loginAs(user);
    },
  },
  {
    id: "owner-credits",
    emoji: "🎁",
    title: "Owner with credits",
    subtitle: "Active owner + £5 PawGo credits",
    what: "Credits banner on dashboard · credits toggle in Confirm step · apply & see discount",
    color: "border-green-200 bg-green-50/50",
    badgeCls: "bg-green-100 text-green-700",
    badgeLabel: "£5 credit",
    setup: (loginAs: (u: Parameters<ReturnType<typeof useAuth>["loginAs"]>[0]) => void) => {
      const user = {
        id: "test-owner-credits",
        name: "Priya Demo",
        email: "priya.credits@test.com",
        role: "owner" as const,
        location: "London, UK",
        signedUpAt: daysAgo(5),
      };
      localStorage.setItem("pawgo_credits", "5");
      loginAs(user);
    },
  },
  {
    id: "walker-live",
    emoji: "🚶",
    title: "Walker (live)",
    subtitle: "Verified walker, onboarding complete",
    what: "Walker dashboard · earnings · onboarding checklist complete · Live badge",
    color: "border-primary/20 bg-secondary/30",
    badgeCls: "bg-primary/10 text-primary",
    badgeLabel: "Walker",
    setup: (loginAs: (u: Parameters<ReturnType<typeof useAuth>["loginAs"]>[0]) => void) => {
      const user = {
        id: "test-walker-live",
        name: "Tom Demo",
        email: "tom.walker@test.com",
        role: "walker" as const,
        location: "London, UK",
        signedUpAt: daysAgo(30),
      };
      setWalkerOnboarding({ hasPhoto: true, hasAvailability: true, hasServiceArea: true });
      loginAs(user);
    },
  },
];

function TestLabSection() {
  const { loginAs } = useAuth();
  const navigate = useNavigate();
  const [cleared, setCleared] = useState(false);
  const [launched, setLaunched] = useState<string | null>(null);

  const handleScenario = (scenario: typeof SCENARIOS[number]) => {
    scenario.setup(loginAs);
    setLaunched(scenario.id);
    setTimeout(() => navigate("/app/dashboard"), 150);
  };

  const handleClearAll = () => {
    PAWGO_KEYS.forEach((k) => localStorage.removeItem(k));
    // also clear rewarded keys
    Object.keys(localStorage)
      .filter((k) => k.startsWith("pawgo_rewarded_"))
      .forEach((k) => localStorage.removeItem(k));
    setCleared(true);
    setTimeout(() => setCleared(false), 2500);
  };

  const allBookings = getBookings();
  const credits = Number(localStorage.getItem("pawgo_credits") ?? 0);
  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem("pawgo_user") ?? "null"); } catch { return null; }
  })();

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-primary" />
            Test Lab
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            One-click scenarios to test the full booking flow end-to-end.
            Each preset sets up a user + data state and opens the app.
          </p>
        </div>
      </div>

      {/* Scenario presets */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Scenario presets</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SCENARIOS.map((s) => (
            <Card
              key={s.id}
              className={`border cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 ${s.color} ${launched === s.id ? "ring-2 ring-primary" : ""}`}
              onClick={() => handleScenario(s)}
            >
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{s.emoji}</span>
                    <div>
                      <p className="font-semibold text-sm text-foreground leading-tight">{s.title}</p>
                      <p className="text-xs text-muted-foreground">{s.subtitle}</p>
                    </div>
                  </div>
                  <Badge className={`${s.badgeCls} border-0 text-xs shrink-0`}>{s.badgeLabel}</Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">{s.what}</p>
                <Button size="sm" className="w-full h-8 text-xs gap-1.5">
                  Launch scenario
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Flow guide */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Flow checklist</h3>
        <Card className="border-border">
          <CardContent className="pt-4 pb-4">
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2">
              {[
                ["Owner booking flow", "Find walker → Book → Confirm (check fee line) → Pay → Download invoice"],
                ["Service fee — waived", "Use Active Owner scenario → Confirm step shows 'Free ✓'"],
                ["Service fee — charged", "Use Inactive Owner scenario → Confirm step shows '£1.50'"],
                ["Credits flow", "Use Owner + Credits → Confirm step shows toggle → apply discount"],
                ["First booking reward", "Use Fresh Owner → complete a booking → see 🎉 banner + £5 credit"],
                ["Invoice download", "Complete any booking → click 'Download invoice' in Done step"],
                ["Walker dashboard", "Use Walker (live) scenario → check stats, onboarding complete"],
                ["Chat flow", "Complete a booking → click 'Message walker' → send a message"],
              ].map(([title, steps]) => (
                <div key={title} className="flex gap-2.5 py-1.5">
                  <UserCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{title}</p>
                    <p className="text-xs text-muted-foreground">{steps}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current session state */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Current session state</h3>
        <Card className="border-border">
          <CardContent className="pt-4 pb-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Logged in as", value: currentUser ? `${currentUser.name} (${currentUser.role})` : "—" },
                { label: "Account age", value: currentUser?.signedUpAt ? `${Math.floor((Date.now() - new Date(currentUser.signedUpAt).getTime()) / 86400000)} days` : "—" },
                { label: "Bookings stored", value: String(allBookings.length) },
                { label: "Credits balance", value: credits > 0 ? fmt(credits) : "£0.00" },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-xs text-muted-foreground mb-0.5">{item.label}</p>
                  <p className="text-sm font-semibold text-foreground truncate">{item.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data controls */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Data controls</h3>
        <Card className="border-red-200 bg-red-50/30">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="text-sm font-semibold text-foreground">Clear all platform data</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Wipes all <code className="text-xs bg-muted px-1 rounded">pawgo_*</code> localStorage keys —
                  bookings, messages, credits, favs, logs, user session.
                </p>
              </div>
              <Button
                size="sm"
                variant="destructive"
                className="h-9 gap-2 shrink-0"
                onClick={handleClearAll}
              >
                <Trash2 className="h-4 w-4" />
                {cleared ? "Cleared ✓" : "Clear all data"}
              </Button>
            </div>
            <Separator className="my-3" />
            <div className="flex flex-wrap gap-2">
              <p className="text-xs text-muted-foreground w-full">Quick credit injection (for current user):</p>
              {[5, 10, 20].map((amount) => (
                <Button
                  key={amount}
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs gap-1.5"
                  onClick={() => { addCredits(amount); setCleared(false); }}
                >
                  <Gift className="h-3.5 w-3.5" />
                  +£{amount} credits
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Main export ───────────────────────────────────────────────────────────────

export default function Admin() {
  const { user, logout, loginAs } = useAuth();
  const navigate = useNavigate();
  const [section, setSection] = useState<Section>("dashboard");

  // Unauthorised state — show inline demo login
  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="max-w-sm w-full">
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Shield className="h-7 w-7 text-primary" />
            </div>
            <div>
              <p className="font-bold text-foreground text-lg">Admin access required</p>
              <p className="text-sm text-muted-foreground mt-1">
                You need an admin account to view this area.
              </p>
            </div>
            <Separator />
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Demo access</p>
              <Button
                className="w-full"
                onClick={() =>
                  loginAs({
                    id: "admin-01",
                    name: "Admin",
                    email: "admin@pawgo.com",
                    role: "admin",
                    location: "London, UK",
                  })
                }
              >
                <Shield className="mr-2 h-4 w-4" />
                Enter as admin
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate("/")}>
                Back to home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-13 py-2.5">
          <div className="flex items-center gap-2.5">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-lg">🐾</span>
              <span className="font-bold text-primary">PawGo</span>
            </Link>
            <Badge className="bg-primary text-primary-foreground border-0 text-xs">Admin</Badge>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground hidden sm:block mr-2">{user.email}</span>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-8 text-muted-foreground gap-1.5"
              onClick={() => navigate("/app/dashboard")}
            >
              App
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-8 text-muted-foreground gap-1.5"
              onClick={() => { logout(); navigate("/"); }}
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </Button>
          </div>
        </div>

        {/* Tab nav */}
        <div className="border-t border-border overflow-x-auto scrollbar-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex">
            {NAV.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setSection(key)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  section === key
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {section === "dashboard"  && <DashboardSection />}
        {section === "bookings"   && <BookingsSection />}
        {section === "users"      && <UsersSection />}
        {section === "financials" && <FinancialsSection />}
        {section === "quality"    && <QualitySection />}
        {section === "logs"       && <LogsSection />}
        {section === "testlab"    && <TestLabSection />}
      </main>
    </div>
  );
}
