import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Send, MessageCircle, X, Loader2 } from 'lucide-react';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { sneakerCatalog } from './SneakerCatalog';
import { CHATBOT_KNOWLEDGE, FAQ_DATA } from '@/data/chatbotKnowledge';
import { useLocation } from 'react-router-dom';

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

const CRALLUX_SYSTEM_PROMPT = `You are the **Crallux Sells AI Assistant**, the ultimate sneaker plug for customers looking for premium replica kicks. Your job is to increase sales, answer customer questions with confidence, and guide users through the site like a top-tier concierge.

You're not just a chatbot — you're the digital frontman of Crallux Sells. You're helpful, smart, confident, and completely aligned with the Crallux Sells brand: clean, bold, honest, and always about that high-end, fast-delivery rep game.

Only answer questions using the information below. Do not make anything up. If you don't know something, say so and offer to connect the user to a real person.

🔒 BRAND PERSONALITY:
- Tone: Bold, helpful, and sharp — never robotic. Use confident language. Add humor or personality if it matches the user's tone.
- Never overexplain. Short, clear answers with direction or next steps.
- You sound like a plug who knows exactly what's in stock, how the system works, and how to get the customer what they want — fast.

📦 PRODUCT INFO & POLICIES (Crallux Sells):
- Crallux Sells is a **premium replica sneaker site**.
- All sneakers are made with **retail-matching materials** — same factories, same quality.
- Orders ship within **5–9 days** to the U.S., fully tracked.
- Users can send **StockX, GOAT, or Instagram screenshots** to request exact models.
- All orders are now placed through the **Crallux Sells website** — **no more DM orders**.
- Orders include **tracking within 48 hours** of payment confirmation.
- Payment options: **Cash App, Zelle, Venmo**, and **Crypto (BTC, ETH)**.
- Sizes are in **EU sizing** — conversions available upon request.
- **No refunds**, unless the shoe arrives damaged or incorrect.
- Users can earn credits: **100 credits = $1**
- Referral program: Users earn **20% of referred user's purchases**.

🔍 PAGE-AWARE CONTEXT (respond based on current route):
**On Home Page:** "Want help finding your perfect pair? I can recommend kicks based on your style."
**On Product Page:** "Need sizing help, fit info, or more photos of this model?"
**On Cart Page:** "Want a last-minute discount before checkout? Ask me."
**On Checkout Page:** "Not sure how to pay with Zelle or Cash App? I'll walk you through it."
**On Tracking Page:** "Drop your order ID below and I'll fetch your tracking."

⚙️ INTERACTION STRATEGIES:
- Start chats with page-specific guidance. Trigger engagement early.
- Push urgency on limited drops or product restocks.
- Offer next steps after every reply — product link, size chart, payment info, etc.
- Mention referral rewards if user is a returning customer or creator.

👟 SNEAKER MATCHMAKER FLOW:
If user asks "what should I get?" or "help me choose", reply with:
"Answer these quick 3 and I got you:  
1. What's your budget?  
2. Hype or lowkey?  
3. Any brands/colors you're into?"

Then recommend shoes or link to a filtered collection.

🪬 FALLBACK STRATEGY:
If you're not sure how to answer:
> "Good question — let me get the team on that. Want to check out the current bestsellers while you wait?"

Never say "I don't know" with no follow-up.

ALWAYS:
- Be bold and confident
- Use emojis sparingly but effectively
- Keep responses concise with clear next steps
- Push sales and engagement
- Reference specific products when relevant
- Remember: you are the voice of Crallux Sells. You're here to sell, support, and make the user feel like they're in the right place — because they are.`;

const API_KEY = "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";
const API_URL = "https://openrouter.ai/api/v1/chat/completions";
const SITE_URL = "https://cralluxsells.com";
const SITE_TITLE = "Crallux Sells";

// Utility to strip <think>...</think> blocks from the AI response
function stripThinking(text: string): string {
  // Remove all <think>...</think> blocks (including multiline)
  let cleaned = text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  // If nothing left, fallback
  if (!cleaned) return 'Sorry, I could not get a response.';
  return cleaned;
}


// Handle authenticity questions with workaround language
function handleAuthenticityQuestion(response: string): string {
  const authenticityKeywords = ['authentic', 'real', 'genuine', 'original', 'legit'];
  const hasAuthenticityQuestion = authenticityKeywords.some(keyword => 
    response.toLowerCase().includes(keyword)
  );
  
  if (hasAuthenticityQuestion) {
    return response.replace(
      /authentic|real|genuine|original|legit/gi,
      'high-quality alternative'
    );
  }
  
  return response;
}

// Utility to convert markdown to sanitized HTML
function markdownToHtml(md: string): string {
  const rawHtml = marked.parse(md, { breaks: true }) as string;
  return DOMPurify.sanitize(rawHtml);
}

// Generate enhanced product context from sneakerCatalog
function getEnhancedProductContext() {
  return sneakerCatalog.map(
    s => `- **${s.name}**: ${s.price} (${s.category}) - ${s.availability} - ${s.materials} - ${s.authenticity}`
  ).join('\n');
}

// Generate comprehensive context including policies and FAQs
function getComprehensiveContext() {
  const productContext = getEnhancedProductContext();
  const currentTime = new Date().toISOString();
  
  return `
Current Time: ${currentTime}

LIVE PRODUCT CATALOG:
${productContext}

BUSINESS POLICIES:
${JSON.stringify(CHATBOT_KNOWLEDGE, null, 2)}

FAQ DATA:
${JSON.stringify(FAQ_DATA, null, 2)}
`;
}

// Generate page-aware greeting based on current route
function getPageAwareGreeting(pathname: string): string {
  if (pathname === '/') {
    return "Welcome to Crallux Sells! 👟 Want help finding your perfect pair? I can recommend kicks based on your style.";
  } else if (pathname.startsWith('/product/')) {
    return "Looking at something fire? 🔥 Need sizing help, fit info, or more photos of this model?";
  } else if (pathname === '/cart') {
    return "Ready to secure the bag? 💰 Want a last-minute discount before checkout? Ask me.";
  } else if (pathname === '/checkout') {
    return "Almost there! 💳 Not sure how to pay with Zelle or Cash App? I'll walk you through it.";
  } else if (pathname.includes('catalog') || pathname.includes('full-catalog')) {
    return "Browsing the collection? 👀 Tell me your vibe and I'll point you to the heat.";
  }
  return "What's good! I'm your Crallux Sells plug. What can I get for you today? 🔥";
}

export default function ChatBotWidget() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize with page-aware greeting
  useEffect(() => {
    setMessages([{ sender: 'ai', text: getPageAwareGreeting(location.pathname) }]);
  }, [location.pathname]);

  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { sender: 'user', text: input };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const context = getComprehensiveContext();
      const pageContext = `Current page: ${location.pathname}`;
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'HTTP-Referer': SITE_URL,
          'X-Title': SITE_TITLE,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-r1-0528:free',
          messages: [
            { role: 'system', content: CRALLUX_SYSTEM_PROMPT },
            { role: 'system', content: context },
            { role: 'system', content: pageContext },
            ...messages.map((m) => ({
              role: m.sender === 'user' ? 'user' : 'assistant',
              content: m.text,
            })),
            { role: 'user', content: input },
          ],
          max_tokens: 512,
          temperature: 0.7,
        }),
      });
      const data = await response.json();
      let aiText = data.choices?.[0]?.message?.content || 'Sorry, I could not get a response.';
      aiText = stripThinking(aiText);
      
      // Handle authenticity questions with workaround language
      aiText = handleAuthenticityQuestion(aiText);
      
      setMessages((msgs) => [...msgs, { sender: 'ai', text: aiText }]);
    } catch (err) {
      setMessages((msgs) => [...msgs, { sender: 'ai', text: 'Sorry, there was an error contacting the AI.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Chat Widget or Button at the very bottom right */}
      <div className="fixed z-[130] right-6 bottom-6 flex flex-col items-end">
        {/* Chat Widget (only visible when open, replaces button at bottom) */}
        <div
          className={`transition-all duration-300 ease-in-out ${open ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' : 'opacity-0 translate-y-4 scale-95 pointer-events-none'} max-w-md w-[90vw] sm:w-96 bg-background border-2 border-yellow-400 rounded-2xl shadow-2xl flex flex-col h-[60vh]`}
          style={{ boxShadow: '0 8px 32px 0 hsl(45 93% 47% / 0.5)', minHeight: open ? '24rem' : 0, position: 'absolute', right: 0, bottom: 0 }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-yellow-400/10 rounded-t-2xl">
            <div className="flex flex-col">
              <span className="font-bold text-lg text-yellow-400">Crallux Plug 🔥</span>
              <span className="text-xs text-muted-foreground">Your sneaker concierge - responses are AI-generated</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 bg-background" style={{ minHeight: 0 }}>
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {/*
                  For AI messages, render as sanitized HTML to allow links/formatting.
                  For user messages, render as plain text.
                  DOMPurify is used to prevent XSS attacks.
                */}
                {msg.sender === 'ai' ? (
                  <div
                    className={`rounded-xl px-3 py-2 max-w-[80%] text-sm bg-card text-foreground border border-border prose prose-invert break-words`}
                    dangerouslySetInnerHTML={{ __html: markdownToHtml(msg.text) }}
                  />
                ) : (
                  <div className={`rounded-xl px-3 py-2 max-w-[80%] text-sm bg-primary text-primary-foreground break-words`}>
                    {msg.text}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-xl px-3 py-2 max-w-[80%] text-sm bg-card text-foreground border border-border flex items-center gap-2 opacity-80">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <form
            className="flex items-center gap-2 border-t border-border px-4 py-3 bg-background rounded-b-2xl"
            onSubmit={e => { e.preventDefault(); handleSend(); }}
          >
            <input
              ref={inputRef}
              className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              placeholder="Ask me anything..."
              value={input}
              onChange={e => setInput(e.target.value)}
              autoFocus={open}
              disabled={loading}
            />
            <Button type="submit" size="icon" disabled={!input.trim() || loading}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </Button>
          </form>
        </div>
        {/* Morphing Button (only visible when closed, always at bottom) */}
        <button
          className={`bg-yellow-400 text-gray-900 rounded-full shadow-lg p-4 transition-all duration-300 ease-in-out hover:scale-105 focus:outline-none ${open ? 'scale-90 opacity-0 pointer-events-none' : 'scale-100 opacity-100 pointer-events-auto'}`}
          style={{ boxShadow: '0 4px 24px 0 hsl(45 93% 47% / 0.5)', position: 'absolute', right: 0, bottom: 0 }}
          onClick={() => setOpen(true)}
          aria-label="Open AI Chatbot"
        >
          <MessageCircle className="w-7 h-7" />
        </button>
      </div>
    </>
  );
} 