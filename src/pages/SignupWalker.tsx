import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "@/contexts/AuthContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, ArrowRight, CheckCircle, Shield, Info } from "lucide-react";

const accountSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  location: z.string().min(3, "Please enter your city or postcode"),
  phone: z.string().min(7, "Please enter a valid phone number"),
});

const profileSchema = z.object({
  bio: z.string().min(50, "Bio must be at least 50 characters").max(500, "Bio must be under 500 characters"),
  experience: z.string().min(1, "Please describe your experience"),
  pricePerWalk: z.string().min(1, "Please set a price per walk"),
  independentContractor: z.boolean().refine((v) => v === true, "You must confirm your independent contractor status"),
  agreedToTerms: z.boolean().refine((v) => v === true, "You must agree to the terms"),
});

type AccountData = z.infer<typeof accountSchema>;
type ProfileData = z.infer<typeof profileSchema>;

const DOG_SIZES_COMFORTABLE = ["Small (under 10kg)", "Medium (10–25kg)", "Large (25–40kg)", "Extra large (40kg+)"];
const steps = ["Your account", "Your profile", "Verification", "Done"];

export default function SignupWalker() {
  const [step, setStep] = useState(0);
  const [accountData, setAccountData] = useState<AccountData | null>(null);
  const [comfortableSizes, setComfortableSizes] = useState<string[]>([]);
  const navigate = useNavigate();
  const { loginAs } = useAuth();

  const accountForm = useForm<AccountData>({ resolver: zodResolver(accountSchema) });
  const profileForm = useForm<ProfileData>({ resolver: zodResolver(profileSchema) });

  const onAccountSubmit = (data: AccountData) => {
    setAccountData(data);
    setStep(1);
  };

  const onProfileSubmit = (data: ProfileData) => {
    if (!accountData) return;
    loginAs({
      id: crypto.randomUUID(),
      name: accountData.name,
      email: accountData.email,
      role: "walker",
      location: accountData.location,
    });
    console.log({ ...accountData, ...data, comfortableSizes });
    setStep(2);
  };

  const toggleSize = (size: string) => {
    setComfortableSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link to="/signup">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🐾</span>
            <span className="font-bold text-xl text-primary">PawGo</span>
          </Link>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-1">
          {steps.map((label, i) => (
            <div key={label} className="flex items-center gap-1 shrink-0">
              <div
                className={`flex items-center justify-center h-7 w-7 rounded-full text-xs font-bold transition-colors
                  ${i < step ? "bg-primary text-primary-foreground" : ""}
                  ${i === step ? "bg-primary text-primary-foreground ring-4 ring-primary/20" : ""}
                  ${i > step ? "bg-muted text-muted-foreground" : ""}
                `}
              >
                {i < step ? <CheckCircle className="h-4 w-4" /> : i + 1}
              </div>
              <span className={`text-xs ${i === step ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                {label}
              </span>
              {i < steps.length - 1 && (
                <div className={`h-px w-4 ${i < step ? "bg-primary" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 0: Account */}
        {step === 0 && (
          <Card>
            <CardContent className="pt-6">
              <h1 className="text-2xl font-bold text-foreground mb-1">Create your walker account</h1>
              <p className="text-muted-foreground text-sm mb-6">
                Join 2,400+ walkers already earning on PawGo.
              </p>
              <form onSubmit={accountForm.handleSubmit(onAccountSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" placeholder="John Smith" {...accountForm.register("name")} />
                  {accountForm.formState.errors.name && (
                    <p className="text-xs text-destructive">{accountForm.formState.errors.name.message}</p>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="john@example.com" {...accountForm.register("email")} />
                    {accountForm.formState.errors.email && (
                      <p className="text-xs text-destructive">{accountForm.formState.errors.email.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" type="tel" placeholder="+44 7700 900000" {...accountForm.register("phone")} />
                    {accountForm.formState.errors.phone && (
                      <p className="text-xs text-destructive">{accountForm.formState.errors.phone.message}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="At least 8 characters" {...accountForm.register("password")} />
                  {accountForm.formState.errors.password && (
                    <p className="text-xs text-destructive">{accountForm.formState.errors.password.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="location">Your city or postcode</Label>
                  <Input id="location" placeholder="London, E1 or Brooklyn, NY" {...accountForm.register("location")} />
                  {accountForm.formState.errors.location && (
                    <p className="text-xs text-destructive">{accountForm.formState.errors.location.message}</p>
                  )}
                </div>
                <Button type="submit" className="w-full h-11 mt-2">
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
              <p className="text-center text-xs text-muted-foreground mt-4">
                Already have an account?{" "}
                <Link to="/login" className="text-primary hover:underline">Sign in</Link>
              </p>
            </CardContent>
          </Card>
        )}

        {/* Step 1: Profile */}
        {step === 1 && (
          <Card>
            <CardContent className="pt-6">
              <h1 className="text-2xl font-bold text-foreground mb-1">Build your walker profile</h1>
              <p className="text-muted-foreground text-sm mb-6">
                A great profile gets more bookings. Be honest and specific.
              </p>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="bio">
                    About you{" "}
                    <span className="text-muted-foreground text-xs">(min. 50 characters)</span>
                  </Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell dog owners about yourself — your love of dogs, your neighbourhood, your reliability..."
                    className="resize-none"
                    rows={4}
                    {...profileForm.register("bio")}
                  />
                  {profileForm.formState.errors.bio && (
                    <p className="text-xs text-destructive">{profileForm.formState.errors.bio.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="experience">Dog walking experience</Label>
                  <Input
                    id="experience"
                    placeholder="e.g. 3 years walking dogs, own two dogs, former vet nurse..."
                    {...profileForm.register("experience")}
                  />
                  {profileForm.formState.errors.experience && (
                    <p className="text-xs text-destructive">{profileForm.formState.errors.experience.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Dog sizes you're comfortable with</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {DOG_SIZES_COMFORTABLE.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => toggleSize(size)}
                        className={`px-3 py-2 rounded-lg text-sm border text-left transition-colors
                          ${comfortableSizes.includes(size)
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background text-foreground border-border hover:border-primary"
                          }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pricePerWalk">Price per 30-min walk (£ or $)</Label>
                  <Input
                    id="pricePerWalk"
                    type="number"
                    placeholder="e.g. 15"
                    min={5}
                    max={100}
                    {...profileForm.register("pricePerWalk")}
                  />
                  <p className="text-xs text-muted-foreground">
                    Typical range: £12–25 (UK) / $18–35 (USA). PawGo takes 18% commission.
                  </p>
                  {profileForm.formState.errors.pricePerWalk && (
                    <p className="text-xs text-destructive">{profileForm.formState.errors.pricePerWalk.message}</p>
                  )}
                </div>
                <Alert className="border-border bg-muted/40">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <AlertDescription className="text-xs text-muted-foreground leading-relaxed pl-1">
                    By joining PawGo, you operate as an <strong>independent contractor</strong>, not an employee. PawGo provides the platform to connect you with clients — it does not direct, supervise, or control your services.
                  </AlertDescription>
                </Alert>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="independentContractor"
                    onCheckedChange={(v) => profileForm.setValue("independentContractor", !!v, { shouldValidate: true })}
                  />
                  <Label htmlFor="independentContractor" className="text-sm font-normal leading-relaxed cursor-pointer">
                    I confirm I am operating as an <strong>independent contractor</strong> and understand PawGo is not my employer and does not supervise my services.
                  </Label>
                </div>
                {profileForm.formState.errors.independentContractor && (
                  <p className="text-xs text-destructive">{profileForm.formState.errors.independentContractor.message}</p>
                )}

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="terms"
                    onCheckedChange={(v) => profileForm.setValue("agreedToTerms", !!v, { shouldValidate: true })}
                  />
                  <Label htmlFor="terms" className="text-sm font-normal leading-relaxed cursor-pointer">
                    I agree to PawGo's{" "}
                    <a href="/terms" target="_blank" className="text-primary hover:underline">Terms of Service</a>
                    {" "}and{" "}
                    <a href="/terms" target="_blank" className="text-primary hover:underline">Walker Code of Conduct</a>
                  </Label>
                </div>
                {profileForm.formState.errors.agreedToTerms && (
                  <p className="text-xs text-destructive">{profileForm.formState.errors.agreedToTerms.message}</p>
                )}
                <Button type="submit" className="w-full h-11 mt-2">
                  Continue to verification
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Verification */}
        {step === 2 && (
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="p-4 rounded-2xl bg-primary/10 w-fit mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Identity verification</h1>
              <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
                PawGo requires all walkers to complete an identity and background check before their first walk.
                This protects both walkers and dog owners.
              </p>
              <div className="text-left space-y-3 mb-8">
                {[
                  { label: "UK walkers", desc: "DBS (Disclosure and Barring Service) check — takes 1–3 business days" },
                  { label: "USA walkers", desc: "Background check via Checkr — takes under 24 hours" },
                ].map((item) => (
                  <div key={item.label} className="flex gap-3 p-4 bg-muted/40 rounded-xl">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm text-foreground">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button size="lg" className="w-full h-11" onClick={() => setStep(3)}>
                Start verification
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <p className="text-xs text-muted-foreground mt-3">
                You can complete verification later — your profile will be pending until it's done.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Done */}
        {step === 3 && (
          <Card>
            <CardContent className="pt-10 pb-10 text-center">
              <div className="text-6xl mb-4">🐾</div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                You're almost live!
              </h1>
              <p className="text-muted-foreground mb-2">
                Your walker profile has been created. Once your verification is approved, you'll start
                receiving booking requests.
              </p>
              <p className="text-sm text-primary font-medium mb-8">
                Most walkers receive their first booking within 48 hours.
              </p>
              <Button size="lg" className="px-8" onClick={() => navigate("/app/dashboard")}>
                Go to my dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
