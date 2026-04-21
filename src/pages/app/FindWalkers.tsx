import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { MOCK_WALKERS } from "@/data/walkers";
import { isFavorite, toggleFavorite } from "@/utils/retention";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  Star,
  Search,
  Shield,
  LogOut,
  Settings,
  Bell,
  SlidersHorizontal,
  ArrowLeft,
  Heart,
} from "lucide-react";

export default function FindWalkers() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("rating");
  const [maxPrice, setMaxPrice] = useState("any");
  const [favs, setFavs] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(MOCK_WALKERS.map((w) => [w.id, isFavorite(w.id)]))
  );

  const handleToggleFav = (e: React.MouseEvent, walkerId: string) => {
    e.stopPropagation();
    const nowFav = toggleFavorite(walkerId);
    setFavs((prev) => ({ ...prev, [walkerId]: nowFav }));
  };

  const filtered = MOCK_WALKERS
    .filter((w) => {
      const matchSearch =
        search === "" ||
        w.name.toLowerCase().includes(search.toLowerCase()) ||
        w.location.toLowerCase().includes(search.toLowerCase()) ||
        w.specialties.some((s) => s.toLowerCase().includes(search.toLowerCase()));
      const matchPrice =
        maxPrice === "any" ? true : w.pricePerWalk <= parseInt(maxPrice);
      return matchSearch && matchPrice;
    })
    .sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "price_asc") return a.pricePerWalk - b.pricePerWalk;
      if (sortBy === "price_desc") return b.pricePerWalk - a.pricePerWalk;
      if (sortBy === "distance") return parseFloat(a.distance) - parseFloat(b.distance);
      return 0;
    });

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate("/app/dashboard")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Link to="/" className="flex items-center gap-2">
              <span className="text-xl">🐾</span>
              <span className="font-bold text-lg text-primary">PawGo</span>
            </Link>
          </div>
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
                <DropdownMenuItem className="text-destructive" onClick={() => { logout(); navigate("/"); }}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Find a walker</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filtered.length} verified walkers near you
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, location, or specialty..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={maxPrice} onValueChange={setMaxPrice}>
              <SelectTrigger className="w-36">
                <SlidersHorizontal className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Max price" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any price</SelectItem>
                <SelectItem value="12">Up to £12</SelectItem>
                <SelectItem value="15">Up to £15</SelectItem>
                <SelectItem value="18">Up to £18</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Top rated</SelectItem>
                <SelectItem value="price_asc">Price: low–high</SelectItem>
                <SelectItem value="price_desc">Price: high–low</SelectItem>
                <SelectItem value="distance">Nearest first</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Contact control banner */}
        <div className="flex items-start gap-2.5 bg-secondary/50 border border-border rounded-lg px-4 py-3 mb-6 text-xs text-muted-foreground">
          <Shield className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <p>
            For your safety, contact details are only shared after booking. Keep all communication within PawGo.
          </p>
        </div>

        {/* Walker grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-4">🔍</p>
            <p className="font-semibold text-foreground">No walkers found</p>
            <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((walker) => (
              <Card
                key={walker.id}
                className="border-border hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer"
                onClick={() => navigate(`/app/walker/${walker.id}`)}
              >
                <CardContent className="pt-5 pb-4">
                  {/* Walker header */}
                  <div className="flex items-start gap-3 mb-4">
                    <Avatar className="h-12 w-12 shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-base">
                        {walker.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="font-semibold text-sm text-foreground">{walker.name}</p>
                        {walker.verified && (
                          <Badge className="bg-primary/10 text-primary border-0 text-xs px-1.5 py-0 h-5">
                            <Shield className="h-2.5 w-2.5 mr-0.5" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <Star className="h-3 w-3 fill-accent text-accent" />
                        <span className="font-medium text-foreground">{walker.rating}</span>
                        <span>({walker.reviews} reviews)</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => handleToggleFav(e, walker.id)}
                      className="shrink-0 p-1 -mt-0.5 -mr-1 rounded-full hover:bg-muted transition-colors"
                      aria-label={favs[walker.id] ? "Remove from favourites" : "Add to favourites"}
                    >
                      <Heart className={`h-4 w-4 transition-colors ${favs[walker.id] ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
                    </button>
                  </div>

                  {/* Bio */}
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4 line-clamp-2">
                    {walker.bio}
                  </p>

                  {/* Specialties */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {walker.specialties.slice(0, 2).map((s) => (
                      <Badge key={s} variant="secondary" className="text-xs px-2 py-0.5">
                        {s}
                      </Badge>
                    ))}
                    {walker.specialties.length > 2 && (
                      <Badge variant="secondary" className="text-xs px-2 py-0.5">
                        +{walker.specialties.length - 2}
                      </Badge>
                    )}
                  </div>

                  {/* Footer: price + distance + CTA */}
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div>
                      <p className="font-bold text-foreground text-base">
                        £{walker.pricePerWalk}
                        <span className="text-xs font-normal text-muted-foreground">/30 min</span>
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3" />
                        {walker.distance} · {walker.experience}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className="h-9"
                      onClick={(e) => { e.stopPropagation(); navigate(`/app/book/${walker.id}`); }}
                    >
                      Book now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground text-center mt-10">
          Walkers are independent contractors. PawGo connects you but does not supervise or guarantee services.{" "}
          <Link to="/terms" className="hover:underline text-primary/70">Terms</Link>
        </p>
      </main>
    </div>
  );
}
