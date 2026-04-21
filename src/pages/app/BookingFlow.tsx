import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getWalkerById } from "@/data/walkers";
import { calculatePayment, fmt, saveBooking, type Booking } from "@/utils/booking";
import { getCredits, spendCredits, claimFirstBookingReward } from "@/utils/retention";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Shield,
  Star,
  Calendar,
  Clock,
  CreditCard,
  Lock,
  Info,
  MessageCircle,
  Gift,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const TIME_SLOTS = [
  "7:00 AM", "7:30 AM", "8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM",
  "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
  "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM",
  "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM", "6:00 PM",
];

const DURATIONS: { value: 30 | 45 | 60; label: string; desc: string }[] = [
  { value: 30, label: "30 min", desc: "Short walk" },
  { value: 45, label: "45 min", desc: "Standard walk" },
  { value: 60, label: "60 min", desc: "Long walk" },
];

const steps = ["Schedule", "Confirm", "Payment", "Done"];

// ─── Card input helpers ────────────────────────────────────────────────────────

function fmtCard(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 16);
  return d.replace(/(\d{4})(?=\d)/g, "$1 ");
}

function fmtExpiry(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length >= 3 ? d.slice(0, 2) + "/" + d.slice(2) : d;
}

// ─── Step indicator ────────────────────────────────────────────────────────────

function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-1 sm:gap-2 mb-8 overflow-x-auto pb-1">
      {steps.map((label, i) => (
        <div key={label} className="flex items-center gap-1 sm:gap-2 shrink-0">
          <div
            className={`flex items-center justify-center h-7 w-7 rounded-full text-xs font-bold transition-colors
              ${i < current ? "bg-primary text-primary-foreground" : ""}
              ${i === current ? "bg-primary text-primary-foreground ring-4 ring-primary/20" : ""}
              ${i > current ? "bg-muted text-muted-foreground" : ""}
            `}
          >
            {i < current ? <CheckCircle className="h-3.5 w-3.5" /> : i + 1}
          </div>
          <span className={`text-xs ${i === current ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
            {label}
          </span>
          {i < steps.length - 1 && (
            <div className={`h-px w-4 sm:w-6 ${i < current ? "bg-primary" : "bg-border"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function BookingFlow() {
  const { walkerId } = useParams<{ walkerId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const walker = getWalkerById(walkerId ?? "");

  const [step, setStep] = useState(0);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState<30 | 45 | 60>(30);
  const [notes, setNotes] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingId, setBookingId] = useState("");
  const [useCredits, setUseCredits] = useState(false);
  const [isFirstBooking, setIsFirstBooking] = useState(false);

  const availableCredits = getCredits();

  if (!walker) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-4xl mb-4">🐾</p>
          <p className="font-semibold text-foreground">Walker not found</p>
          <Button className="mt-4" onClick={() => navigate("/app/find")}>
            Browse walkers
          </Button>
        </div>
      </div>
    );
  }

  const payment = calculatePayment(walker.pricePerWalk, duration);
  const creditDiscount = useCredits ? Math.min(availableCredits, payment.total) : 0;
  const amountDue = Math.max(0, payment.total - creditDiscount);

  const minDate = new Date().toISOString().split("T")[0];

  const canProceedStep0 = date !== "" && time !== "";

  const handlePayment = async () => {
    setIsProcessing(true);
    // → Replace with real Stripe PaymentIntent creation:
    //   const { clientSecret } = await fetch("/api/create-payment-intent", { ... })
    //   await stripe.confirmCardPayment(clientSecret, { ... })
    await new Promise((r) => setTimeout(r, 1800));

    if (useCredits && creditDiscount > 0) spendCredits(creditDiscount);

    const id = crypto.randomUUID();
    const booking: Booking = {
      id,
      ownerId: user?.id ?? "",
      ownerName: user?.name ?? "",
      ownerDog: "Buddy",
      walkerId: walker.id,
      walkerName: walker.name,
      date,
      time,
      duration,
      pricePerWalk: walker.pricePerWalk,
      total: payment.total,
      platformFee: payment.platformFee,
      walkerEarnings: payment.walkerEarnings,
      currency: "GBP",
      status: "confirmed",
      paymentStatus: "paid",
      createdAt: new Date().toISOString(),
      notes: notes || undefined,
    };
    saveBooking(booking);

    const firstBooking = user ? claimFirstBookingReward(user.id) : false;
    setIsFirstBooking(firstBooking);
    setBookingId(id);
    setIsProcessing(false);
    setStep(3);
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:py-12">
      <div className="max-w-lg mx-auto">
        {/* Back nav */}
        <div className="flex items-center gap-3 mb-8">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => (step === 0 ? navigate("/app/find") : setStep(step - 1))}
            disabled={step === 3}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🐾</span>
            <span className="font-bold text-xl text-primary">PawGo</span>
          </Link>
        </div>

        <StepBar current={step} />

        {/* Walker summary (visible in steps 0–2) */}
        {step < 3 && (
          <Card className="border-border bg-secondary/30 mb-6">
            <CardContent className="py-3 px-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback className="bg-primary/15 text-primary font-bold">
                    {walker.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-semibold text-sm text-foreground">{walker.name}</p>
                    {walker.verified && (
                      <Shield className="h-3.5 w-3.5 text-primary" />
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="h-3 w-3 fill-accent text-accent" />
                    <span>{walker.rating} · {walker.reviews} reviews · {walker.location}</span>
                  </div>
                </div>
                <p className="font-bold text-foreground shrink-0">£{walker.pricePerWalk}<span className="text-xs font-normal text-muted-foreground">/30m</span></p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Step 0: Schedule ─────────────────────────────────────────────── */}
        {step === 0 && (
          <Card>
            <CardContent className="pt-6 space-y-5">
              <div>
                <h1 className="text-xl font-bold text-foreground mb-1">Schedule your walk</h1>
                <p className="text-sm text-muted-foreground">Pick a date, time and how long you need.</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="date" className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  min={minDate}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  Time
                </Label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
                  {TIME_SLOTS.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setTime(slot)}
                      className={`px-2 py-2 rounded-lg text-xs border transition-colors
                        ${time === slot
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-foreground border-border hover:border-primary"
                        }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Duration</Label>
                <div className="grid grid-cols-3 gap-2">
                  {DURATIONS.map((d) => (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => setDuration(d.value)}
                      className={`py-3 rounded-xl border text-center transition-colors
                        ${duration === d.value
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background border-border hover:border-primary"
                        }`}
                    >
                      <p className="font-semibold text-sm">{d.label}</p>
                      <p className={`text-xs mt-0.5 ${duration === d.value ? "opacity-80" : "text-muted-foreground"}`}>
                        {d.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notes">Notes for the walker <span className="text-muted-foreground">(optional)</span></Label>
                <Textarea
                  id="notes"
                  placeholder="Any special instructions, gate codes, dog quirks..."
                  className="resize-none"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <Button
                className="w-full h-11"
                disabled={!canProceedStep0}
                onClick={() => setStep(1)}
              >
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* ── Step 1: Confirm ───────────────────────────────────────────────── */}
        {step === 1 && (
          <Card>
            <CardContent className="pt-6 space-y-5">
              <div>
                <h1 className="text-xl font-bold text-foreground mb-1">Review your booking</h1>
                <p className="text-sm text-muted-foreground">Check the details before paying.</p>
              </div>

              {/* Booking summary */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1.5 border-b border-border">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" /> Date
                  </span>
                  <span className="font-medium text-foreground">{new Date(date + "T00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" /> Time
                  </span>
                  <span className="font-medium text-foreground">{time}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium text-foreground">{duration} minutes</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border">
                  <span className="text-muted-foreground">Walker</span>
                  <span className="font-medium text-foreground">{walker.name}</span>
                </div>
              </div>

              {/* Price breakdown */}
              <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2 text-sm">
                <p className="font-semibold text-foreground text-xs uppercase tracking-wide mb-3">Price breakdown</p>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Walk ({duration} min at £{walker.pricePerWalk}/30 min)</span>
                  <span className="font-medium">{fmt(payment.total)}</span>
                </div>
                {useCredits && creditDiscount > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span className="flex items-center gap-1">
                      <Gift className="h-3.5 w-3.5" />
                      PawGo credits applied
                    </span>
                    <span>-{fmt(creditDiscount)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-base text-foreground">
                  <span>Total due</span>
                  <span>{fmt(amountDue)}</span>
                </div>
              </div>

              {/* Credits toggle */}
              {availableCredits > 0 && (
                <div
                  className="flex items-center justify-between p-3 rounded-lg border border-green-200 bg-green-50 cursor-pointer"
                  onClick={() => setUseCredits((v) => !v)}
                >
                  <div className="flex items-center gap-2">
                    <Gift className="h-4 w-4 text-green-700 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-green-900">
                        You have {fmt(availableCredits)} in credits
                      </p>
                      <p className="text-xs text-green-700">Apply to this booking</p>
                    </div>
                  </div>
                  <div className={`h-5 w-9 rounded-full transition-colors ${useCredits ? "bg-green-600" : "bg-muted"}`}>
                    <div className={`h-4 w-4 rounded-full bg-white shadow m-0.5 transition-transform ${useCredits ? "translate-x-4" : "translate-x-0"}`} />
                  </div>
                </div>
              )}

              {notes && (
                <div className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-3">
                  <span className="font-medium text-foreground">Notes: </span>{notes}
                </div>
              )}

              <Alert className="border-border bg-muted/40">
                <Info className="h-4 w-4 text-muted-foreground" />
                <AlertDescription className="text-xs text-muted-foreground pl-1">
                  Payment is collected now. You can cancel up to 24 hours before the walk for a full refund. {walker.name} is an independent contractor — PawGo is not responsible for services provided.
                </AlertDescription>
              </Alert>

              <Button className="w-full h-11" onClick={() => setStep(2)}>
                Proceed to payment
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* ── Step 2: Payment ───────────────────────────────────────────────── */}
        {step === 2 && (
          <Card>
            <CardContent className="pt-6 space-y-5">
              <div>
                <h1 className="text-xl font-bold text-foreground mb-1">Payment</h1>
                <p className="text-sm text-muted-foreground">Your walk will be confirmed instantly after payment.</p>
              </div>

              {/* Amount */}
              <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 text-center">
                <p className="text-3xl font-extrabold text-foreground">{fmt(amountDue)}</p>
                {creditDiscount > 0 && (
                  <p className="text-xs text-green-700 mt-0.5 flex items-center justify-center gap-1">
                    <Gift className="h-3 w-3" />
                    {fmt(creditDiscount)} credit discount applied
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">{duration}-min walk with {walker.name}</p>
              </div>

              {/* Card form */}
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="cardName">Cardholder name</Label>
                  <Input
                    id="cardName"
                    placeholder="Jane Smith"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cardNumber" className="flex items-center gap-1.5">
                    <CreditCard className="h-3.5 w-3.5" />
                    Card number
                  </Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(fmtCard(e.target.value))}
                    maxLength={19}
                    inputMode="numeric"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="expiry">Expiry</Label>
                    <Input
                      id="expiry"
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={(e) => setExpiry(fmtExpiry(e.target.value))}
                      maxLength={5}
                      inputMode="numeric"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      type="password"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                      maxLength={3}
                      inputMode="numeric"
                    />
                  </div>
                </div>
              </div>

              {/* Test mode notice */}
              <div className="flex gap-2.5 p-3 rounded-lg bg-amber-50 border border-amber-200">
                <span className="text-base shrink-0">🧪</span>
                <p className="text-xs text-amber-800 leading-relaxed">
                  <strong>Test mode.</strong> Use card <strong>4242 4242 4242 4242</strong>, any future expiry, any CVV. No real charge.
                </p>
              </div>

              {/* Security */}
              <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <Lock className="h-3 w-3" />
                Secured by 256-bit SSL encryption
              </div>

              <Button
                className="w-full h-12 text-base font-semibold"
                onClick={handlePayment}
                disabled={isProcessing || !cardName || cardNumber.length < 19 || expiry.length < 5 || cvv.length < 3}
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <>Pay {fmt(amountDue)}</>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* ── Step 3: Done ──────────────────────────────────────────────────── */}
        {step === 3 && (
          <Card>
            <CardContent className="pt-10 pb-8 text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Walk confirmed!</h1>
                <p className="text-muted-foreground text-sm mt-2 max-w-xs mx-auto">
                  {walker.name} has been notified and will be at your door on time.
                </p>
              </div>

              {/* Receipt */}
              <div className="rounded-xl border border-border bg-muted/30 p-4 text-left space-y-2 text-sm">
                <p className="font-semibold text-foreground text-xs uppercase tracking-wide mb-3">Booking receipt</p>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Walker</span>
                  <span className="font-medium">{walker.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium">{new Date(date + "T00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time</span>
                  <span className="font-medium">{time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium">{duration} min</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total paid</span>
                  <span>{fmt(payment.total)}</span>
                </div>
                <p className="text-xs text-muted-foreground pt-1">
                  Ref: {bookingId.slice(0, 8).toUpperCase()}
                </p>
              </div>

              {/* First booking reward */}
              {isFirstBooking && (
                <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-center space-y-1">
                  <p className="text-2xl">🎉</p>
                  <p className="font-semibold text-green-900 text-sm">You've earned £5 in PawGo credits!</p>
                  <p className="text-xs text-green-700">Applied to your next booking automatically.</p>
                </div>
              )}

              <div className="flex flex-col gap-2 pt-2">
                <Button
                  className="w-full h-11"
                  onClick={() => navigate(`/app/chat/${bookingId}`)}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Message {walker.name}
                </Button>
                <Button variant="outline" className="w-full h-11" onClick={() => navigate("/app/dashboard")}>
                  Back to dashboard
                </Button>
                <Button variant="ghost" className="w-full h-11" onClick={() => navigate("/app/find")}>
                  Book another walk
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                You'll receive live GPS tracking when the walk starts.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
