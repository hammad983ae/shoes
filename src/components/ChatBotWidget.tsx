import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Send, MessageCircle, X, Loader2 } from 'lucide-react';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { sneakerCatalog } from './SneakerCatalog';
import { CHATBOT_KNOWLEDGE, FAQ_DATA } from '@/data/chatbotKnowledge';

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

const ENHANCED_SYSTEM_PROMPT = `You are Crallux Sells' AI assistant. You have access to:

PRODUCT CATALOG (Live Data):
- Current inventory with prices, descriptions, and availability
- Product categories: Rick Owens, Maison Margiela, Nike
- Sizing information and material details
- All products are high-quality alternatives with premium materials

POLICIES:
- Returns: All sales final unless damaged/incorrect. 3-day return window.
- Shipping: FREE 5-9 day shipping on all orders
- Payment: Stripe processing, must be signed in to purchase
- Contact: cralluxmaster@protonmail.com

REFERRAL SYSTEM:
- Users earn 10% back in credits for successful referrals
- New customers get 10% off using referral links
- Referral links: https://cralluxsells.com/ref/[code]

CREDITS SYSTEM:
- Earn credits through referrals and promotions
- Use credits for discounts at checkout
- Credits are site-wide currency

AUTHENTICITY:
- All products are high-quality alternatives sourced from premium suppliers
- Premium materials and construction standards
- Not claiming to be original brand items

BUSINESS DETAILS:
- Website: https://cralluxsells.com
- Email: cralluxmaster@protonmail.com
- 24/7 online support
- Premium sneaker marketplace

ALWAYS:
- Be accurate and factual
- Reference specific policies when relevant
- Offer to connect to human support for complex issues
- Use markdown formatting for clarity
- Provide actionable next steps
- For authenticity questions, emphasize high-quality alternatives and premium materials`;

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

// Validate response contains accurate facts
function validateResponse(response: string): boolean {
  const keyFacts = [
    'cralluxsells.com',
    'cralluxmaster@protonmail.com',
    '5-9 days',
    'FREE shipping',
    '3 days',
    'high-quality alternative',
    'premium materials'
  ];
  
  const responseLower = response.toLowerCase();
  return keyFacts.some(fact => responseLower.includes(fact.toLowerCase()));
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

export default function ChatBotWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'ai', text: 'Hi! I am the Crallux Sells AI assistant. Ask me anything about our business, products, or policies.' }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
            { role: 'system', content: ENHANCED_SYSTEM_PROMPT },
            { role: 'system', content: context },
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
      
      // Validate response accuracy
      if (!validateResponse(aiText)) {
        aiText += '\n\n*For the most accurate information, please contact cralluxmaster@protonmail.com*';
      }
      
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
          className={`transition-all duration-300 ease-in-out ${open ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' : 'opacity-0 translate-y-4 scale-95 pointer-events-none'} max-w-md w-[90vw] sm:w-96 bg-background border-2 border-primary rounded-2xl shadow-2xl flex flex-col h-[60vh]`}
          style={{ boxShadow: '0 8px 32px 0 #FFD60080', minHeight: open ? '24rem' : 0, position: 'absolute', right: 0, bottom: 0 }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-primary/10 rounded-t-2xl">
            <div className="flex flex-col">
              <span className="font-bold text-lg text-primary">AI Chat Assistant</span>
              <span className="text-xs text-muted-foreground">Anything said here is AI and may be wrong.</span>
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
          className={`bg-primary text-primary-foreground rounded-full shadow-lg p-4 transition-all duration-300 ease-in-out hover:scale-105 focus:outline-none ${open ? 'scale-90 opacity-0 pointer-events-none' : 'scale-100 opacity-100 pointer-events-auto'}`}
          style={{ boxShadow: '0 4px 24px 0 #FFD60080', position: 'absolute', right: 0, bottom: 0 }}
          onClick={() => setOpen(true)}
          aria-label="Open AI Chatbot"
        >
          <MessageCircle className="w-7 h-7" />
        </button>
      </div>
    </>
  );
} 