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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";

const accountSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  location: z.string().min(3, "Please enter your city or postcode"),
});

const dogSchema = z.object({
  dogName: z.string().min(1, "Dog's name is required"),
  breed: z.string().min(1, "Breed is required"),
  size: z.enum(["small", "medium", "large", "extra-large"]),
  age: z.string().min(1, "Age is required"),
  personality: z.string().optional(),
  healthNotes: z.string().optional(),
});

type AccountData = z.infer<typeof accountSchema>;
type DogData = z.infer<typeof dogSchema>;

const DOG_SIZES = [
  { value: "small", label: "Small (under 10kg)" },
  { value: "medium", label: "Medium (10–25kg)" },
  { value: "large", label: "Large (25–40kg)" },
  { value: "extra-large", label: "Extra large (40kg+)" },
];

const PERSONALITY_TRAITS = [
  "Friendly", "Energetic", "Calm", "Shy", "Playful",
  "Good with other dogs", "Needs solo walks", "Loves fetch",
];

const steps = ["Your account", "Your dog", "Done"];

export default function SignupOwner() {
  const [step, setStep] = useState(0);
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const [accountData, setAccountData] = useState<AccountData | null>(null);
  const navigate = useNavigate();
  const { loginAs } = useAuth();

  const accountForm = useForm<AccountData>({ resolver: zodResolver(accountSchema) });
  const dogForm = useForm<DogData>({ resolver: zodResolver(dogSchema) });

  const onAccountSubmit = (data: AccountData) => {
    setAccountData(data);
    setStep(1);
  };

  const onDogSubmit = async (data: DogData) => {
    if (!accountData) return;
    loginAs({
      id: crypto.randomUUID(),
      name: accountData.name,
      email: accountData.email,
      role: "owner",
      location: accountData.location,
    });
    console.log({ ...accountData, ...data, personality: selectedTraits });
    setStep(2);
  };

  const toggleTrait = (trait: string) => {
    setSelectedTraits((prev) =>
      prev.includes(trait) ? prev.filter((t) => t !== trait) : [...prev, trait]
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
        <div className="flex items-center gap-2 mb-8">
          {steps.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`flex items-center justify-center h-7 w-7 rounded-full text-xs font-bold transition-colors
                  ${i < step ? "bg-primary text-primary-foreground" : ""}
                  ${i === step ? "bg-primary text-primary-foreground ring-4 ring-primary/20" : ""}
                  ${i > step ? "bg-muted text-muted-foreground" : ""}
                `}
              >
                {i < step ? <CheckCircle className="h-4 w-4" /> : i + 1}
              </div>
              <span
                className={`text-sm ${i === step ? "font-semibold text-foreground" : "text-muted-foreground"}`}
              >
                {label}
              </span>
              {i < steps.length - 1 && (
                <div className={`h-px w-8 ${i < step ? "bg-primary" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 0: Account */}
        {step === 0 && (
          <Card>
            <CardContent className="pt-6">
              <h1 className="text-2xl font-bold text-foreground mb-1">Create your account</h1>
              <p className="text-muted-foreground text-sm mb-6">
                Let's start with your personal details.
              </p>
              <form onSubmit={accountForm.handleSubmit(onAccountSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" placeholder="Jane Smith" {...accountForm.register("name")} />
                  {accountForm.formState.errors.name && (
                    <p className="text-xs text-destructive">{accountForm.formState.errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email address</Label>
                  <Input id="email" type="email" placeholder="jane@example.com" {...accountForm.register("email")} />
                  {accountForm.formState.errors.email && (
                    <p className="text-xs text-destructive">{accountForm.formState.errors.email.message}</p>
                  )}
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
                  <Input id="location" placeholder="London, SW1A or New York, NY" {...accountForm.register("location")} />
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

        {/* Step 1: Dog profile */}
        {step === 1 && (
          <Card>
            <CardContent className="pt-6">
              <h1 className="text-2xl font-bold text-foreground mb-1">Tell us about your dog</h1>
              <p className="text-muted-foreground text-sm mb-6">
                This helps us find the perfect walker for their personality and needs.
              </p>
              <form onSubmit={dogForm.handleSubmit(onDogSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="dogName">Dog's name</Label>
                    <Input id="dogName" placeholder="Buddy" {...dogForm.register("dogName")} />
                    {dogForm.formState.errors.dogName && (
                      <p className="text-xs text-destructive">{dogForm.formState.errors.dogName.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="age">Age</Label>
                    <Input id="age" placeholder="e.g. 3 years" {...dogForm.register("age")} />
                    {dogForm.formState.errors.age && (
                      <p className="text-xs text-destructive">{dogForm.formState.errors.age.message}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="breed">Breed</Label>
                  <Input id="breed" placeholder="e.g. Golden Retriever" {...dogForm.register("breed")} />
                  {dogForm.formState.errors.breed && (
                    <p className="text-xs text-destructive">{dogForm.formState.errors.breed.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label>Size</Label>
                  <Select onValueChange={(v) => dogForm.setValue("size", v as DogData["size"])}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      {DOG_SIZES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {dogForm.formState.errors.size && (
                    <p className="text-xs text-destructive">{dogForm.formState.errors.size.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Personality (select all that apply)</Label>
                  <div className="flex flex-wrap gap-2">
                    {PERSONALITY_TRAITS.map((trait) => (
                      <button
                        key={trait}
                        type="button"
                        onClick={() => toggleTrait(trait)}
                        className={`px-3 py-1.5 rounded-full text-sm border transition-colors
                          ${selectedTraits.includes(trait)
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background text-foreground border-border hover:border-primary"
                          }`}
                      >
                        {trait}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="healthNotes">Health notes <span className="text-muted-foreground">(optional)</span></Label>
                  <Textarea
                    id="healthNotes"
                    placeholder="Any allergies, medical conditions, or things walkers should know..."
                    className="resize-none"
                    rows={3}
                    {...dogForm.register("healthNotes")}
                  />
                </div>
                <Button type="submit" className="w-full h-11 mt-2">
                  Create my account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Done */}
        {step === 2 && (
          <Card>
            <CardContent className="pt-10 pb-10 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Welcome to PawGo!
              </h1>
              <p className="text-muted-foreground mb-8">
                Your account is ready. Let's find the perfect walker for your dog.
              </p>
              <Button size="lg" className="px-8" onClick={() => navigate("/app/find")}>
                Find a walker
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
