import { useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  User
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  query, 
  where, 
  onSnapshot,
  serverTimestamp,
  getDocFromServer,
  addDoc,
  updateDoc
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Matches } from './components/Matches';
import { Chat } from './components/Chat';
import { analyzeAssessment } from './services/geminiService';
import { Assessment, AssessmentData } from './components/Assessment';
import { NotificationsDropdown, sendNotification } from './components/Notifications';
import { 
  Heart, 
  Shield, 
  User as UserIcon, 
  LogOut, 
  Sparkles, 
  Lock, 
  CheckCircle2,
  ChevronRight,
  MessageCircle,
  Users,
  Compass,
  BrainCircuit,
  Bell,
  Clock
} from 'lucide-react';
import { cn } from './lib/utils';

// --- Types ---
interface UserProfile {
  uid: string;
  displayName: string;
  photoURL?: string;
  role: 'client' | 'admin';
  gender: 'male' | 'female';
  birthDate: string;
  bio: string;
  values: string[];
  goals: string;
  isPublic: boolean;
  isVerified?: boolean;
  createdAt: any;
  assessment?: AssessmentData;
  aiAnalysis?: {
    profileTitle: string;
    detailedAnalysis: string;
  };
}

// --- Components ---

const Navbar = ({ user, profile, onSignOut, currentView, setView }: { user: User | null, profile: UserProfile | null, onSignOut: () => void, currentView: string, setView: (v: string) => void }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      where('isRead', '==', false)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUnreadCount(snapshot.size);
    });
    return () => unsubscribe();
  }, [user]);

  const isAdmin = profile?.role === 'admin';

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50 glass rounded-[2.5rem] px-10 py-4 flex justify-between items-center shadow-premium">
      <div className="flex items-center gap-12">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView('dashboard')}>
          <div className="w-12 h-12 premium-gradient rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand-primary/20 group-hover:scale-110 transition-transform">
            <Heart className="w-7 h-7 fill-current text-brand-gold" />
          </div>
          <span className="text-3xl font-serif font-bold text-brand-primary tracking-tight">مودة</span>
        </div>

        {user && profile && (
          <div className="hidden md:flex items-center gap-10">
            <button 
              onClick={() => setView('dashboard')}
              className={cn(
                "flex items-center gap-2 text-sm font-bold transition-all relative py-1 uppercase tracking-[0.1em]",
                currentView === 'dashboard' ? "text-brand-primary" : "text-neutral-400 hover:text-brand-primary"
              )}
            >
              <Compass className="w-4 h-4" />
              <span>{isAdmin ? 'لوحة التحكم' : 'اكتشاف'}</span>
              {currentView === 'dashboard' && (
                <motion.div layoutId="nav-active" className="absolute -bottom-1 left-0 right-0 h-0.5 bg-brand-gold rounded-full" />
              )}
            </button>
            {!isAdmin && (
              <button 
                onClick={() => setView('matches')}
                className={cn(
                  "flex items-center gap-2 text-sm font-bold transition-all relative py-1 uppercase tracking-[0.1em]",
                  currentView === 'matches' ? "text-brand-primary" : "text-neutral-400 hover:text-brand-primary"
                )}
              >
                <Heart className="w-4 h-4" />
                <span>المطابقات</span>
                {currentView === 'matches' && (
                  <motion.div layoutId="nav-active" className="absolute -bottom-1 left-0 right-0 h-0.5 bg-brand-gold rounded-full" />
                )}
              </button>
            )}
          </div>
        )}
      </div>
      
      {user && (
        <div className="flex items-center gap-8">
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-3.5 hover:bg-brand-primary/5 rounded-2xl transition-all text-neutral-500 relative group"
            >
              <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              {unreadCount > 0 && (
                <span className="absolute top-2.5 right-2.5 w-4 h-4 bg-brand-secondary text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-white shadow-rose">
                  {unreadCount}
                </span>
              )}
            </button>
            <AnimatePresence>
              {showNotifications && (
                <NotificationsDropdown 
                  currentUserUid={user.uid} 
                  onClose={() => setShowNotifications(false)} 
                />
              )}
            </AnimatePresence>
          </div>

          <div className="h-8 w-px bg-neutral-200 hidden sm:block" />

          <div className="flex items-center gap-5">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-brand-primary leading-none mb-1">{user.displayName?.split(' ')[0]}</p>
              <button onClick={onSignOut} className="text-[10px] font-bold text-neutral-400 hover:text-brand-secondary transition-colors uppercase tracking-[0.2em]">خروج</button>
            </div>
            <div className="w-12 h-12 rounded-2xl border-2 border-brand-primary/10 overflow-hidden shadow-soft hover:border-brand-gold/50 transition-colors cursor-pointer">
              <img src={user.photoURL || ''} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

const LandingHero = ({ onSignIn }: { onSignIn: () => void }) => (
  <div className="min-h-screen flex flex-col items-center justify-center px-6 pt-20 text-center relative overflow-hidden">
    {/* Immersive Background */}
    <div className="absolute inset-0 z-0">
      <img 
        src="https://picsum.photos/seed/luxury-pattern/1920/1080?blur=10" 
        alt="" 
        className="w-full h-full object-cover opacity-[0.03]"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-brand-cream/0 via-brand-cream/50 to-brand-cream" />
    </div>

    {/* Decorative Elements */}
    <div className="absolute top-1/4 -left-20 w-80 h-80 bg-brand-primary/5 rounded-full blur-3xl animate-pulse" />
    <div className="absolute bottom-1/4 -right-20 w-[30rem] h-[30rem] bg-brand-gold/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
    
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl relative z-10"
    >
      <div className="inline-flex items-center gap-2 px-6 py-2.5 bg-white/80 backdrop-blur-xl text-brand-gold rounded-full text-[10px] font-bold uppercase tracking-[0.3em] mb-12 border border-brand-gold/20 shadow-premium">
        <Sparkles className="w-4 h-4" />
        <span>بوابة الزواج الرقمية الفاخرة</span>
      </div>
      
      <h1 className="text-7xl md:text-[10rem] font-serif font-bold text-brand-primary mb-12 leading-[0.9] text-balance tracking-tight">
        ابحث عن شريك حياتك <br />
        <span className="text-gold-gradient italic font-medium">بذكاء ووقار</span>
      </h1>
      
      <p className="text-2xl text-neutral-500 mb-20 max-w-3xl mx-auto leading-relaxed text-balance font-light italic">
        مودة هي منصة تجمع بين الأصالة والتقنية، نستخدم الذكاء الاصطناعي لتقريب المسافات بين القلوب الباحثة عن الاستقرار في بيئة آمنة ومحترمة.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
        <button 
          onClick={onSignIn}
          className="px-16 py-7 premium-gradient text-white rounded-[2.5rem] font-bold text-xl shadow-premium hover:scale-105 hover:shadow-brand-primary/40 transition-all flex items-center gap-4 group"
        >
          <span>ابدأ رحلتك الآن</span>
          <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
        </button>
        
        <div className="flex items-center gap-5 px-10 py-6 bg-white/80 backdrop-blur-2xl rounded-[2.5rem] border border-white/40 shadow-premium">
          <div className="flex -space-x-4 rtl:space-x-reverse">
            {[1,2,3,4].map(i => (
              <div key={i} className="w-14 h-14 rounded-2xl border-4 border-white bg-neutral-200 overflow-hidden shadow-soft">
                <img src={`https://picsum.photos/seed/${i+20}/100/100`} alt="User" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-brand-primary leading-none mb-1">+15,000</p>
            <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-[0.2em]">عضو يبحثون عن المودة</p>
          </div>
        </div>
      </div>
    </motion.div>

    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl w-full px-6"
    >
      {[
        { icon: Shield, title: "خصوصية تامة", desc: "بياناتك مشفرة ومحمية، وأنت من يقرر من يراها." },
        { icon: BrainCircuit, title: "مطابقة ذكية", desc: "خوارزميات متقدمة تحلل التوافق النفسي والقيمي." },
        { icon: Heart, title: "زواج جاد", desc: "مجتمع يركز على بناء أسر مستقرة وفق قيمنا الأصيلة." }
      ].map((feature, i) => (
        <div key={i} className="p-10 bg-white/40 backdrop-blur-xl rounded-[3rem] border border-white/30 shadow-soft text-center group hover:bg-white hover:shadow-gold transition-all duration-500">
          <div className="w-16 h-16 premium-gradient rounded-2xl flex items-center justify-center text-brand-gold mx-auto mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-lg">
            <feature.icon className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-serif font-bold text-brand-primary mb-4">{feature.title}</h3>
          <p className="text-base text-neutral-500 leading-relaxed font-light">{feature.desc}</p>
        </div>
      ))}
    </motion.div>

    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.5, duration: 1 }}
      className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 opacity-30"
    >
      <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-primary">اكتشف المزيد</span>
      <div className="w-px h-12 bg-gradient-to-b from-brand-primary to-transparent" />
    </motion.div>
  </div>
);

const ProfileSetup = ({ user, onComplete }: { user: User, onComplete: (profile: UserProfile) => void }) => {
  const [step, setStep] = useState(-1); // -1: Role Selection, 0: Assessment, 1: AI Result, 2: Basic Info, 3: Bio/Goals, 4: Privacy
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null);
  const [aiResult, setAiResult] = useState<{ profileTitle: string, detailedAnalysis: string } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const [formData, setFormData] = useState({
    role: 'client' as 'client' | 'admin',
    gender: 'male' as 'male' | 'female',
    birthDate: '',
    bio: '',
    values: [] as string[],
    goals: '',
    isPublic: true
  });

  const handleAssessmentComplete = async (data: AssessmentData) => {
    setAssessmentData(data);
    setIsAnalyzing(true);
    setStep(1);
    
    try {
      const result = await analyzeAssessment(data);
      setAiResult(result);
    } catch (error) {
      console.error("AI Analysis error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async () => {
    const profile: UserProfile = {
      uid: user.uid,
      displayName: user.displayName || 'مستخدم مودة',
      ...formData,
      assessment: assessmentData || undefined,
      aiAnalysis: aiResult || undefined,
      createdAt: serverTimestamp()
    };
    
    try {
      await setDoc(doc(db, 'users', user.uid), profile);
      onComplete(profile);
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 flex justify-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "w-full bg-white rounded-[3rem] p-12 shadow-2xl shadow-brand-primary/5 border border-brand-primary/10 transition-all relative overflow-hidden",
          step <= 1 ? "max-w-4xl" : "max-w-xl"
        )}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
        
        <div className="flex justify-between items-center mb-12 relative z-10">
          <h2 className="text-4xl font-serif font-bold text-brand-primary">
            {step === -1 ? 'نوع الحساب' : step === 0 ? 'اختبار التوافق' : step === 1 ? 'تحليل الشخصية الذكي' : 'إكمال الملف الشخصي'}
          </h2>
          <div className="px-4 py-1.5 bg-brand-cream rounded-full border border-brand-primary/5 shadow-sm">
            <span className="text-[10px] font-bold text-brand-primary uppercase tracking-[0.2em]">
              {step === -1 ? 'البداية' : step === 0 ? 'التقييم' : `خطوة ${step} من 4`}
            </span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === -1 && (
            <motion.div 
              key="role-selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-10"
            >
              <div className="text-center mb-10">
                <p className="text-neutral-500 font-light text-lg">يرجى اختيار نوع الحساب للمتابعة في منصة مودة</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <button
                  onClick={() => {
                    setFormData({ ...formData, role: 'client' });
                    setStep(0);
                  }}
                  className="p-10 rounded-[2.5rem] border-2 border-neutral-100 hover:border-brand-primary bg-neutral-50/50 hover:bg-brand-primary/5 transition-all group text-right relative overflow-hidden"
                >
                  <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary mb-6 group-hover:scale-110 transition-transform">
                    <Users className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-brand-primary mb-2">عميل (باحث عن شريك)</h3>
                  <p className="text-sm text-neutral-500 font-light leading-relaxed">ابحث عن شريك حياتك باستخدام تقنيات الذكاء الاصطناعي في بيئة آمنة.</p>
                  <div className="absolute -bottom-4 -right-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Users className="w-32 h-32" />
                  </div>
                </button>

                <button
                  onClick={() => {
                    setFormData({ ...formData, role: 'admin' });
                    setStep(2); // Skip assessment for admin
                  }}
                  className="p-10 rounded-[2.5rem] border-2 border-neutral-100 hover:border-brand-secondary bg-neutral-50/50 hover:bg-brand-secondary/5 transition-all group text-right relative overflow-hidden"
                >
                  <div className="w-16 h-16 bg-brand-secondary/10 rounded-2xl flex items-center justify-center text-brand-secondary mb-6 group-hover:scale-110 transition-transform">
                    <Shield className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-brand-primary mb-2">مشرف (إدارة المنصة)</h3>
                  <p className="text-sm text-neutral-500 font-light leading-relaxed">إدارة المستخدمين، مراجعة الطلبات، ومتابعة إحصائيات المنصة.</p>
                  <div className="absolute -bottom-4 -right-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Shield className="w-32 h-32" />
                  </div>
                </button>
              </div>
            </motion.div>
          )}

          {step === 0 && (
            <motion.div key="assessment">
              <Assessment onComplete={handleAssessmentComplete} />
            </motion.div>
          )}

          {step === 1 && (
            <motion.div 
              key="ai-result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {isAnalyzing ? (
                <div className="py-20 text-center space-y-6">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full mx-auto"
                  />
                  <div className="space-y-2">
                    <h3 className="text-xl font-serif font-bold text-brand-primary">جاري تحليل إجاباتك...</h3>
                    <p className="text-neutral-500">يقوم مساعد مودة الذكي برسم ملامح شخصيتك الآن.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="p-8 bg-brand-cream rounded-[2rem] border border-brand-primary/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <BrainCircuit className="w-32 h-32" />
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-4">
                        <Sparkles className="w-6 h-6 text-brand-gold" />
                        <span className="text-xs font-bold uppercase tracking-widest text-brand-gold">نتيجة التقييم</span>
                      </div>
                      <h3 className="text-4xl font-serif font-bold text-brand-primary mb-6">{aiResult?.profileTitle}</h3>
                      <p className="text-lg text-neutral-700 leading-relaxed italic">
                        "{aiResult?.detailedAnalysis}"
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <button 
                      onClick={() => setStep(2)}
                      className="px-12 py-5 premium-gradient text-white rounded-[2rem] font-bold text-lg shadow-2xl shadow-brand-primary/30 hover:scale-105 transition-all flex items-center gap-4 group"
                    >
                      <span>متابعة إعداد الملف</span>
                      <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-xs font-bold text-brand-primary uppercase tracking-[0.2em] mb-4">الجنس</label>
                <div className="grid grid-cols-2 gap-6">
                  {['male', 'female'].map((g) => (
                    <button
                      key={g}
                      onClick={() => setFormData({ ...formData, gender: g as any })}
                      className={cn(
                        "py-5 rounded-[1.5rem] border-2 transition-all font-bold text-sm uppercase tracking-widest",
                        formData.gender === g 
                          ? "border-brand-primary bg-brand-primary/5 text-brand-primary shadow-soft" 
                          : "border-neutral-50 text-neutral-400 hover:border-brand-primary/20 bg-neutral-50/50"
                      )}
                    >
                      {g === 'male' ? 'ذكر' : 'أنثى'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-primary uppercase tracking-[0.2em] mb-4">تاريخ الميلاد</label>
                <input 
                  type="date" 
                  className="w-full px-6 py-4 rounded-[1.5rem] border border-neutral-100 bg-neutral-50/50 focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary outline-none transition-all font-medium text-brand-primary"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                />
              </div>
              <button 
                onClick={() => setStep(3)}
                disabled={!formData.birthDate}
                className="w-full py-5 premium-gradient text-white rounded-[1.5rem] font-bold text-sm uppercase tracking-widest disabled:opacity-50 shadow-xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                المتابعة
              </button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-xs font-bold text-brand-primary uppercase tracking-[0.2em] mb-4">نبذة عنك</label>
                <textarea 
                  rows={4}
                  placeholder="تحدث عن شخصيتك، اهتماماتك..."
                  className="w-full px-6 py-4 rounded-[1.5rem] border border-neutral-100 bg-neutral-50/50 focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary outline-none transition-all resize-none font-light text-brand-primary"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-primary uppercase tracking-[0.2em] mb-4">أهدافك من الزواج</label>
                <textarea 
                  rows={4}
                  placeholder="ماذا تبحث في شريك حياتك؟"
                  className="w-full px-6 py-4 rounded-[1.5rem] border border-neutral-100 bg-neutral-50/50 focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary outline-none transition-all resize-none font-light text-brand-primary"
                  value={formData.goals}
                  onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                />
              </div>
              <div className="flex gap-4">
                <button onClick={() => setStep(2)} className="flex-1 py-5 bg-brand-cream text-brand-primary rounded-[1.5rem] font-bold text-xs uppercase tracking-widest hover:bg-brand-primary hover:text-white transition-all">السابق</button>
                <button onClick={() => setStep(4)} className="flex-1 py-5 premium-gradient text-white rounded-[1.5rem] font-bold text-xs uppercase tracking-widest shadow-xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">المتابعة</button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div 
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="p-8 bg-brand-cream rounded-[2rem] border border-brand-primary/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <Shield className="w-32 h-32" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-brand-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-primary/20">
                      <Shield className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-brand-primary">إعدادات الخصوصية</h3>
                  </div>
                  <p className="text-base text-neutral-600 mb-8 leading-relaxed font-light italic">
                    يمكنك اختيار جعل ملفك الشخصي عاماً ليتمكن الآخرون من رؤيتك وطلب المطابقة، أو إبقاءه خاصاً والبحث بنفسك.
                  </p>
                  <label className="flex items-center gap-4 cursor-pointer group">
                    <div className={cn(
                      "w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all",
                      formData.isPublic ? "border-brand-primary bg-brand-primary" : "border-neutral-300 group-hover:border-brand-primary/30"
                    )}>
                      {formData.isPublic && <CheckCircle2 className="w-5 h-5 text-white" />}
                      <input 
                        type="checkbox" 
                        checked={formData.isPublic}
                        onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                        className="sr-only"
                      />
                    </div>
                    <span className="font-bold text-brand-primary text-sm uppercase tracking-widest">جعل الملف الشخصي عاماً</span>
                  </label>
                </div>
              </div>
              
              <div className="flex gap-4">
                <button onClick={() => setStep(3)} className="flex-1 py-5 bg-brand-cream text-brand-primary rounded-[1.5rem] font-bold text-xs uppercase tracking-widest hover:bg-brand-primary hover:text-white transition-all">السابق</button>
                <button onClick={handleSubmit} className="flex-1 py-5 premium-gradient text-white rounded-[1.5rem] font-bold text-xs uppercase tracking-widest shadow-xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">إنهاء الإعداد</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

const AdminDashboard = ({ profile }: { profile: UserProfile }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalMatches: 0, pendingRequests: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all users
    const q = query(collection(db, 'users'));
    const unsubscribeUsers = onSnapshot(q, (snapshot) => {
      const usersList = snapshot.docs.map(doc => doc.data() as UserProfile);
      setUsers(usersList);
      setStats(prev => ({ ...prev, totalUsers: snapshot.size }));
      setLoading(false);
    });

    // Fetch matches stats
    const qMatches = query(collection(db, 'matches'));
    const unsubscribeMatches = onSnapshot(qMatches, (snapshot) => {
      const matches = snapshot.docs.map(doc => doc.data());
      setStats(prev => ({ 
        ...prev, 
        totalMatches: matches.filter(m => m.status === 'accepted').length,
        pendingRequests: matches.filter(m => m.status === 'pending').length
      }));
    });

    return () => {
      unsubscribeUsers();
      unsubscribeMatches();
    };
  }, []);

  const toggleVerification = async (uid: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'users', uid), { isVerified: !currentStatus });
    } catch (error) {
      console.error("Error updating verification status:", error);
    }
  };

  const toggleRole = async (uid: string, currentRole: 'client' | 'admin') => {
    if (uid === profile.uid) {
      alert("لا يمكنك تغيير دورك الخاص.");
      return;
    }
    try {
      const newRole = currentRole === 'admin' ? 'client' : 'admin';
      await updateDoc(doc(db, 'users', uid), { role: newRole });
    } catch (error) {
      console.error("Error updating user role:", error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 pt-32 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Stats Section */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {[
            { label: 'إجمالي المستخدمين', value: stats.totalUsers, icon: Users, color: 'bg-brand-primary', shadow: 'shadow-brand-primary/20' },
            { label: 'مطابقات ناجحة', value: stats.totalMatches, icon: Heart, color: 'bg-brand-secondary', shadow: 'shadow-brand-secondary/20' },
            { label: 'طلبات معلقة', value: stats.pendingRequests, icon: Clock, color: 'bg-brand-gold', shadow: 'shadow-brand-gold/20' }
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-[3rem] p-10 border border-brand-primary/5 shadow-premium flex items-center gap-8 group hover:shadow-gold transition-all relative overflow-hidden"
            >
              <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-brand-primary/5 rounded-full blur-3xl group-hover:bg-brand-primary/10 transition-all" />
              <div className={cn("w-20 h-20 rounded-[2rem] flex items-center justify-center text-white shadow-2xl relative z-10", stat.color, stat.shadow)}>
                <stat.icon className="w-10 h-10" />
              </div>
              <div className="relative z-10">
                <p className="text-5xl font-bold text-brand-primary leading-none mb-2">{stat.value}</p>
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.3em]">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Users Table */}
        <div className="lg:col-span-3 bg-white rounded-[4rem] p-12 border border-brand-primary/5 shadow-premium overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-primary via-brand-gold to-brand-secondary opacity-20" />
          
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-4xl font-serif font-bold text-brand-primary mb-3">إدارة المستخدمين</h2>
              <p className="text-neutral-400 text-base font-light italic">قائمة بجميع الأعضاء المسجلين في المنصة</p>
            </div>
            <div className="flex gap-4">
              <div className="px-8 py-4 bg-brand-cream rounded-[2rem] border border-brand-primary/5 flex items-center gap-4 shadow-inner">
                <div className="w-2 h-2 rounded-full bg-brand-gold animate-pulse" />
                <span className="text-sm font-bold text-brand-primary uppercase tracking-widest">{users.length} عضو نشط</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="border-b border-neutral-50">
                  <th className="pb-8 text-[10px] font-bold text-neutral-400 uppercase tracking-[0.3em]">المستخدم</th>
                  <th className="pb-8 text-[10px] font-bold text-neutral-400 uppercase tracking-[0.3em]">النوع</th>
                  <th className="pb-8 text-[10px] font-bold text-neutral-400 uppercase tracking-[0.3em]">الجنس</th>
                  <th className="pb-8 text-[10px] font-bold text-neutral-400 uppercase tracking-[0.3em]">الحالة</th>
                  <th className="pb-8 text-[10px] font-bold text-neutral-400 uppercase tracking-[0.3em]">تاريخ التسجيل</th>
                  <th className="pb-8 text-[10px] font-bold text-neutral-400 uppercase tracking-[0.3em]">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {users.map((u) => (
                  <tr key={u.uid} className="group hover:bg-brand-cream/30 transition-all duration-300">
                    <td className="py-8">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl border-2 border-white overflow-hidden shadow-soft group-hover:scale-110 transition-transform">
                          <img src={u.photoURL || `https://ui-avatars.com/api/?name=${u.displayName}`} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div>
                          <p className="font-bold text-brand-primary text-lg">{u.displayName}</p>
                          <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">{u.uid.substring(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-8">
                      <button 
                        onClick={() => toggleRole(u.uid, u.role)}
                        className={cn(
                          "px-5 py-2 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] border transition-all hover:scale-105 active:scale-95 shadow-sm",
                          u.role === 'admin' ? "bg-brand-secondary/10 text-brand-secondary border-brand-secondary/20 hover:bg-brand-secondary hover:text-white" : "bg-brand-primary/10 text-brand-primary border-brand-primary/20 hover:bg-brand-primary hover:text-white"
                        )}
                      >
                        {u.role === 'admin' ? 'مشرف' : 'عميل'}
                      </button>
                    </td>
                    <td className="py-8">
                      <span className="text-sm font-medium text-neutral-600 italic">{u.gender === 'male' ? 'ذكر' : 'أنثى'}</span>
                    </td>
                    <td className="py-8">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-2.5 h-2.5 rounded-full",
                          u.isVerified ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" : "bg-neutral-300"
                        )} />
                        <span className="text-xs font-bold text-neutral-600 uppercase tracking-widest">{u.isVerified ? 'موثق' : 'غير موثق'}</span>
                      </div>
                    </td>
                    <td className="py-8">
                      <span className="text-xs font-medium text-neutral-400 font-mono">{u.createdAt ? new Date(u.createdAt.seconds * 1000).toLocaleDateString('ar-EG') : '-'}</span>
                    </td>
                    <td className="py-8">
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => toggleVerification(u.uid, !!u.isVerified)}
                          className={cn(
                            "p-3 rounded-2xl transition-all hover:scale-110 active:scale-90 shadow-sm",
                            u.isVerified ? "text-green-500 bg-green-50 border border-green-100" : "text-neutral-300 bg-neutral-50 border border-neutral-100 hover:text-brand-primary hover:border-brand-primary/20"
                          )}
                          title={u.isVerified ? "إلغاء التوثيق" : "توثيق الحساب"}
                        >
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => toggleRole(u.uid, u.role)}
                          className="p-3 rounded-2xl text-neutral-300 bg-neutral-50 border border-neutral-100 hover:text-brand-secondary hover:bg-brand-secondary/5 hover:border-brand-secondary/20 transition-all hover:scale-110 active:scale-90 shadow-sm"
                          title="تغيير الدور"
                        >
                          <Shield className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard = ({ user, profile }: { user: User, profile: UserProfile }) => {
  const [publicProfiles, setPublicProfiles] = useState<UserProfile[]>([]);
  const [requestingMatch, setRequestingMatch] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'users'), 
      where('isPublic', '==', true),
      where('gender', '!=', profile.gender)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const profiles = snapshot.docs.map(doc => doc.data() as UserProfile);
      setPublicProfiles(profiles);
    });

    return () => unsubscribe();
  }, [profile.gender]);

  const handleRequestMatch = async (targetUser: UserProfile) => {
    setRequestingMatch(targetUser.uid);
    try {
      const matchRef = await addDoc(collection(db, 'matches'), {
        fromUid: user.uid,
        toUid: targetUser.uid,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      await sendNotification({
        userId: targetUser.uid,
        title: 'طلب مطابقة جديد',
        message: `أرسل لك ${profile.displayName} طلب مطابقة.`,
        type: 'match_request',
        relatedId: matchRef.id
      });
      
    } catch (error) {
      console.error("Error requesting match:", error);
    } finally {
      setRequestingMatch(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      {/* Sidebar / Profile Summary */}
      <div className="lg:col-span-1 space-y-8">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="premium-gradient rounded-[3rem] p-10 text-white shadow-premium relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-white/20 transition-all" />
            <div className="flex flex-col items-center text-center relative z-10">
              <div className="relative mb-8">
                <div className="w-36 h-36 rounded-[3rem] border-4 border-white/20 p-1 shadow-2xl group-hover:scale-105 transition-transform bg-white/10 overflow-hidden">
                  <img src={user.photoURL || ''} alt="Me" className="w-full h-full object-cover rounded-[2.5rem]" referrerPolicy="no-referrer" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-brand-gold rounded-2xl flex items-center justify-center border-4 border-brand-primary shadow-premium">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
              </div>
              
              <h2 className="text-4xl font-serif font-bold mb-2 tracking-tight">{profile.displayName}</h2>
              <div className="px-5 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-12">
                <p className="text-brand-gold font-bold text-[10px] uppercase tracking-[0.4em]">عضو موثق ومتميز</p>
              </div>
              
              <div className="grid grid-cols-2 gap-6 w-full">
                <div className="bg-white/10 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/10 group/stat hover:bg-white/20 transition-colors">
                  <p className="text-4xl font-bold leading-none mb-2">0</p>
                  <p className="text-[10px] text-white/60 font-bold uppercase tracking-[0.2em] group-hover:text-white transition-colors">مطابقات</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/10 group/stat hover:bg-white/20 transition-colors">
                  <p className="text-4xl font-bold leading-none mb-2">0</p>
                  <p className="text-[10px] text-white/60 font-bold uppercase tracking-[0.2em] group-hover:text-white transition-colors">طلبات</p>
                </div>
              </div>
            </div>
          </motion.div>

          {profile.aiAnalysis && (
            <div className="bg-white/80 backdrop-blur-xl rounded-[3rem] p-10 border border-brand-primary/5 shadow-soft relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-gold/5 rounded-full blur-3xl group-hover:bg-brand-gold/10 transition-all" />
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-brand-gold/10 rounded-2xl flex items-center justify-center text-brand-gold shadow-sm">
                    <BrainCircuit className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-[0.3em] text-brand-gold mb-1">تحليل الذكاء الاصطناعي</span>
                    <h3 className="text-xl font-serif font-bold text-brand-primary">رؤية مودة الذكية</h3>
                  </div>
                </div>
                <h4 className="text-3xl font-serif font-bold text-brand-primary mb-6 leading-tight text-gold-gradient">{profile.aiAnalysis.profileTitle}</h4>
                <div className="bg-brand-cream/50 p-8 rounded-[2rem] border border-brand-primary/5 relative">
                  <div className="absolute top-4 left-4 opacity-10">
                    <Sparkles className="w-8 h-8 text-brand-gold" />
                  </div>
                  <p className="text-base text-neutral-600 leading-relaxed italic font-light">
                    {profile.aiAnalysis.detailedAnalysis}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="p-10 bg-brand-gold/5 rounded-[3rem] border border-brand-gold/10 relative overflow-hidden group">
            <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:scale-110 transition-transform">
              <Sparkles className="w-32 h-32 text-brand-gold" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-5 h-5 text-brand-gold" />
                <h3 className="text-xl font-serif font-bold text-brand-primary">نصيحة اليوم</h3>
              </div>
              <p className="text-brand-primary/70 text-sm leading-relaxed italic font-medium">
                "الصدق والوضوح في البداية هما حجر الأساس لبناء حياة زوجية مستقرة. لا تتردد في طرح الأسئلة الجوهرية."
              </p>
            </div>
          </div>
        </div>

        {/* Main Content / Matches */}
        <div className="lg:col-span-2 space-y-10">
          <div className="flex justify-between items-end px-2">
            <div>
              <h2 className="text-5xl font-serif font-bold text-brand-primary mb-3">اكتشف شركاء محتملين</h2>
              <p className="text-neutral-400 text-base font-light">بناءً على تفضيلاتك وقيمك الشخصية العميقة</p>
            </div>
            <div className="flex gap-3 p-1.5 bg-white/60 backdrop-blur-md rounded-[1.5rem] border border-brand-primary/5 shadow-soft">
              <button className="px-6 py-2.5 bg-brand-primary text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-brand-primary/20">الكل</button>
              <button className="px-6 py-2.5 hover:bg-brand-primary/5 text-neutral-400 hover:text-brand-primary rounded-xl text-xs font-bold transition-all">الأكثر توافقاً</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {publicProfiles.length > 0 ? (
              publicProfiles.map((p, i) => (
                <motion.div 
                  key={p.uid}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-[3rem] p-10 border border-brand-primary/5 hover:border-brand-primary/10 hover:shadow-gold transition-all duration-500 group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-40 h-40 bg-brand-gold/5 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-brand-gold/10 transition-all" />
                  
                  <div className="flex items-start justify-between mb-8 relative z-10">
                    <div className="relative group/avatar">
                      <div className="w-28 h-28 bg-brand-cream rounded-[2.5rem] border-2 border-brand-primary/5 flex items-center justify-center text-brand-primary shadow-inner group-hover/avatar:scale-105 transition-transform overflow-hidden">
                        <img src={p.photoURL || `https://ui-avatars.com/api/?name=${p.displayName}&background=random`} alt={p.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      {p.isVerified && (
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-xl flex items-center justify-center border-4 border-white shadow-lg">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="px-5 py-2 bg-brand-gold/10 text-brand-gold rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border border-brand-gold/10 shadow-sm">
                        عضو جديد
                      </div>
                      <div className="px-4 py-1.5 bg-brand-primary/5 text-brand-primary rounded-full text-[9px] font-bold uppercase tracking-[0.1em] border border-brand-primary/5">
                        توافق 95%
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-3xl font-serif font-bold mb-2 text-brand-primary group-hover:text-gold-gradient transition-all">{p.displayName}</h3>
                  <div className="flex items-center gap-3 mb-8">
                    <span className="text-neutral-400 text-xs font-bold uppercase tracking-[0.2em]">{new Date().getFullYear() - new Date(p.birthDate).getFullYear()} عاماً</span>
                    <div className="w-1.5 h-1.5 bg-brand-gold/30 rounded-full" />
                    <span className="text-neutral-400 text-xs font-bold uppercase tracking-[0.2em]">{p.gender === 'male' ? 'رجل' : 'امرأة'}</span>
                  </div>
                  
                  <div className="bg-brand-cream/30 p-6 rounded-[2rem] border border-brand-primary/5 mb-10 relative group-hover:bg-brand-cream/50 transition-colors">
                    <p className="text-neutral-500 text-sm line-clamp-3 leading-relaxed h-[4.5rem] font-light italic">
                      {p.bio || "لا يوجد نبذة شخصية متاحة حالياً."}
                    </p>
                  </div>
                  
                  <div className="flex gap-4 relative z-10">
                    <button className="flex-1 py-5 bg-white text-brand-primary rounded-[1.5rem] font-bold text-xs uppercase tracking-widest border border-brand-primary/5 hover:bg-brand-primary hover:text-white transition-all flex items-center justify-center gap-3 group/btn shadow-sm hover:shadow-premium">
                      <span>عرض الملف</span>
                      <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                    <button 
                      onClick={() => handleRequestMatch(p)}
                      disabled={requestingMatch === p.uid}
                      className="w-16 h-16 bg-brand-secondary text-white rounded-[1.5rem] flex items-center justify-center hover:scale-110 active:scale-95 transition-all disabled:opacity-50 shadow-rose group/heart"
                    >
                      {requestingMatch === p.uid ? (
                        <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Heart className="w-7 h-7 group-hover/heart:fill-current transition-all" />
                      )}
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-32 text-center bg-white/60 backdrop-blur-xl rounded-[4rem] border border-white/40 shadow-soft">
                <div className="w-28 h-28 bg-brand-primary/5 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8">
                  <Users className="w-14 h-14 text-brand-primary opacity-20" />
                </div>
                <h3 className="text-3xl font-serif font-bold text-brand-primary mb-4">لا يوجد أعضاء حالياً</h3>
                <p className="text-neutral-400 text-base font-light max-w-sm mx-auto">سنقوم بإبلاغك فور توفر شركاء متوافقين معك ومع قيمك الشخصية.</p>
              </div>
            )}
          </div>
        </div>
      </div>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [view, setView] = useState('dashboard');
  const [activeChat, setActiveChat] = useState<{ uid: string, name: string } | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const docRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
      setIsAuthReady(true);
    });

    // Connection test
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    };
    testConnection();

    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Sign in error:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  if (loading || !isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-cream">
        <motion.div 
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-16 h-16 bg-brand-primary rounded-full flex items-center justify-center text-white"
        >
          <Heart className="w-8 h-8 fill-current" />
        </motion.div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-brand-cream selection:bg-brand-primary/10 selection:text-brand-primary">
      <Navbar user={user} profile={profile} onSignOut={handleSignOut} currentView={view} setView={setView} />
      
      <main>
        {!user ? (
          <LandingHero onSignIn={handleSignIn} />
        ) : !profile ? (
          <ProfileSetup user={user} onComplete={setProfile} />
        ) : (
          <div className="min-h-screen pt-32 pb-20 px-6 max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              {view === 'dashboard' ? (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  {profile.role === 'admin' ? (
                    <AdminDashboard profile={profile} />
                  ) : (
                    <Dashboard user={user} profile={profile} />
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="matches"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  {activeChat ? (
                    <Chat 
                      currentUserUid={user.uid}
                      otherUserUid={activeChat.uid}
                      otherDisplayName={activeChat.name}
                      onBack={() => setActiveChat(null)}
                    />
                  ) : (
                    <Matches 
                      currentUserUid={user.uid} 
                      onStartChat={(uid, name) => setActiveChat({ uid, name })}
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Footer Decoration */}
      <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-brand-primary via-brand-gold to-brand-primary opacity-20" />
    </div>
  );
}
