import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  getBookingsByOwner,
  getBookingsByWalker,
  getWalkerOnboarding,
  setWalkerOnboarding,
  isWalkerLive,
  fmt,
  type Booking,
} from "@/utils/booking";
import { getCredits, getFavorites } from "@/utils/retention";
import { getFeeStatus } from "@/utils/serviceFee";
import { getWalkerById } from "@/data/walkers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  Zap,
  User,
  Shield,
  Info,
  ArrowRight,
  Heart,
  Gift,
  MessageCircle,
  LayoutDashboard,
  AlertCircle,
} from "lucide-react";

// ─── Shared Nav ──────────────────────────────────────────────────────────────

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
              <DropdownMenuItem onClick={() => navigate("/admin")}>
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Admin panel
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

// ─── Owner Dashboard ──────────────────────────────────────────────────────────

function OwnerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const firstName = user?.name?.split(" ")[0] ?? "there";
  const bookings = user ? getBookingsByOwner(user.id) : [];
  const upcoming = bookings.filter((b) => b.status === "confirmed");
  const pastWalks = bookings.filter((b) => b.status !== "confirmed" && b.status !== "pending");
  const hasBookings = bookings.length > 0;
  const credits = getCredits();
  const feeStatus = user ? getFeeStatus(user.id, user.signedUpAt) : null;
  const favWalkerIds = getFavorites();
  const favWalkers = favWalkerIds.map((id) => getWalkerById(id)).filter(Boolean) as NonNullable<ReturnType<typeof getWalkerById>>[];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Greeting */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            Hey {firstName} 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {hasBookings
              ? `You have ${upcoming.length} upcoming walk${upcoming.length !== 1 ? "s" : ""}.`
              : "Ready to book your first walk?"}
          </p>
        </div>
        <Button size="sm" onClick={() => navigate("/app/find")}>
          <Plus className="h-4 w-4 mr-1.5" />
          Book a walk
        </Button>
      </div>

      {/* Credits banner */}
      {credits > 0 && (
        <div
          className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 cursor-pointer"
          onClick={() => navigate("/app/find")}
        >
          <Gift className="h-5 w-5 text-green-700 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-green-900">{fmt(credits)} in PawGo credits</p>
            <p className="text-xs text-green-700">Applied automatically on your next booking</p>
          </div>
          <ArrowRight className="h-4 w-4 text-green-700 shrink-0" />
        </div>
      )}

      {/* Service fee status banner */}
      {feeStatus && (
        <div
          className={`flex items-center gap-3 rounded-xl px-4 py-3 ${
            feeStatus.charged
              ? "bg-amber-50 border border-amber-200"
              : "bg-green-50 border border-green-200"
          }`}
        >
          {feeStatus.charged ? (
            <AlertCircle className="h-5 w-5 text-amber-700 shrink-0" />
          ) : (
            <CheckCircle className="h-5 w-5 text-green-700 shrink-0" />
          )}
          <div className="flex-1">
            {feeStatus.charged ? (
              <>
                <p className="text-sm font-semibold text-amber-900">£1.50 service fee applies to your next booking</p>
                <p className="text-xs text-amber-700">Book a walk to become an active member and waive it</p>
              </>
            ) : feeStatus.reason === "active" ? (
              <>
                <p className="text-sm font-semibold text-green-900">No service fee — you're an active member ✓</p>
                <p className="text-xs text-green-700">
                  Book again within {feeStatus.safeDaysLeft} day{feeStatus.safeDaysLeft !== 1 ? "s" : ""} to stay fee-free
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-green-900">No service fee — welcome to PawGo! ✓</p>
                <p className="text-xs text-green-700">
                  {feeStatus.safeDaysLeft} day{feeStatus.safeDaysLeft !== 1 ? "s" : ""} remaining in your free period
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* FTUE — no bookings yet */}
      {!hasBookings && (
        <Card className="border-primary/30 bg-gradient-to-br from-secondary/60 via-background to-background overflow-hidden">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <p className="font-bold text-foreground">Book your first walk in under 60 seconds</p>
            </div>
            <ol className="space-y-2 mb-5 text-sm text-muted-foreground">
              {[
                "Browse verified walkers near you",
                "Pick a date, time and duration",
                "Pay securely — walk confirmed instantly",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="h-5 w-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
            <Button className="w-full sm:w-auto" onClick={() => navigate("/app/find")}>
              Find a walker now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Dog card */}
      <Card className="border-border bg-gradient-to-r from-secondary/60 to-background">
        <CardContent className="flex items-start gap-3 py-4">
          <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl sm:text-3xl shrink-0">
            🐕
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-bold text-foreground text-base sm:text-lg">Buddy</p>
                <p className="text-sm text-muted-foreground">Golden Retriever · 3 years · Large</p>
              </div>
              <Button variant="outline" size="sm" className="shrink-0 h-8 text-xs">
                Edit
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {["Friendly", "Energetic", "Loves fetch"].map((t) => (
                <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming walks — real data or empty state */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-foreground">Upcoming walks</h2>
          {upcoming.length > 0 && (
            <Button variant="ghost" size="sm" className="text-primary h-7 px-2 text-xs">
              View all <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          )}
        </div>
        {upcoming.length === 0 ? (
          <Card className="border-dashed border-border">
            <CardContent className="py-8 text-center">
              <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium text-foreground">No upcoming walks</p>
              <p className="text-xs text-muted-foreground mt-1 mb-4">Book your first walk to get started.</p>
              <Button size="sm" onClick={() => navigate("/app/find")}>Find a walker</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {upcoming.slice(0, 3).map((booking) => (
              <BookingCard key={booking.id} booking={booking} role="owner" />
            ))}
          </div>
        )}
      </section>

      {/* Recent walk reports */}
      {bookings.filter((b) => b.status === "completed").length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-foreground">Recent walk reports</h2>
          </div>
          <div className="space-y-3">
            {bookings.filter((b) => b.status === "completed").slice(0, 2).map((booking) => (
              <Card key={booking.id} className="border-border">
                <CardContent className="py-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                      <Camera className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-sm text-foreground">{booking.walkerName}</p>
                        <span className="text-xs text-muted-foreground shrink-0">{booking.date}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-accent text-accent" />
                        ))}
                        <span className="text-xs text-muted-foreground ml-1">{booking.duration} min</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Past walks — rebooking */}
      {pastWalks.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-foreground">Past walks</h2>
          </div>
          <div className="space-y-3">
            {pastWalks.slice(0, 3).map((booking) => (
              <Card key={booking.id} className="border-border">
                <CardContent className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                        {booking.walkerName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">{booking.walkerName}</p>
                      <p className="text-xs text-muted-foreground">{booking.date} · {booking.duration} min</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs px-3"
                        onClick={() => navigate(`/app/chat/${booking.id}`)}
                      >
                        <MessageCircle className="h-3.5 w-3.5 mr-1" />
                        Chat
                      </Button>
                      <Button
                        size="sm"
                        className="h-8 text-xs px-3"
                        onClick={() => navigate(`/app/book/${booking.walkerId}`)}
                      >
                        Book again
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Favourite walkers */}
      {favWalkers.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Heart className="h-4 w-4 fill-red-500 text-red-500" />
              Favourite walkers
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {favWalkers.map((w) => (
              <Card
                key={w.id}
                className="border-border cursor-pointer hover:border-primary/40 transition-colors"
                onClick={() => navigate(`/app/walker/${w.id}`)}
              >
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                        {w.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">{w.name}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Star className="h-3 w-3 fill-accent text-accent" />
                        <span>{w.rating}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="w-full h-8 text-xs"
                    onClick={(e) => { e.stopPropagation(); navigate(`/app/book/${w.id}`); }}
                  >
                    Book
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Platform disclaimer */}
      <Alert className="border-border bg-muted/30">
        <Info className="h-4 w-4 text-muted-foreground" />
        <AlertDescription className="text-xs text-muted-foreground leading-relaxed pl-1">
          PawGo connects you with independent walkers. Walkers are self-employed contractors — PawGo does not provide walking services or supervise pet care.{" "}
          <Link to="/terms" className="text-primary hover:underline">Learn more</Link>
        </AlertDescription>
      </Alert>

      {/* Walkers near you */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-foreground">Walkers near you</h2>
          <Button variant="ghost" size="sm" className="text-primary h-7 px-2 text-xs" onClick={() => navigate("/app/find")}>
            See all <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { id: "w1", name: "Emily Carter", rating: 4.9, reviews: 128, price: "£15/walk", distance: "0.3 mi", verified: true },
            { id: "w2", name: "James Reid", rating: 4.8, reviews: 74, price: "£14/walk", distance: "0.5 mi", verified: true },
            { id: "w3", name: "Sophie Walsh", rating: 5.0, reviews: 41, price: "£16/walk", distance: "0.8 mi", verified: true },
          ].map((w) => (
            <Card
              key={w.id}
              className="border-border cursor-pointer hover:border-primary/40 transition-colors"
              onClick={() => navigate(`/app/walker/${w.id}`)}
            >
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
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{w.distance}</span>
                  <span className="font-semibold text-foreground">{w.price}</span>
                </div>
                {w.verified && (
                  <Badge className="mt-2 bg-primary/10 text-primary border-0 text-xs w-full justify-center">
                    <Shield className="h-2.5 w-2.5 mr-1" /> Verified
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

// ─── Shared booking card ──────────────────────────────────────────────────────

function BookingCard({ booking, role }: { booking: Booking; role: "owner" | "walker" }) {
  return (
    <Card className="border-border">
      <CardContent className="py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="h-10 w-10 shrink-0">
              <AvatarFallback className="bg-secondary text-primary font-semibold text-sm">
                {role === "owner"
                  ? booking.walkerName.charAt(0)
                  : booking.ownerName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-semibold text-sm text-foreground">
                {role === "owner" ? booking.walkerName : `${booking.ownerName} — ${booking.ownerDog}`}
              </p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                <Star className="h-3 w-3 fill-accent text-accent" />
                <span>4.9 · confirmed</span>
              </div>
            </div>
          </div>
          <Badge className="bg-green-100 text-green-700 border-0 shrink-0 text-xs">
            <CheckCircle className="h-3 w-3 mr-1" />
            {booking.status}
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {booking.date} at {booking.time}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {booking.duration} min
          </span>
          <span className="font-medium text-foreground ml-auto">{fmt(booking.total)}</span>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Walker Dashboard ─────────────────────────────────────────────────────────

function WalkerDashboard() {
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0] ?? "there";
  const [ob, setOb] = useState(getWalkerOnboarding);
  const bookings = user ? getBookingsByWalker(user.id) : [];
  const pendingBookings = bookings.filter((b) => b.status === "pending");
  const confirmedBookings = bookings.filter((b) => b.status === "confirmed");
  const live = isWalkerLive(ob);

  const obSteps = [
    { key: "hasPhoto" as const, label: "Add a profile photo", desc: "Walkers with photos get 3x more bookings", icon: User },
    { key: "hasAvailability" as const, label: "Set your availability", desc: "Tell owners when you can walk", icon: Calendar },
    { key: "hasServiceArea" as const, label: "Set your service area", desc: "Show owners you cover their neighbourhood", icon: MapPin },
  ];
  const completedSteps = obSteps.filter((s) => ob[s.key]).length;
  const obProgress = Math.round((completedSteps / obSteps.length) * 100);

  const handleToggleStep = (key: keyof typeof ob) => {
    const updated = setWalkerOnboarding({ [key]: !ob[key] });
    setOb(updated);
  };

  const totalEarnings = bookings.reduce((sum, b) => sum + b.walkerEarnings, 0);
  const thisMonthEarnings = bookings
    .filter((b) => {
      const d = new Date(b.createdAt);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, b) => sum + b.walkerEarnings, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Greeting + live status */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            Hey {firstName} 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {live
              ? `You have ${confirmedBookings.length} walk${confirmedBookings.length !== 1 ? "s" : ""} scheduled.`
              : "Complete your setup to start receiving booking requests."}
          </p>
        </div>
        <Badge
          className={
            live
              ? "bg-green-100 text-green-700 border-0 shrink-0 h-7 px-3"
              : "bg-amber-100 text-amber-700 border-0 shrink-0 h-7 px-3"
          }
        >
          {live ? "Live" : "Setup incomplete"}
        </Badge>
      </div>

      {/* Onboarding checklist — shown until complete */}
      {!live && (
        <Card className="border-primary/30 bg-secondary/20">
          <CardHeader className="pb-3 pt-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-foreground">Complete your setup</CardTitle>
              <span className="text-xs text-muted-foreground">{completedSteps}/{obSteps.length} done</span>
            </div>
            <Progress value={obProgress} className="h-1.5 mt-2" />
          </CardHeader>
          <CardContent className="pb-4 space-y-3">
            {obSteps.map((s) => (
              <div
                key={s.key}
                className="flex items-start gap-3 cursor-pointer"
                onClick={() => handleToggleStep(s.key)}
              >
                <div
                  className={`h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    ob[s.key]
                      ? "bg-primary border-primary"
                      : "border-border bg-background"
                  }`}
                >
                  {ob[s.key] && <CheckCircle className="h-3.5 w-3.5 text-primary-foreground" />}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${ob[s.key] ? "line-through text-muted-foreground" : "text-foreground"}`}>
                    {s.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{s.desc}</p>
                </div>
              </div>
            ))}
            {live && (
              <div className="pt-2">
                <Button className="w-full h-10">
                  <Zap className="h-4 w-4 mr-2" />
                  Go live — start receiving requests
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* FTUE — no bookings yet */}
      {bookings.length === 0 && live && (
        <Card className="border-dashed border-border">
          <CardContent className="py-8 text-center">
            <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium text-foreground">No requests yet</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
              You'll be notified the moment an owner books you. Make sure your profile photo is up to date.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Earnings summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "This month", value: totalEarnings > 0 ? fmt(thisMonthEarnings) : "—", icon: TrendingUp, trend: totalEarnings > 0 ? null : null },
          { label: "Total earned", value: totalEarnings > 0 ? fmt(totalEarnings) : "—", icon: TrendingUp, trend: null },
          { label: "Total walks", value: String(bookings.length) || "0", icon: Clock, trend: null },
          { label: "Your rating", value: bookings.length > 0 ? "5.0 ★" : "—", icon: Star, trend: null },
        ].map((stat) => (
          <Card key={stat.label} className="border-border">
            <CardContent className="pt-4 pb-3">
              <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-lg sm:text-xl font-bold text-foreground">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Earnings estimate — always shown to motivate */}
      <Card className="border-border bg-gradient-to-r from-secondary/40 to-background">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">Earning potential</p>
              <p className="text-xs text-muted-foreground">
                With just 5 walks/week, walkers in your area earn{" "}
                <span className="font-semibold text-foreground">£250–£400/month</span> — paid directly to you.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Booking requests */}
      {(pendingBookings.length > 0 || confirmedBookings.length > 0) && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-foreground">Your bookings</h2>
          </div>
          <div className="space-y-3">
            {[...pendingBookings, ...confirmedBookings].map((booking) => (
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
                            {booking.ownerDog}
                            <span className="text-muted-foreground font-normal"> · {booking.ownerName}</span>
                          </p>
                        </div>
                        <Badge
                          className={
                            booking.status === "confirmed"
                              ? "bg-green-100 text-green-700 border-0 shrink-0 text-xs"
                              : "bg-amber-100 text-amber-700 border-0 shrink-0 text-xs"
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
                          {booking.duration} min
                        </span>
                        <span className="font-semibold text-foreground ml-auto">
                          {fmt(booking.walkerEarnings)}
                        </span>
                      </div>
                      {booking.status === "pending" && (
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" className="h-10 text-xs flex-1">Accept</Button>
                          <Button size="sm" variant="outline" className="h-10 text-xs flex-1">Decline</Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Repeat clients */}
      {bookings.length > 0 && (() => {
        const ownerCounts: Record<string, { name: string; dog: string; count: number; latestId: string }> = {};
        bookings.forEach((b) => {
          if (!ownerCounts[b.ownerId]) ownerCounts[b.ownerId] = { name: b.ownerName, dog: b.ownerDog, count: 0, latestId: b.id };
          ownerCounts[b.ownerId].count++;
        });
        const repeats = Object.values(ownerCounts).filter((o) => o.count > 1);
        if (repeats.length === 0) return null;
        return (
          <section>
            <h2 className="font-semibold text-foreground mb-3">Repeat clients</h2>
            <div className="space-y-2">
              {repeats.map((o) => (
                <Card key={o.name} className="border-border">
                  <CardContent className="py-3 px-4 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-lg shrink-0">
                      🐕
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground">{o.dog}</p>
                      <p className="text-xs text-muted-foreground">{o.name} · {o.count} walks</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs shrink-0"
                      onClick={() => navigate(`/app/chat/${o.latestId}`)}
                    >
                      <MessageCircle className="h-3.5 w-3.5 mr-1" />
                      Chat
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        );
      })()}

      {/* Tips */}
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

// ─── Main export ──────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      {user?.role === "walker" ? <WalkerDashboard /> : <OwnerDashboard />}
    </div>
  );
}
