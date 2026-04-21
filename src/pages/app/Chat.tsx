import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getBookingById, fmt } from "@/utils/booking";
import {
  getMessages,
  addMessage,
  containsContactInfo,
  getMockWalkerReply,
  type Message,
} from "@/utils/chat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Send, Shield, Lock, AlertTriangle, Calendar, Clock } from "lucide-react";

export default function Chat() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const booking = getBookingById(bookingId ?? "");
  const [messages, setMessages] = useState<Message[]>(() =>
    getMessages(bookingId ?? "")
  );
  const [input, setInput] = useState("");
  const [contactWarning, setContactWarning] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  if (!booking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-4xl mb-4">💬</p>
          <p className="font-semibold text-foreground">Booking not found</p>
          <Button className="mt-4" onClick={() => navigate("/app/dashboard")}>Back to dashboard</Button>
        </div>
      </div>
    );
  }

  const isLocked = booking.status === "pending";
  const otherName = user?.role === "owner" ? booking.walkerName : booking.ownerName;
  const otherInitial = otherName.charAt(0);

  const handleSend = () => {
    if (!input.trim() || !user || isLocked) return;

    const hasContact = containsContactInfo(input);
    if (hasContact) {
      setContactWarning(true);
    }

    const msg = addMessage({
      bookingId: booking.id,
      senderId: user.id,
      senderName: user.name,
      senderRole: user.role,
      text: input.trim(),
    });

    setMessages((prev) => [...prev, msg]);
    setInput("");

    // Mock walker auto-reply (only if owner is sending)
    if (user.role === "owner") {
      setIsTyping(true);
      setTimeout(() => {
        const reply = addMessage({
          bookingId: booking.id,
          senderId: booking.walkerId,
          senderName: booking.walkerName,
          senderRole: "walker",
          text: getMockWalkerReply(),
        });
        setIsTyping(false);
        setMessages((prev) => [...prev, reply]);
      }, 1800 + Math.random() * 800);
    }
  };

  const formatTime = (ts: string) =>
    new Date(ts).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Fixed header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-2xl mx-auto px-4 flex items-center gap-3 h-14">
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => navigate("/app/dashboard")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary font-bold">
              {otherInitial}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-foreground truncate">{otherName}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />{booking.date}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />{booking.time} · {booking.duration} min
              </span>
              <Badge
                className={
                  booking.status === "confirmed"
                    ? "bg-green-100 text-green-700 border-0 text-xs px-1.5 py-0 h-4"
                    : "bg-amber-100 text-amber-700 border-0 text-xs px-1.5 py-0 h-4"
                }
              >
                {booking.status}
              </Badge>
            </div>
          </div>
          <p className="text-sm font-semibold text-foreground shrink-0">{fmt(booking.total)}</p>
        </div>
      </header>

      {/* Locked state */}
      {isLocked && (
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-xs">
            <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Lock className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="font-semibold text-foreground">Chat unlocks after booking is confirmed</p>
            <p className="text-sm text-muted-foreground mt-2">
              Once payment is processed and the booking is confirmed, you'll be able to message {otherName} here.
            </p>
            <Button className="mt-6" onClick={() => navigate("/app/dashboard")}>
              Back to dashboard
            </Button>
          </div>
        </div>
      )}

      {/* Chat interface */}
      {!isLocked && (
        <>
          {/* Platform safety banner */}
          <div className="bg-muted/40 border-b border-border px-4 py-2 max-w-2xl mx-auto w-full">
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Shield className="h-3 w-3 text-primary shrink-0" />
              For your safety and convenience, keep all bookings and communication within PawGo.
            </p>
          </div>

          {/* Messages */}
          <main className="flex-1 overflow-y-auto max-w-2xl mx-auto w-full px-4 py-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <p className="text-2xl mb-2">👋</p>
                <p className="text-sm text-muted-foreground">
                  Say hello to {otherName}! This is the start of your conversation.
                </p>
              </div>
            )}

            {messages.map((msg) => {
              const isMine = msg.senderId === user?.id;
              return (
                <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"} gap-2`}>
                  {!isMine && (
                    <Avatar className="h-7 w-7 shrink-0 mt-1">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                        {otherInitial}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`max-w-[75%] space-y-0.5`}>
                    <div
                      className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        isMine
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-muted text-foreground rounded-bl-sm"
                      }`}
                    >
                      {msg.text}
                    </div>
                    <p className={`text-xs text-muted-foreground px-1 ${isMine ? "text-right" : "text-left"}`}>
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start gap-2">
                <Avatar className="h-7 w-7 shrink-0 mt-1">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                    {otherInitial}
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </main>

          {/* Contact warning */}
          {contactWarning && (
            <div className="max-w-2xl mx-auto w-full px-4 pb-2">
              <Alert className="border-amber-200 bg-amber-50">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-xs text-amber-800 pl-1">
                  Please avoid sharing personal contact details. For your protection, keep all communication within PawGo.{" "}
                  <button className="underline" onClick={() => setContactWarning(false)}>Dismiss</button>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Input area */}
          <div className="sticky bottom-0 bg-background border-t border-border px-4 py-3 max-w-2xl mx-auto w-full">
            <div className="flex items-center gap-2">
              <Input
                placeholder={`Message ${otherName}...`}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  if (contactWarning) setContactWarning(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                className="flex-1 h-11"
              />
              <Button
                size="icon"
                className="h-11 w-11 shrink-0"
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center flex items-center justify-center gap-1">
              <Lock className="h-3 w-3" />
              Messages are private and linked to your booking only
            </p>
          </div>
        </>
      )}
    </div>
  );
}
