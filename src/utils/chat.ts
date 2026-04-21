export interface Message {
  id: string;
  bookingId: string;
  senderId: string;
  senderName: string;
  senderRole: "owner" | "walker";
  text: string;
  timestamp: string;
}

const KEY = "pawgo_messages";

const CONTACT_PATTERNS = [
  /\b\d{7,}\b/,
  /[\w.+\-]+@[\w\-]+\.\w{2,}/,
  /\+\d[\s\-]?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{4}/,
  /\b07\d{9}\b/,
];

export function containsContactInfo(text: string): boolean {
  return CONTACT_PATTERNS.some((p) => p.test(text));
}

export function getMessages(bookingId: string): Message[] {
  try {
    const all: Message[] = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return all
      .filter((m) => m.bookingId === bookingId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  } catch {
    return [];
  }
}

export function addMessage(msg: Omit<Message, "id" | "timestamp">): Message {
  const all: Message[] = JSON.parse(localStorage.getItem(KEY) ?? "[]");
  const newMsg: Message = {
    ...msg,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  };
  all.push(newMsg);
  localStorage.setItem(KEY, JSON.stringify(all));
  return newMsg;
}

const WALKER_REPLIES = [
  "Hi! Happy to help — looking forward to meeting your dog!",
  "Sounds great, I'll be there on time. Any gate codes I should know about?",
  "No problem at all! I'll bring treats if that's okay.",
  "Perfect! I'll send you a photo update mid-walk.",
  "Confirmed! See you then — your dog is going to have a great time.",
];

export function getMockWalkerReply(): string {
  return WALKER_REPLIES[Math.floor(Math.random() * WALKER_REPLIES.length)];
}
