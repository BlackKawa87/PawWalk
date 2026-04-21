import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Dog, Footprints } from "lucide-react";

export default function Signup() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <span className="text-3xl">🐾</span>
            <span className="font-bold text-2xl text-primary">PawGo</span>
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Join PawGo</h1>
          <p className="text-muted-foreground mt-2">How would you like to use PawGo?</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <Link to="/signup/owner">
            <Card className="cursor-pointer border-2 border-border hover:border-primary hover:bg-secondary/30 transition-all group h-full">
              <CardContent className="pt-8 pb-7 flex flex-col items-center text-center gap-4">
                <div className="p-4 rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Dog className="h-8 w-8" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground mb-1">I'm a dog owner</h2>
                  <p className="text-sm text-muted-foreground">
                    Find trusted walkers for my dog and book with confidence.
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              </CardContent>
            </Card>
          </Link>

          <Link to="/signup/walker">
            <Card className="cursor-pointer border-2 border-border hover:border-primary hover:bg-secondary/30 transition-all group h-full">
              <CardContent className="pt-8 pb-7 flex flex-col items-center text-center gap-4">
                <div className="p-4 rounded-2xl bg-accent/15 text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                  <Footprints className="h-8 w-8" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground mb-1">I'm a dog walker</h2>
                  <p className="text-sm text-muted-foreground">
                    Earn money doing what I love — walking dogs on my schedule.
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              </CardContent>
            </Card>
          </Link>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
