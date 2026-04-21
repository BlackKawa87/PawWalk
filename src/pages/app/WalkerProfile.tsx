import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getWalkerById } from "@/data/walkers";
import { getBookingsByOwner } from "@/utils/booking";
import { isFavorite, toggleFavorite } from "@/utils/retention";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Star,
  MapPin,
  Shield,
  Heart,
  Clock,
  MessageCircle,
  Calendar,
  CheckCircle,
  Lock,
} from "lucide-react";

const MOCK_REVIEWS = [
  { name: "Sarah T.", dog: "Milo, Golden Retriever", rating: 5, date: "2 weeks ago", text: "Absolutely fantastic. Milo came back exhausted and happy. Got a photo update mid-walk." },
  { name: "James K.", dog: "Biscuit, French Bulldog", rating: 5, date: "1 month ago", text: "Punctual, caring, and clearly loves dogs. Will definitely rebook." },
  { name: "Emma R.", dog: "Luna, Labrador", rating: 5, date: "1 month ago", text: "Luna can be nervous with strangers but took to them immediately. Really impressed." },
];

export default function WalkerProfile() {
  const { walkerId } = useParams<{ walkerId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const walker = getWalkerById(walkerId ?? "");
  const [fav, setFav] = useState(() => isFavorite(walkerId ?? ""));

  if (!walker) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-4xl mb-4">🐾</p>
          <p className="font-semibold">Walker not found</p>
          <Button className="mt-4" onClick={() => navigate("/app/find")}>Browse walkers</Button>
        </div>
      </div>
    );
  }

  const pastBookings = user
    ? getBookingsByOwner(user.id).filter((b) => b.walkerId === walker.id)
    : [];
  const hasBooked = pastBookings.length > 0;
  const latestBooking = pastBookings[0];

  const handleToggleFav = () => {
    const nowFav = toggleFavorite(walker.id);
    setFav(nowFav);
  };

  const handleRebook = () => {
    if (!latestBooking) {
      navigate(`/app/book/${walker.id}`);
      return;
    }
    const params = new URLSearchParams({
      rebook: "true",
      time: latestBooking.time,
      duration: String(latestBooking.duration),
    });
    navigate(`/app/book/${walker.id}?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-2xl mx-auto px-4 flex items-center justify-between h-14">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Link to="/" className="flex items-center gap-2">
            <span className="text-lg">🐾</span>
            <span className="font-bold text-primary">PawGo</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={handleToggleFav}
            aria-label={fav ? "Remove from favourites" : "Add to favourites"}
          >
            <Heart className={`h-5 w-5 transition-colors ${fav ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
          </Button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Profile hero */}
        <div className="flex items-start gap-4">
          <Avatar className="h-20 w-20 shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary text-3xl font-bold">
              {walker.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-foreground">{walker.name}</h1>
              {walker.verified && (
                <Badge className="bg-primary/10 text-primary border-0 text-xs">
                  <Shield className="h-3 w-3 mr-1" />Verified
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />{walker.location} · {walker.distance}
            </p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <div className="flex items-center gap-1 text-sm">
                <Star className="h-4 w-4 fill-accent text-accent" />
                <span className="font-semibold text-foreground">{walker.rating}</span>
                <span className="text-muted-foreground">({walker.reviews} reviews)</span>
              </div>
              <span className="text-muted-foreground">·</span>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />{walker.experience} experience
              </span>
            </div>
          </div>
        </div>

        {/* Repeat client badge */}
        {hasBooked && (
          <Card className="border-primary/30 bg-secondary/30">
            <CardContent className="py-3 px-4 flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-primary shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">
                  You've walked with {walker.name} {pastBookings.length} time{pastBookings.length > 1 ? "s" : ""}
                </p>
                <p className="text-xs text-muted-foreground">Last walk: {latestBooking?.date} at {latestBooking?.time}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Primary CTAs — booking-first */}
        <div className="flex flex-col sm:flex-row gap-3">
          {hasBooked ? (
            <>
              <Button className="flex-1 h-11" onClick={handleRebook}>
                Book again
                <Calendar className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="flex-1 h-11"
                onClick={() => navigate(`/app/chat/${latestBooking.id}`)}
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Message
              </Button>
            </>
          ) : (
            <>
              <Button className="flex-1 h-11" onClick={() => navigate(`/app/book/${walker.id}`)}>
                Book {walker.name}
                <Calendar className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" className="flex-1 h-11" disabled title="Book first to unlock chat">
                <Lock className="mr-2 h-4 w-4" />
                Message
              </Button>
            </>
          )}
        </div>

        {/* Contact control notice */}
        {!hasBooked && (
          <p className="text-xs text-muted-foreground text-center bg-muted/40 rounded-lg py-2 px-3">
            Messaging unlocks after booking. For your safety, keep all communication within PawGo.
          </p>
        )}

        {/* Pricing */}
        <Card className="border-border">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">£{walker.pricePerWalk} <span className="text-sm font-normal text-muted-foreground">/ 30 min walk</span></p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  45 min · £{Math.round(walker.pricePerWalk * 1.4)} · 60 min · £{Math.round(walker.pricePerWalk * 1.8)}
                </p>
              </div>
              <Badge variant="secondary" className="text-xs">{walker.experience}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Bio */}
        <section>
          <h2 className="font-semibold text-foreground mb-2">About</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{walker.bio}</p>
        </section>

        <Separator />

        {/* Specialties */}
        <section>
          <h2 className="font-semibold text-foreground mb-3">Specialties</h2>
          <div className="flex flex-wrap gap-2">
            {walker.specialties.map((s) => (
              <Badge key={s} variant="secondary" className="text-sm px-3 py-1">{s}</Badge>
            ))}
          </div>
        </section>

        {/* Dog sizes */}
        <section>
          <h2 className="font-semibold text-foreground mb-3">Comfortable with</h2>
          <div className="flex flex-wrap gap-2">
            {walker.dogSizes.map((s) => (
              <Badge key={s} variant="outline" className="text-sm px-3 py-1">{s} dogs</Badge>
            ))}
          </div>
        </section>

        {/* Availability */}
        <section>
          <h2 className="font-semibold text-foreground mb-3">Availability</h2>
          <div className="flex flex-wrap gap-2">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <div
                key={day}
                className={`px-3 py-1.5 rounded-lg text-sm border ${
                  walker.availability.includes(day)
                    ? "bg-primary/10 border-primary/30 text-primary font-medium"
                    : "bg-muted/30 border-border text-muted-foreground"
                }`}
              >
                {day}
              </div>
            ))}
          </div>
        </section>

        <Separator />

        {/* Reviews */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">
              Reviews <span className="text-muted-foreground font-normal">({walker.reviews})</span>
            </h2>
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 fill-accent text-accent" />
              <span className="font-semibold">{walker.rating}</span>
            </div>
          </div>
          <div className="space-y-4">
            {MOCK_REVIEWS.slice(0, walker.reviews > 3 ? 3 : walker.reviews).map((review) => (
              <div key={review.name} className="space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-sm text-foreground">{review.name}</p>
                    <p className="text-xs text-muted-foreground">{review.dog}</p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{review.date}</span>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{review.text}</p>
                {review.name !== MOCK_REVIEWS[MOCK_REVIEWS.length - 1].name && (
                  <Separator className="mt-3" />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <div className="pb-4">
          <Button
            className="w-full h-12 text-base"
            onClick={hasBooked ? handleRebook : () => navigate(`/app/book/${walker.id}`)}
          >
            {hasBooked ? "Book again" : `Book ${walker.name}`}
            <Calendar className="ml-2 h-4 w-4" />
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-3">
            {walker.name} is an independent contractor.{" "}
            <Link to="/terms" className="text-primary hover:underline">PawGo terms apply.</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
