import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  or,
  doc,
  getDoc,
  updateDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
import { sendNotification } from './Notifications';
import { 
  Heart, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  User as UserIcon,
  MessageCircle,
  ChevronRight,
  Check,
  X,
  Sparkles
} from 'lucide-react';
import { cn } from '../lib/utils';

interface MatchRequest {
  id: string;
  fromUid: string;
  toUid: string;
  status: 'pending' | 'accepted' | 'rejected';
  compatibilityScore?: number;
  analysis?: string;
  createdAt: any;
}

interface MatchWithProfile extends MatchRequest {
  otherProfile?: {
    displayName: string;
    photoURL?: string;
    gender: string;
    birthDate: string;
  };
}

export const Matches = ({ currentUserUid, onStartChat }: { currentUserUid: string, onStartChat: (uid: string, name: string) => void }) => {
  const [matches, setMatches] = useState<MatchWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'matches'),
      or(
        where('fromUid', '==', currentUserUid),
        where('toUid', '==', currentUserUid)
      )
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const matchesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MatchRequest[];

      // Fetch other user profiles
      const enrichedMatches = await Promise.all(
        matchesData.map(async (match) => {
          const otherUid = match.fromUid === currentUserUid ? match.toUid : match.fromUid;
          const profileDoc = await getDoc(doc(db, 'users', otherUid));
          return {
            ...match,
            otherProfile: profileDoc.exists() ? (profileDoc.data() as any) : undefined
          };
        })
      );

      setMatches(enrichedMatches);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUserUid]);

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="w-12 h-12 border-4 border-brand-primary border-t-brand-gold rounded-full"
        />
      </div>
    );
  }

  const pendingMatches = matches.filter(m => m.status === 'pending');
  const acceptedMatches = matches.filter(m => m.status === 'accepted');

  return (
    <div className="space-y-16">
      <section>
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 bg-brand-gold/10 rounded-2xl flex items-center justify-center text-brand-gold">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-4xl font-serif font-bold text-brand-primary">طلبات بانتظار الرد</h2>
            <p className="text-neutral-400 text-sm font-light">طلبات تواصل رسمية في انتظار قرارك أو قرار الطرف الآخر</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {pendingMatches.length > 0 ? (
            pendingMatches.map((match, i) => (
              <MatchCard 
                key={match.id} 
                match={match} 
                index={i} 
                isOwnRequest={match.fromUid === currentUserUid} 
                onStartChat={onStartChat}
                currentUserUid={currentUserUid}
              />
            ))
          ) : (
            <div className="col-span-full py-20 text-center bg-white/40 backdrop-blur-xl rounded-[3rem] border border-white/30 italic text-neutral-400">
              لا توجد طلبات معلقة حالياً.
            </div>
          )}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 bg-brand-secondary/10 rounded-2xl flex items-center justify-center text-brand-secondary">
            <Heart className="w-6 h-6 fill-current" />
          </div>
          <div>
            <h2 className="text-4xl font-serif font-bold text-brand-primary">مطابقات ناجحة</h2>
            <p className="text-neutral-400 text-sm font-light">الأعضاء الذين تم التوافق معهم وبدء رحلة التعارف</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {acceptedMatches.length > 0 ? (
            acceptedMatches.map((match, i) => (
              <MatchCard 
                key={match.id} 
                match={match} 
                index={i} 
                isOwnRequest={match.fromUid === currentUserUid} 
                onStartChat={onStartChat}
                currentUserUid={currentUserUid}
              />
            ))
          ) : (
            <div className="col-span-full py-20 text-center bg-white/40 backdrop-blur-xl rounded-[3rem] border border-white/30 italic text-neutral-400">
              لم يتم قبول أي مطابقات بعد.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

const MatchCard = ({ 
  match, 
  index, 
  isOwnRequest,
  onStartChat,
  currentUserUid
}: { 
  match: MatchWithProfile, 
  index: number, 
  isOwnRequest: boolean,
  onStartChat: (uid: string, name: string) => void,
  currentUserUid: string
}) => {
  const [processing, setProcessing] = useState(false);

  const handleStatusUpdate = async (newStatus: 'accepted' | 'rejected') => {
    setProcessing(true);
    try {
      await updateDoc(doc(db, 'matches', match.id), { status: newStatus });
      
      await sendNotification({
        userId: match.fromUid,
        title: newStatus === 'accepted' ? 'تم قبول طلب المطابقة' : 'تم رفض طلب المطابقة',
        message: `${newStatus === 'accepted' ? 'وافق' : 'اعتذر'} الطرف الآخر عن طلب المطابقة الخاص بك.`,
        type: newStatus === 'accepted' ? 'match_accepted' : 'match_rejected',
        relatedId: match.id
      });
    } catch (error) {
      console.error("Error updating match status:", error);
    } finally {
      setProcessing(false);
    }
  };

  const statusColors = {
    pending: 'bg-brand-gold/10 text-brand-gold border-brand-gold/20',
    accepted: 'bg-brand-secondary/10 text-brand-secondary border-brand-secondary/20',
    rejected: 'bg-neutral-100 text-neutral-500 border-neutral-200'
  };

  const statusLabels = {
    pending: 'قيد الانتظار',
    accepted: 'تمت المطابقة',
    rejected: 'تم الاعتذار'
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-[3rem] p-10 border border-brand-primary/5 hover:border-brand-primary/10 hover:shadow-gold transition-all duration-500 group relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-40 h-40 bg-brand-gold/5 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-brand-gold/10 transition-all" />
      
      <div className="flex items-start justify-between mb-10 relative z-10">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-brand-cream rounded-[2rem] flex items-center justify-center text-brand-primary shadow-inner group-hover:scale-105 transition-transform overflow-hidden">
            <img src={match.otherProfile?.photoURL || `https://ui-avatars.com/api/?name=${match.otherProfile?.displayName}&background=random`} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <div>
            <h3 className="text-3xl font-serif font-bold text-brand-primary mb-2">{match.otherProfile?.displayName || 'مستخدم مودة'}</h3>
            <div className={cn(
              "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border shadow-sm",
              statusColors[match.status as keyof typeof statusColors]
            )}>
              {match.status === 'pending' ? <Clock className="w-3.5 h-3.5" /> : match.status === 'accepted' ? <Heart className="w-3.5 h-3.5 fill-current" /> : <XCircle className="w-3.5 h-3.5" />}
              {statusLabels[match.status as keyof typeof statusLabels]}
            </div>
          </div>
        </div>
        
        {match.compatibilityScore && (
          <div className="text-center bg-brand-gold/5 p-4 rounded-[1.5rem] border border-brand-gold/10 shadow-sm">
            <span className="block text-2xl font-bold text-brand-gold leading-none mb-1">{match.compatibilityScore}%</span>
            <span className="text-[9px] font-bold text-brand-gold uppercase tracking-[0.2em]">توافق</span>
          </div>
        )}
      </div>

      <div className="space-y-6 mb-10 relative z-10">
        <div className="flex items-start gap-4 text-base text-neutral-500">
          <div className="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-brand-gold" />
          </div>
          <p className="line-clamp-2 leading-relaxed italic font-light">
            {match.analysis || "تحليل التوافق الذكي متاح للمطابقات المقبولة لبناء جسور التفاهم."}
          </p>
        </div>
      </div>

      <div className="flex gap-4 relative z-10">
        {match.status === 'pending' && !isOwnRequest ? (
          <div className="flex gap-4 w-full">
            <button 
              onClick={() => handleStatusUpdate('accepted')}
              disabled={processing}
              className="flex-1 py-5 bg-brand-primary text-white rounded-[1.5rem] font-bold text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl shadow-brand-primary/20"
            >
              <Check className="w-5 h-5" />
              <span>قبول الطلب</span>
            </button>
            <button 
              onClick={() => handleStatusUpdate('rejected')}
              disabled={processing}
              className="flex-1 py-5 bg-brand-cream text-brand-secondary rounded-[1.5rem] font-bold text-xs uppercase tracking-widest hover:bg-brand-secondary hover:text-white transition-all flex items-center justify-center gap-3"
            >
              <X className="w-5 h-5" />
              <span>اعتذار</span>
            </button>
          </div>
        ) : (
          <>
            <button className="flex-1 py-5 bg-brand-cream text-brand-primary rounded-[1.5rem] font-bold text-xs uppercase tracking-widest hover:bg-brand-primary hover:text-white transition-all flex items-center justify-center gap-3 group/btn">
              <span>عرض الملف الكامل</span>
              <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
            </button>
            {match.status === 'accepted' && (
              <button 
                onClick={() => onStartChat(
                  isOwnRequest ? match.toUid : match.fromUid, 
                  match.otherProfile?.displayName || ''
                )}
                className="w-16 h-16 bg-brand-secondary text-white rounded-[1.5rem] flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-xl shadow-brand-secondary/30 group/chat"
              >
                <MessageCircle className="w-7 h-7 group-hover/chat:rotate-12 transition-transform" />
              </button>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
};
