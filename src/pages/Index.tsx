import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  MapPin,
  Shield,
  Camera,
  Star,
  Clock,
  CheckCircle,
  ArrowRight,
  Zap,
  Heart,
  Users,
  Menu,
  X,
} from "lucide-react";

export default function Index() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🐾</span>
            <span className="font-bold text-xl text-primary">PawGo</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How it works</a>
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#walkers" className="hover:text-foreground transition-colors">For walkers</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="hidden md:inline-flex" asChild>
              <Link to="/login">Sign in</Link>
            </Button>
            <Button size="sm" className="hidden md:inline-flex" asChild>
              <Link to="/signup">Get started</Link>
            </Button>
            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-9 w-9"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background px-4 pb-4 pt-3 space-y-1">
            <a
              href="#how-it-works"
              className="flex items-center py-3 text-sm text-muted-foreground hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              How it works
            </a>
            <a
              href="#features"
              className="flex items-center py-3 text-sm text-muted-foreground hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </a>
            <a
              href="#walkers"
              className="flex items-center py-3 text-sm text-muted-foreground hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              For walkers
            </a>
            <div className="flex flex-col gap-2 pt-2">
              <Button variant="outline" asChild className="w-full">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>Sign in</Link>
              </Button>
              <Button asChild className="w-full">
                <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>Get started</Link>
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-secondary via-background to-background pt-14 pb-16 sm:pt-20 sm:pb-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="secondary" className="mb-6 text-primary border-primary/20">
            Now available in London & New York
          </Badge>
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-tight mb-6">
            A tired dog is{" "}
            <span className="text-primary">a happy dog.</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-3">
            We make that happen.
          </p>
          <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            Your dog well cared for, even when you don't have time. Verified walkers, live GPS, photo reports — complete peace of mind, every single walk.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-sm sm:text-base px-5 sm:px-8 h-12 w-full sm:w-auto" asChild>
              <Link to="/signup/owner">
                Find a Walker
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-sm sm:text-base px-5 sm:px-8 h-12 w-full sm:w-auto border-primary text-primary hover:bg-secondary" asChild>
              <Link to="/signup/walker">Become a Walker</Link>
            </Button>
          </div>
        </div>

        {/* Decorative paw prints */}
        <div className="absolute top-16 left-8 text-4xl opacity-10 rotate-12 select-none">🐾</div>
        <div className="absolute bottom-16 right-12 text-5xl opacity-10 -rotate-12 select-none">🐾</div>
        <div className="absolute top-32 right-24 text-3xl opacity-10 rotate-45 select-none">🐾</div>
      </section>

      {/* Social proof strip */}
      <section className="bg-primary text-primary-foreground py-6 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
          {[
            { value: "4.9 ★", label: "Average walker rating" },
            { value: "12,000+", label: "Walks completed" },
            { value: "100%", label: "Verified walkers" },
            { value: "< 5 min", label: "Average booking time" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-xl sm:text-2xl font-bold">{stat.value}</p>
              <p className="text-xs sm:text-sm opacity-80 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-14 sm:py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
              Walking your dog has never been easier
            </h2>
            <p className="text-sm sm:text-lg text-muted-foreground max-w-xl mx-auto">
              Three simple steps between you and a happier, calmer dog.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: Heart,
                title: "Create your dog's profile",
                desc: "Add your dog's name, breed, personality, and any special needs. The more we know, the better the match.",
              },
              {
                step: "02",
                icon: MapPin,
                title: "Find a verified walker",
                desc: "Browse background-checked walkers near you. See their ratings, experience, and availability. Book instantly.",
              },
              {
                step: "03",
                icon: Camera,
                title: "Track & receive a report",
                desc: "Watch the walk live on GPS. Get a photo report with notes from your walker the moment it ends.",
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="flex flex-col items-start gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-5xl font-black text-primary/15">{item.step}</span>
                    <div className="p-2.5 rounded-xl bg-secondary text-primary">
                      <item.icon className="h-5 w-5" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features / Why PawGo */}
      <section id="features" className="py-14 sm:py-24 px-4 bg-muted/40">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
              Built for your peace of mind
            </h2>
            <p className="text-sm sm:text-lg text-muted-foreground max-w-xl mx-auto">
              Every feature exists to give you confidence when handing your dog to a walker.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: MapPin,
                title: "Live GPS Tracking",
                desc: "Watch the route in real time on your phone. Know exactly where your dog is, every step of the way.",
                highlight: true,
              },
              {
                icon: Camera,
                title: "Post-Walk Photo Report",
                desc: "Your walker sends a photo and note at the end of every walk. See your happy dog before they're even home.",
                highlight: false,
              },
              {
                icon: Shield,
                title: "Background-Checked Walkers",
                desc: "Every walker completes a DBS (UK) or background check (USA) before their first walk. No exceptions.",
                highlight: false,
              },
              {
                icon: Zap,
                title: "Instant Booking",
                desc: "No waiting for approval. Instant-book verified walkers and get confirmed in seconds.",
                highlight: false,
              },
              {
                icon: Clock,
                title: "Weekly Subscription Plans",
                desc: "Set up recurring weekly walks. Consistent exercise for your dog, automatic scheduling for you.",
                highlight: false,
              },
              {
                icon: Star,
                title: "Verified Reviews",
                desc: "Every review comes from a real completed walk. No fake ratings. Honest community feedback only.",
                highlight: false,
              },
            ].map((feature) => (
              <Card
                key={feature.title}
                className={`border ${feature.highlight ? "border-primary/30 bg-secondary/50" : "border-border bg-card"}`}
              >
                <CardContent className="pt-6 pb-5">
                  <div className="p-2.5 rounded-lg bg-primary/10 w-fit mb-4">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                  {feature.highlight && (
                    <Badge className="mt-3 bg-primary/15 text-primary border-0 hover:bg-primary/20">
                      Most loved feature
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-14 sm:py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
              Dogs and owners love PawGo
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: "The live GPS tracking is a game changer. I can watch Milo's walk from my office and actually focus on work without worrying.",
                name: "Sarah T.",
                location: "Islington, London",
                dog: "Milo, Golden Retriever",
                rating: 5,
              },
              {
                quote: "Got a photo of my dog looking absolutely ecstatic mid-walk. That post-walk report alone is worth every penny.",
                name: "James K.",
                location: "Brooklyn, NYC",
                dog: "Biscuit, French Bulldog",
                rating: 5,
              },
              {
                quote: "I've used Rover before. PawGo is genuinely better. Faster to book, better reports, and the walkers are clearly more vetted.",
                name: "Emma R.",
                location: "Clapham, London",
                dog: "Luna, Labrador",
                rating: 5,
              },
            ].map((t) => (
              <Card key={t.name} className="border-border bg-card">
                <CardContent className="pt-6 pb-5">
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                    ))}
                  </div>
                  <p className="text-foreground text-sm leading-relaxed mb-5">"{t.quote}"</p>
                  <div>
                    <p className="font-semibold text-sm text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.dog} · {t.location}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* For Walkers */}
      <section id="walkers" className="py-14 sm:py-24 px-4 bg-primary text-primary-foreground">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-10 sm:gap-12 items-center">
            <div>
              <Badge className="bg-white/20 text-white border-0 mb-5 sm:mb-6">For dog walkers</Badge>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
                Turn your love of dogs into a flexible income
              </h2>
              <p className="text-primary-foreground/80 text-sm sm:text-lg mb-6 sm:mb-8 leading-relaxed">
                Set your own hours, choose your clients, and earn £15–25/hour in the UK or $20–35/hour in the USA.
                Build a loyal client base that books you week after week.
              </p>
              <ul className="space-y-3 mb-10">
                {[
                  "Free to sign up and create your profile",
                  "Get paid automatically after every walk",
                  "Verified badge builds trust and more bookings",
                  "Walker Pro plan for priority placement",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-primary-foreground/90">
                    <CheckCircle className="h-5 w-5 shrink-0 text-white" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Button size="lg" variant="secondary" className="text-primary font-semibold px-8" asChild>
                <Link to="/signup/walker">
                  Start earning today
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Users, label: "Active walkers", value: "2,400+" },
                { icon: Star, label: "Avg walker rating", value: "4.9 / 5" },
                { icon: Clock, label: "Avg earn/hour", value: "£22 / $28" },
                { icon: Heart, label: "Repeat client rate", value: "78%" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white/10 rounded-2xl p-3 sm:p-5 text-center"
                >
                  <stat.icon className="h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-2 opacity-80" />
                  <p className="text-lg sm:text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs opacity-70 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-14 sm:py-24 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <span className="text-4xl sm:text-5xl mb-5 sm:mb-6 block">🐾</span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to give your dog the walks they deserve?
          </h2>
          <p className="text-sm sm:text-lg text-muted-foreground mb-8 sm:mb-10">
            Join thousands of dog owners who've found their perfect walker.
            Your dog's first walk is just minutes away.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-base px-10 h-12" asChild>
              <Link to="/signup">
                Get started — it's free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-6">
            No credit card required · Cancel anytime · Available in London & New York
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10 px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🐾</span>
            <span className="font-bold text-primary">PawGo</span>
          </div>
          <nav className="flex flex-wrap gap-3 sm:gap-6 text-sm text-muted-foreground justify-center">
            <a href="#" className="hover:text-foreground transition-colors">About</a>
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
            <Link to="/admin" className="hover:text-foreground transition-colors opacity-50 hover:opacity-100">Admin</Link>
          </nav>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">
              © 2026 PawGo. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1 max-w-xs text-center md:text-right">
              PawGo is a connecting platform. Walkers are independent contractors. PawGo is not responsible for pet care or walker conduct.{" "}
              <a href="/terms" className="hover:underline">Terms</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
