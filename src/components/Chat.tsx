import { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  serverTimestamp, 
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  ChevronLeft, 
  User as UserIcon,
  Shield,
  Lock
} from 'lucide-react';
import { cn } from '../lib/utils';

interface Message {
  id: string;
  senderUid: string;
  text: string;
  createdAt: any;
}

export const Chat = ({ 
  currentUserUid, 
  otherUserUid, 
  otherDisplayName,
  onBack 
}: { 
  currentUserUid: string; 
  otherUserUid: string; 
  otherDisplayName: string;
  onBack: () => void;
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Chat ID is a combination of both UIDs sorted to ensure uniqueness
  const chatId = [currentUserUid, otherUserUid].sort().join('_');

  useEffect(() => {
    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('createdAt', 'asc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      setMessages(msgs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [chatId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const text = inputText;
    setInputText('');

    try {
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        senderUid: currentUserUid,
        text,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] bg-white rounded-[3rem] border border-brand-primary/10 overflow-hidden shadow-gold relative">
      {/* Chat Header */}
      <div className="px-8 py-6 border-b border-brand-primary/5 bg-white flex items-center justify-between relative z-10">
        <div className="flex items-center gap-6">
          <button 
            onClick={onBack}
            className="w-12 h-12 flex items-center justify-center hover:bg-brand-cream rounded-2xl transition-all text-brand-primary group"
          >
            <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-brand-cream rounded-2xl flex items-center justify-center text-brand-primary shadow-inner overflow-hidden">
              <UserIcon className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-serif font-bold text-brand-primary">{otherDisplayName}</h3>
              <div className="flex items-center gap-2 text-[10px] text-green-600 font-bold uppercase tracking-widest">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-sm shadow-green-500/50" />
                <span>متصل الآن</span>
              </div>
            </div>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-brand-gold/5 rounded-xl border border-brand-gold/10 text-brand-gold">
          <Shield className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">محادثة آمنة</span>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-8 space-y-6 bg-[#FDFCF7]/50"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="p-5 bg-white/80 backdrop-blur-md rounded-[2rem] border border-brand-primary/5 text-center max-w-sm shadow-sm">
            <div className="w-10 h-10 bg-brand-gold/10 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Lock className="w-5 h-5 text-brand-gold" />
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed font-light">
              هذه المحادثة مشفرة وخاصة تماماً. نذكركم بضرورة الالتزام بآداب الحوار والقيم الإسلامية الرفيعة في رحلة البحث عن شريك الحياة.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-brand-primary border-t-brand-gold rounded-full animate-spin" />
          </div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id}
              className={cn(
                "flex w-full",
                msg.senderUid === currentUserUid ? "justify-start" : "justify-end"
              )}
            >
              <div 
                className={cn(
                  "max-w-[75%] px-6 py-4 rounded-[1.5rem] text-sm leading-relaxed shadow-sm transition-all hover:shadow-md",
                  msg.senderUid === currentUserUid 
                    ? "bg-brand-primary text-white rounded-tr-none" 
                    : "bg-white text-neutral-800 border border-brand-primary/5 rounded-tl-none"
                )}
              >
                <p className="font-light tracking-wide">{msg.text}</p>
                {msg.createdAt && (
                  <div className={cn(
                    "text-[9px] mt-2 font-bold uppercase tracking-tighter opacity-50",
                    msg.senderUid === currentUserUid ? "text-left" : "text-right"
                  )}>
                    {new Date(msg.createdAt.seconds * 1000).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input Area */}
      <form 
        onSubmit={handleSendMessage}
        className="p-6 bg-white border-t border-brand-primary/5 flex gap-4 items-center"
      >
        <div className="flex-1 relative">
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="اكتب رسالتك هنا..."
            className="w-full pl-6 pr-6 py-4 bg-brand-cream/30 rounded-2xl border border-brand-primary/5 focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary outline-none transition-all text-sm font-light"
          />
        </div>
        <button 
          type="submit"
          disabled={!inputText.trim()}
          className="w-14 h-14 bg-brand-primary text-white rounded-2xl flex items-center justify-center shadow-xl shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 group"
        >
          <Send className="w-6 h-6 rotate-180 group-hover:-translate-x-1 group-hover:translate-y-1 transition-transform" />
        </button>
      </form>
    </div>
  );
};
