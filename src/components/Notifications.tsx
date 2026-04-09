import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  updateDoc, 
  doc, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  Heart, 
  CheckCircle2, 
  XCircle, 
  MessageCircle,
  Circle
} from 'lucide-react';
import { cn } from '../lib/utils';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'match_request' | 'match_accepted' | 'match_rejected';
  relatedId?: string;
  isRead: boolean;
  createdAt: any;
}

export const sendNotification = async (notification: Omit<Notification, 'id' | 'isRead' | 'createdAt'>) => {
  try {
    await addDoc(collection(db, 'notifications'), {
      ...notification,
      isRead: false,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};

export const NotificationsDropdown = ({ 
  currentUserUid, 
  onClose 
}: { 
  currentUserUid: string; 
  onClose: () => void;
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', currentUserUid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];
      setNotifications(msgs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUserUid]);

  const markAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { isRead: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'match_request': return <Heart className="w-4 h-4 text-brand-gold" />;
      case 'match_accepted': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'match_rejected': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Bell className="w-4 h-4 text-brand-primary" />;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className="absolute top-full left-0 mt-4 w-96 bg-white rounded-[2.5rem] shadow-gold border border-brand-primary/10 overflow-hidden z-[100]"
    >
      <div className="p-6 border-b border-brand-primary/5 bg-white flex justify-between items-center">
        <h3 className="text-xl font-serif font-bold text-brand-primary">التنبيهات</h3>
        {notifications.some(n => !n.isRead) && (
          <div className="px-3 py-1 bg-brand-secondary/10 text-brand-secondary rounded-full border border-brand-secondary/20">
            <span className="text-[9px] font-bold uppercase tracking-widest">
              جديد
            </span>
          </div>
        )}
      </div>

      <div className="max-h-[30rem] overflow-y-auto">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-3 border-brand-primary border-t-brand-gold rounded-full animate-spin mx-auto" />
          </div>
        ) : notifications.length > 0 ? (
          <div className="divide-y divide-brand-primary/5">
            {notifications.map((n) => (
              <div 
                key={n.id}
                onClick={() => markAsRead(n.id)}
                className={cn(
                  "p-6 hover:bg-brand-cream/30 transition-all cursor-pointer flex gap-4 items-start group",
                  !n.isRead && "bg-brand-primary/5"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                  !n.isRead ? "bg-brand-primary/10 text-brand-primary" : "bg-neutral-50 text-neutral-400"
                )}>
                  {getIcon(n.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <p className={cn("text-sm font-bold", !n.isRead ? "text-brand-primary" : "text-neutral-600")}>
                      {n.title}
                    </p>
                    {!n.isRead && <div className="w-2 h-2 bg-brand-secondary rounded-full shadow-sm shadow-brand-secondary/50" />}
                  </div>
                  <p className="text-xs text-neutral-500 leading-relaxed font-light italic">
                    {n.message}
                  </p>
                  <p className="text-[9px] text-neutral-400 mt-3 font-bold uppercase tracking-widest">
                    {n.createdAt ? new Date(n.createdAt.seconds * 1000).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : 'الآن'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-neutral-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-neutral-200" />
            </div>
            <p className="text-sm text-neutral-400 font-light">لا توجد تنبيهات حالياً</p>
          </div>
        )}
      </div>
      
      <div className="p-4 bg-brand-cream/10 text-center border-t border-brand-primary/5">
        <button 
          onClick={onClose}
          className="text-[10px] font-bold text-brand-primary uppercase tracking-[0.2em] hover:text-brand-secondary transition-colors"
        >
          إغلاق النافذة
        </button>
      </div>
    </motion.div>
  );
};
