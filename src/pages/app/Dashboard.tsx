import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MapPin,
  Star,
  Clock,
  Camera,
  Plus,
  ChevronRight,
  LogOut,
  Settings,
  TrendingUp,
  Calendar,
  CheckCircle,
  Bell,
} from "lucide-react";

// ─── Mock data ──────────────────────────────────────────────────────────────

const MOCK_UPCOMING_WALKS = [
  {
    id: "1",
    walkerName: "Emily Carter",
    walkerRating: 4.9,
    walkerReviews: 128,
    date: "Tomorrow",
    time: "9:00 AM",
    duration: "45 min",
    dogName: "Buddy",
    status: "confirmed",
    price: "£18",
  },
  {
    id: "2",
    walkerName: "James Reid",
    walkerRating: 4.8,
    walkerReviews: 74,
    date: "Thursday",
    time: "8:30 AM",
    duration: "30 min",
    dogName: "Buddy",
    status: "confirmed",
    price: "£14",
  },
];

const MOCK_RECENT_WALKS = [
  {
    id: "1",
    walkerName: "Emily Carter",
    date: "Monday",
    duration: "45 min",
    note: "Buddy was fantastic today! We explored the park and he made a new friend. He's exhausted in the best way.",
    rating: 5,
  },
  {
    id: "2",
    walkerName: "James Reid",
    date: "Last Friday",
    duration: "30 min",
    note: "Quick morning walk around the block. Well-behaved as always!",
    rating: 5,
  },
];

const MOCK_SUGGESTED_WALKERS = [
  { id: "1", name: "Emily Carter", rating: 4.9, reviews: 128, price: "£15/walk", distance: "0.3 mi", verified: true },
  { id: "2", name: "James Reid", rating: 4.8, reviews: 74, price: "£14/walk", distance: "0.5 mi", verified: true },
  { id: "3", name: "Sophie Walsh", rating: 5.0, reviews: 41, price: "£16/walk", distance: "0.8 mi", verified: true },
];

const MOCK_WALKER_BOOKINGS = [
  {
    id: "1",
    ownerName: "Sarah T.",
    dogName: "Milo",
    dogBreed: "Golden Retriever",
    dogSize: "Large",
    date: "Tomorrow",
    time: "9:00 AM",
    duration: "45 min",
    price: "£18",
    status: "confirmed",
  },
  {
    id: "2",
    ownerName: "James K.",
    dogName: "Biscuit",
    dogBreed: "French Bulldog",
    dogSize: "Small",
    date: "Tomorrow",
    time: "2:00 PM",
    duration: "30 min",
    price: "£14",
    status: "pending",
  },
  {
    id: "3",
    ownerName: "Emma R.",
    dogName: "Luna",
    dogBreed: "Labrador",
    dogSize: "Large",
    date: "Thursday",
    time: "8:30 AM",
    duration: "30 min",
    price: "£14",
    status: "confirmed",
  },
];

// ─── Shared Nav ─────────────────────────────────────────────────────────────

function AppNav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl">🐾</span>
          <span className="font-bold text-lg text-primary">PawGo</span>
        </Link>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-9 w-9 relative">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 h-9 px-2">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {user?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:block text-sm font-medium max-w-24 truncate">
                  {user?.name}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => { logout(); navigate("/"); }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

// ─── Owner Dashboard ─────────────────────────────────────────────────────────

function OwnerDashboard() {
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0] ?? "there";

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Greeting */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Hey {firstName} 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Buddy is waiting for his next adventure.
          </p>
        </div>
        <Button size="sm" asChild>
          <Link to="/app/find">
            <Plus className="h-4 w-4 mr-1.5" />
            Book a walk
          </Link>
        </Button>
      </div>

      {/* Dog card */}
      <Card className="border-border bg-gradient-to-r from-secondary/60 to-background">
        <CardContent className="flex items-center gap-4 py-4">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl shrink-0">
            🐕
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-foreground text-lg">Buddy</p>
            <p className="text-sm text-muted-foreground">Golden Retriever · 3 years · Large</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {["Friendly", "Energetic", "Loves fetch"].map((t) => (
                <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
              ))}
            </div>
          </div>
          <Button variant="outline" size="sm" className="shrink-0">
            Edit
          </Button>
        </CardContent>
      </Card>

      {/* Upcoming walks */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-foreground">Upcoming walks</h2>
          <Button variant="ghost" size="sm" className="text-primary h-7 px-2 text-xs">
            View all <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
        <div className="space-y-3">
          {MOCK_UPCOMING_WALKS.map((walk) => (
            <Card key={walk.id} className="border-border">
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarFallback className="bg-secondary text-primary font-semibold text-sm">
                        {walk.walkerName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-foreground">{walk.walkerName}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <Star className="h-3 w-3 fill-accent text-accent" />
                        <span>{walk.walkerRating}</span>
                        <span>·</span>
                        <span>{walk.walkerReviews} reviews</span>
                      </div>
                    </div>
                  </div>
                  <Badge
                    className={
                      walk.status === "confirmed"
                        ? "bg-green-100 text-green-700 border-0 shrink-0"
                        : "bg-amber-100 text-amber-700 border-0 shrink-0"
                    }
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {walk.status}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {walk.date} at {walk.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {walk.duration}
                  </span>
                  <span className="font-medium text-foreground ml-auto">{walk.price}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Recent walk reports */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-foreground">Recent walk reports</h2>
        </div>
        <div className="space-y-3">
          {MOCK_RECENT_WALKS.map((walk) => (
            <Card key={walk.id} className="border-border">
              <CardContent className="py-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                    <Camera className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-sm text-foreground">{walk.walkerName}</p>
                      <span className="text-xs text-muted-foreground shrink-0">{walk.date}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      {Array.from({ length: walk.rating }).map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-accent text-accent" />
                      ))}
                      <span className="text-xs text-muted-foreground ml-1">{walk.duration}</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed italic">
                  "{walk.note}"
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Suggested walkers */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-foreground">Walkers near you</h2>
          <Button variant="ghost" size="sm" className="text-primary h-7 px-2 text-xs">
            See all <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          {MOCK_SUGGESTED_WALKERS.map((w) => (
            <Card key={w.id} className="border-border cursor-pointer hover:border-primary/40 transition-colors">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {w.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate">{w.name}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="h-3 w-3 fill-accent text-accent" />
                      <span>{w.rating}</span>
                      <span>({w.reviews})</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />{w.distance}
                  </span>
                  <span className="font-semibold text-foreground">{w.price}</span>
                </div>
                {w.verified && (
                  <Badge className="mt-2 bg-primary/10 text-primary border-0 text-xs w-full justify-center">
                    Verified
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

// ─── Walker Dashboard ─────────────────────────────────────────────────────────

function WalkerDashboard() {
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0] ?? "there";

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Greeting */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Hey {firstName} 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            You have 2 walks scheduled for tomorrow.
          </p>
        </div>
        <Badge className="bg-green-100 text-green-700 border-0 shrink-0 h-7 px-3">
          Available
        </Badge>
      </div>

      {/* Earnings summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "This week", value: "£86", icon: TrendingUp, trend: "+12%" },
          { label: "This month", value: "£342", icon: TrendingUp, trend: "+8%" },
          { label: "Total walks", value: "47", icon: Clock, trend: null },
          { label: "Your rating", value: "4.9 ★", icon: Star, trend: null },
        ].map((stat) => (
          <Card key={stat.label} className="border-border">
            <CardContent className="pt-4 pb-3">
              <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-xl font-bold text-foreground">{stat.value}</p>
              {stat.trend && (
                <p className="text-xs text-green-600 mt-0.5">{stat.trend} vs last week</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Booking requests + upcoming */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-foreground">Bookings</h2>
        </div>
        <div className="space-y-3">
          {MOCK_WALKER_BOOKINGS.map((booking) => (
            <Card key={booking.id} className="border-border">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl shrink-0">
                    🐕
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-sm text-foreground">
                          {booking.dogName}
                          <span className="text-muted-foreground font-normal"> · {booking.dogBreed}</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Owner: {booking.ownerName} · {booking.dogSize}
                        </p>
                      </div>
                      <Badge
                        className={
                          booking.status === "confirmed"
                            ? "bg-green-100 text-green-700 border-0 shrink-0"
                            : "bg-amber-100 text-amber-700 border-0 shrink-0"
                        }
                      >
                        {booking.status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {booking.date} at {booking.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {booking.duration}
                      </span>
                      <span className="font-semibold text-foreground ml-auto">{booking.price}</span>
                    </div>
                    {booking.status === "pending" && (
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" className="h-8 text-xs flex-1">Accept</Button>
                        <Button size="sm" variant="outline" className="h-8 text-xs flex-1">Decline</Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Quick tips */}
      <Card className="border-primary/20 bg-secondary/30">
        <CardHeader className="pb-2 pt-4">
          <CardTitle className="text-sm text-primary">Tips to get more bookings</CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <ul className="space-y-2">
            {[
              "Upload a profile photo — walkers with photos get 3x more bookings",
              "Enable instant booking to appear first in search results",
              "Ask your current clients to leave a review",
            ].map((tip) => (
              <li key={tip} className="flex gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                {tip}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      {user?.role === "walker" ? <WalkerDashboard /> : <OwnerDashboard />}
    </div>
  );
}
