import { useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  User,
  updatePassword,
  deleteUser
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
  updateDoc,
  deleteDoc
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
  Clock,
  BookOpen,
  Headphones,
  Database,
  Home,
  Gift,
  Headset,
  Calendar,
  Settings as SettingsIcon,
  FileText,
  Upload,
  AlertCircle,
  X,
  Check
} from 'lucide-react';
import { cn } from './lib/utils';

// --- Types ---
export interface UserProfile {
  uid: string;
  displayName: string;
  photoURL?: string;
  role: 'client' | 'admin';
  gender: 'male' | 'female';
  maritalStatus?: 'single' | 'divorced' | 'widowed';
  birthDate: string;
  bio: string;
  values: string[];
  goals: string;
  marriageReasons?: string;
  isPublic: boolean;
  isVerified?: boolean;
  createdAt: any;
  assessment?: AssessmentData;
  aiAnalysis?: {
    profileTitle: string;
    detailedAnalysis: string;
    readinessScore: number;
  };
  verificationData?: {
    docType: 'national_id' | 'passport';
    docUrl: string;
    status: 'pending' | 'approved' | 'rejected';
    submittedAt: any;
    feedback?: string;
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
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/90 backdrop-blur-xl border-b border-neutral-100 px-6 py-4 transition-all">
      <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView('dashboard')}>
            <div className="w-12 h-12 premium-gradient rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand-primary/20 group-hover:scale-110 transition-transform">
              <Heart className="w-7 h-7 fill-current text-brand-gold" />
            </div>
            <span className="text-3xl font-serif font-bold text-brand-primary tracking-tight">موثوق</span>
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
              <span>{isAdmin ? 'لوحة التحكم' : 'ما قبل الزواج (مطابقة)'}</span>
              {currentView === 'dashboard' && (
                <motion.div layoutId="nav-active" className="absolute -bottom-1 left-0 right-0 h-0.5 bg-brand-gold rounded-full" />
              )}
            </button>
            
            {!isAdmin && (
              <>
                <button 
                  onClick={() => setView('preparation')}
                  className={cn(
                    "flex items-center gap-2 text-sm font-bold transition-all relative py-1 uppercase tracking-[0.1em]",
                    currentView === 'preparation' ? "text-brand-primary" : "text-neutral-400 hover:text-brand-primary"
                  )}
                >
                  <Gift className="w-4 h-4" />
                  <span>خدمات الزواج (تجهيز)</span>
                  {currentView === 'preparation' && (
                    <motion.div layoutId="nav-active" className="absolute -bottom-1 left-0 right-0 h-0.5 bg-brand-gold rounded-full" />
                  )}
                </button>

                <button 
                  onClick={() => setView('consultation')}
                  className={cn(
                    "flex items-center gap-2 text-sm font-bold transition-all relative py-1 uppercase tracking-[0.1em]",
                    currentView === 'consultation' ? "text-brand-primary" : "text-neutral-400 hover:text-brand-primary"
                  )}
                >
                  <Headphones className="w-4 h-4" />
                  <span>ما بعد الزواج (استشارة)</span>
                  {currentView === 'consultation' && (
                    <motion.div layoutId="nav-active" className="absolute -bottom-1 left-0 right-0 h-0.5 bg-brand-gold rounded-full" />
                  )}
                </button>

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

                <button 
                  onClick={() => setView('settings')}
                  className={cn(
                    "flex items-center gap-2 text-sm font-bold transition-all relative py-1 uppercase tracking-[0.1em]",
                    currentView === 'settings' ? "text-brand-primary" : "text-neutral-400 hover:text-brand-primary"
                  )}
                >
                  <SettingsIcon className="w-4 h-4" />
                  <span>الإعدادات</span>
                  {currentView === 'settings' && (
                    <motion.div layoutId="nav-active" className="absolute -bottom-1 left-0 right-0 h-0.5 bg-brand-gold rounded-full" />
                  )}
                </button>
              </>
            )}
          </div>
        )}

        {!user && (
          <div className="hidden md:flex items-center gap-10">
            <button onClick={() => document.getElementById('pre-marriage')?.scrollIntoView({ behavior: 'smooth' })} className="text-sm font-bold text-neutral-400 hover:text-brand-primary transition-all uppercase tracking-[0.1em]">ما قبل الزواج</button>
            <button onClick={() => document.getElementById('marriage-services')?.scrollIntoView({ behavior: 'smooth' })} className="text-sm font-bold text-neutral-400 hover:text-brand-primary transition-all uppercase tracking-[0.1em]">خدمات الزواج</button>
            <button onClick={() => document.getElementById('post-marriage')?.scrollIntoView({ behavior: 'smooth' })} className="text-sm font-bold text-neutral-400 hover:text-brand-primary transition-all uppercase tracking-[0.1em]">ما بعد الزواج</button>
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
      </div>
    </nav>
  );
};

const Footer = () => {
  return (
    <footer className="bg-white border-t border-neutral-100 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 premium-gradient rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-primary/20">
            <Heart className="w-5 h-5 fill-current text-brand-gold" />
          </div>
          <span className="text-2xl font-serif font-bold text-brand-primary tracking-tight">موثوق</span>
        </div>
        <div className="flex flex-wrap justify-center gap-8 text-sm font-medium text-neutral-500">
          <a href="#" className="hover:text-brand-primary transition-colors">عن موثوق</a>
          <a href="#" className="hover:text-brand-primary transition-colors">الشروط والأحكام</a>
          <a href="#" className="hover:text-brand-primary transition-colors">سياسة الخصوصية</a>
          <a href="#" className="hover:text-brand-primary transition-colors">اتصل بنا</a>
        </div>
        <p className="text-sm text-neutral-400">
          © {new Date().getFullYear()} منصة موثوق. جميع الحقوق محفوظة.
        </p>
      </div>
    </footer>
  );
};

const LandingPage = ({ onSignIn, onDemoSignIn }: { onSignIn: () => void, onDemoSignIn: () => void }) => {
  return (
    <div className="bg-white min-h-screen">
      <LandingHero onSignIn={onSignIn} onDemoSignIn={onDemoSignIn} />
      
      {/* Pre-Marriage Section */}
      <section id="pre-marriage" className="py-32 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-10"
            >
              <div className="inline-flex items-center gap-3 px-5 py-2 bg-brand-primary/5 rounded-full text-brand-primary text-[10px] font-bold uppercase tracking-[0.3em]">
                <Compass className="w-4 h-4" />
                <span>المرحلة الأولى: البحث والتعارف</span>
              </div>
              <h2 className="text-6xl md:text-7xl font-serif font-bold text-brand-primary leading-tight">
                خدمات ما قبل الزواج <br />
                <span className="text-brand-gold italic">الدقة في الاختيار</span>
              </h2>
              <p className="text-xl text-neutral-500 font-light leading-relaxed">
                نبدأ معك الرحلة من الخطوة الأولى، حيث نوفر لك أدوات تحليل الشخصية المتقدمة والمطابقة الذكية المبنية على القيم والأهداف المشتركة لضمان بداية راسخة.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { title: "اختبار التوافق", desc: "تحليل عميق للشخصية والقيم." },
                  { title: "مطابقة ذكية", desc: "خوارزميات تقترح الأنسب لك." },
                  { title: "خصوصية تامة", desc: "تحكم كامل في ظهور بياناتك." },
                  { title: "تحقق من الهوية", desc: "بيئة آمنة وموثوقة للجميع." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 p-6 bg-white rounded-3xl border border-brand-primary/5 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-brand-gold/10 flex items-center justify-center text-brand-gold shrink-0">
                      <Check className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-brand-primary mb-1">{item.title}</h4>
                      <p className="text-xs text-neutral-400 font-light">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-[4/5] rounded-[4rem] overflow-hidden shadow-premium border-8 border-white">
                <img src="https://picsum.photos/seed/marriage-prep/800/1000" alt="Pre-marriage" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-brand-gold rounded-[3rem] p-10 text-white shadow-2xl flex flex-col justify-center">
                <p className="text-5xl font-bold mb-2">95%</p>
                <p className="text-xs font-bold uppercase tracking-widest opacity-80">نسبة نجاح المطابقة الأولية</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Marriage Services (Mawthoq) Section */}
      <section id="marriage-services" className="py-32 px-6 bg-brand-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20" />
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-24 space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-3 px-5 py-2 bg-white/10 rounded-full text-brand-gold text-[10px] font-bold uppercase tracking-[0.3em]"
            >
              <Sparkles className="w-4 h-4" />
              <span>المرحلة الثانية: ليلة العمر</span>
            </motion.div>
            <h2 className="text-6xl md:text-8xl font-serif font-bold text-white">
              خدمات الزواج <span className="text-brand-gold italic">(موثوق)</span>
            </h2>
            <p className="text-xl text-white/60 max-w-2xl mx-auto font-light">
              نحن شريكك في تنظيم أدق تفاصيل يومك الكبير، من القاعات الفاخرة إلى تجهيز منزل الزوجية بأرقى المعايير.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Home, title: "تجهيز المنزل", desc: "عروض حصرية على الأثاث والأجهزة من كبرى العلامات." },
              { icon: Gift, title: "هدايا موثوق", desc: "باقات هدايا فاخرة وخصومات خاصة للمشتركين." },
              { icon: Calendar, title: "تنظيم الحفلات", desc: "تنسيق كامل مع أرقى قاعات الأفراح والمصورين." },
              { icon: Heart, title: "عروض السفر", desc: "وجهات استثنائية لشهر العسل بأسعار تفضيلية." }
            ].map((service, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-10 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] hover:bg-white/10 transition-all group"
              >
                <div className="w-16 h-16 bg-brand-gold rounded-2xl flex items-center justify-center text-brand-primary mb-8 group-hover:scale-110 transition-transform">
                  <service.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-white mb-4">{service.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed font-light">{service.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Post-Marriage Section */}
      <section id="post-marriage" className="py-32 px-6 relative overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1"
            >
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-6 pt-12">
                  <div className="aspect-square rounded-[3rem] overflow-hidden shadow-lg">
                    <img src="https://picsum.photos/seed/consult-1/400/400" alt="Consultation" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="aspect-[3/4] rounded-[3rem] overflow-hidden shadow-lg">
                    <img src="https://picsum.photos/seed/consult-2/400/533" alt="Consultation" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="aspect-[3/4] rounded-[3rem] overflow-hidden shadow-lg">
                    <img src="https://picsum.photos/seed/consult-3/400/533" alt="Consultation" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="aspect-square rounded-[3rem] overflow-hidden shadow-lg">
                    <img src="https://picsum.photos/seed/consult-4/400/400" alt="Consultation" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                </div>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2 space-y-10"
            >
              <div className="inline-flex items-center gap-3 px-5 py-2 bg-brand-secondary/5 rounded-full text-brand-secondary text-[10px] font-bold uppercase tracking-[0.3em]">
                <Headphones className="w-4 h-4" />
                <span>المرحلة الثالثة: الاستقرار والنمو</span>
              </div>
              <h2 className="text-6xl md:text-7xl font-serif font-bold text-brand-primary leading-tight">
                خدمات ما بعد الزواج <br />
                <span className="text-brand-secondary italic">رعاية مستمرة</span>
              </h2>
              <p className="text-xl text-neutral-500 font-light leading-relaxed">
                نحن معك في كل خطوة، نوفر لك نخبة من المستشارين الأسريين والخبراء لمساعدتك في بناء حياة زوجية سعيدة ومستقرة وتجاوز التحديات بحكمة.
              </p>
              <ul className="space-y-6">
                {[
                  { title: "استشارات أسرية", desc: "جلسات خاصة مع خبراء معتمدين." },
                  { title: "ورش عمل تفاعلية", desc: "دورات في مهارات التواصل والذكاء العاطفي." },
                  { title: "دعم قانوني", desc: "استشارات قانونية متخصصة في شؤون الأسرة." },
                  { title: "مجتمع موثوق", desc: "لقاءات وفعاليات حصرية للعائلات." }
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-6 group">
                    <div className="w-3 h-3 rounded-full bg-brand-secondary group-hover:scale-150 transition-transform" />
                    <div>
                      <h4 className="font-bold text-brand-primary">{item.title}</h4>
                      <p className="text-sm text-neutral-400 font-light">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-primary py-20 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16">
          <div className="col-span-1 md:col-span-2 space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 premium-gradient rounded-2xl flex items-center justify-center text-white">
                <Heart className="w-7 h-7 fill-current text-brand-gold" />
              </div>
              <span className="text-3xl font-serif font-bold text-white tracking-tight">موثوق</span>
            </div>
            <p className="text-white/40 max-w-sm leading-relaxed font-light">
              المنصة الرائدة في العالم العربي للمطابقة الذكية والزواج الجاد، نجمع بين القيم الأصيلة والتقنيات الحديثة لبناء مستقبل أسري مستقر.
            </p>
          </div>
          <div className="space-y-6">
            <h4 className="text-brand-gold font-bold uppercase tracking-widest text-xs">روابط سريعة</h4>
            <ul className="space-y-4 text-white/60 font-light">
              <li><button className="hover:text-white transition-colors">عن موثوق</button></li>
              <li><button className="hover:text-white transition-colors">الأسئلة الشائعة</button></li>
              <li><button className="hover:text-white transition-colors">سياسة الخصوصية</button></li>
              <li><button className="hover:text-white transition-colors">اتصل بنا</button></li>
            </ul>
          </div>
          <div className="space-y-6">
            <h4 className="text-brand-gold font-bold uppercase tracking-widest text-xs">تواصل معنا</h4>
            <div className="flex gap-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:bg-brand-gold hover:text-brand-primary transition-all cursor-pointer">
                  <Sparkles className="w-5 h-5" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-white/5 text-center">
          <p className="text-white/20 text-[10px] font-bold uppercase tracking-[0.5em]">جميع الحقوق محفوظة © ٢٠٢٦ منصة موثوق الرقمية</p>
        </div>
      </footer>
    </div>
  );
};

const LandingHero = ({ onSignIn, onDemoSignIn }: { onSignIn: () => void, onDemoSignIn: () => void }) => (
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
        موثوق هي منصة تجمع بين الأصالة والتقنية، نستخدم الذكاء الاصطناعي لتقريب المسافات بين القلوب الباحثة عن الاستقرار في بيئة آمنة ومحترمة.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
        <button 
          onClick={onSignIn}
          className="px-16 py-7 premium-gradient text-white rounded-[2.5rem] font-bold text-xl shadow-premium hover:scale-105 hover:shadow-brand-primary/40 transition-all flex items-center gap-4 group"
        >
          <span>ابدأ رحلتك الآن</span>
          <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
        </button>

        <button 
          onClick={onDemoSignIn}
          className="px-12 py-6 bg-white text-brand-primary border-2 border-brand-primary/10 rounded-[2.5rem] font-bold text-lg shadow-soft hover:bg-brand-primary/5 transition-all flex items-center gap-3 group"
        >
          <Sparkles className="w-5 h-5 text-brand-gold" />
          <span>تجربة سريعة (Demo)</span>
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
            <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-[0.2em]">عضو يبحثون عن الاستقرار</p>
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
  const [aiResult, setAiResult] = useState<{ profileTitle: string, detailedAnalysis: string, readinessScore: number } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const [formData, setFormData] = useState({
    role: 'client' as 'client' | 'admin',
    gender: 'male' as 'male' | 'female',
    maritalStatus: 'single' as 'single' | 'divorced' | 'widowed',
    birthDate: '',
    bio: '',
    values: [] as string[],
    goals: '',
    marriageReasons: '',
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
      displayName: user.displayName || 'مستخدم موثوق',
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
          <div className="px-4 py-1.5 bg-neutral-50 rounded-full border border-brand-primary/5 shadow-sm">
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
                <p className="text-neutral-500 font-light text-lg">يرجى اختيار نوع الحساب للمتابعة في منصة موثوق</p>
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
                    <p className="text-neutral-500">يقوم مساعد موثوق الذكي برسم ملامح شخصيتك الآن.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="p-8 bg-neutral-50 rounded-[2rem] border border-brand-primary/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <BrainCircuit className="w-32 h-32" />
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-4">
                        <Sparkles className="w-6 h-6 text-brand-gold" />
                        <span className="text-xs font-bold uppercase tracking-widest text-brand-gold">نتيجة التقييم</span>
                      </div>
                      <h3 className="text-4xl font-serif font-bold text-brand-primary mb-6">{aiResult?.profileTitle}</h3>
                      
                      {/* Readiness Score */}
                      <div className="mb-8 p-6 bg-white/50 rounded-[1.5rem] border border-brand-primary/5">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-xs font-bold text-brand-primary uppercase tracking-widest">نسبة الجاهزية للزواج</span>
                          <span className="text-xl font-bold text-brand-gold">{aiResult?.readinessScore}%</span>
                        </div>
                        <div className="w-full h-2 bg-brand-primary/10 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${aiResult?.readinessScore}%` }}
                            transition={{ duration: 1 }}
                            className="h-full premium-gradient"
                          />
                        </div>
                      </div>

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
              <div>
                <label className="block text-xs font-bold text-brand-primary uppercase tracking-[0.2em] mb-4">الحالة الاجتماعية</label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { id: 'single', label: 'أعزب / عزباء' },
                    { id: 'divorced', label: 'مطلق / مطلقة' },
                    { id: 'widowed', label: 'أرمل / أرملة' }
                  ].map((status) => (
                    <button
                      key={status.id}
                      onClick={() => setFormData({ ...formData, maritalStatus: status.id as any })}
                      className={cn(
                        "py-4 rounded-[1.5rem] border-2 transition-all font-bold text-sm",
                        formData.maritalStatus === status.id 
                          ? "border-brand-primary bg-brand-primary/5 text-brand-primary shadow-soft" 
                          : "border-neutral-50 text-neutral-400 hover:border-brand-primary/20 bg-neutral-50/50"
                      )}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
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
              <div>
                <label className="block text-xs font-bold text-brand-primary uppercase tracking-[0.2em] mb-4">أسباب الرغبة في الزواج</label>
                <textarea 
                  rows={3}
                  placeholder="لماذا تبحث عن الزواج؟ (مثال: الاستقرار، تكوين أسرة...)"
                  className="w-full px-6 py-4 rounded-[1.5rem] border border-neutral-100 bg-neutral-50/50 focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary outline-none transition-all resize-none font-light text-brand-primary"
                  value={formData.marriageReasons}
                  onChange={(e) => setFormData({ ...formData, marriageReasons: e.target.value })}
                />
              </div>
              <div className="flex gap-4">
                <button onClick={() => setStep(2)} className="flex-1 py-5 bg-neutral-50 text-brand-primary rounded-[1.5rem] font-bold text-xs uppercase tracking-widest hover:bg-brand-primary hover:text-white transition-all">السابق</button>
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
              <div className="p-8 bg-neutral-50 rounded-[2rem] border border-brand-primary/10 relative overflow-hidden">
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
                <button onClick={() => setStep(3)} className="flex-1 py-5 bg-neutral-50 text-brand-primary rounded-[1.5rem] font-bold text-xs uppercase tracking-widest hover:bg-brand-primary hover:text-white transition-all">السابق</button>
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
  const [reviewingUser, setReviewingUser] = useState<UserProfile | null>(null);

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

  const handleVerifyRequest = async (uid: string, approve: boolean) => {
    try {
      await updateDoc(doc(db, 'users', uid), { 
        isVerified: approve,
        'verificationData.status': approve ? 'approved' : 'rejected'
      });
      setReviewingUser(null);
    } catch (error) {
      console.error("Error handling verification request:", error);
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

  const seedDummyData = async () => {
    const dummyUsers = [
      {
        uid: 'demo_1',
        displayName: 'أحمد المنصور',
        gender: 'male',
        birthDate: '1990-05-15',
        bio: 'مهندس برمجيات، أبحث عن شريكة حياة تقدر العلم والعمل، وتشاركني اهتماماتي في القراءة والسفر.',
        values: ['العلم', 'الصدق', 'الاستقرار'],
        goals: 'بناء أسرة سعيدة ومستقرة قائمة على المودة والرحمة.',
        isPublic: true,
        isVerified: true,
        role: 'client',
        photoURL: 'https://picsum.photos/seed/ahmed/200/200',
        aiAnalysis: {
          profileTitle: 'المفكر الطموح',
          detailedAnalysis: 'شخصية عقلانية ومنظمة، تمتلك رؤية واضحة للمستقبل وتوازن بين الطموح المهني والاستقرار العائلي.',
          readinessScore: 85
        }
      },
      {
        uid: 'demo_2',
        displayName: 'سارة القحطاني',
        gender: 'female',
        birthDate: '1994-08-22',
        bio: 'طبيبة أطفال، أحب الطبيعة والهدوء، أبحث عن شخص متفهم، طموح، ويقدر الروابط الأسرية.',
        values: ['العائلة', 'الرحمة', 'الوفاء'],
        goals: 'تكوين أسرة تكون هي الملاذ الآمن والداعم الأول لكل أفرادها.',
        isPublic: true,
        isVerified: true,
        role: 'client',
        photoURL: 'https://picsum.photos/seed/sara/200/200',
        aiAnalysis: {
          profileTitle: 'الروح المعطاءة',
          detailedAnalysis: 'شخصية حنونة وذكية عاطفياً، تضع العائلة في مقدمة أولوياتها وتمتلك قدرة عالية على الاحتواء.',
          readinessScore: 92
        }
      },
      {
        uid: 'demo_3',
        displayName: 'خالد العتيبي',
        gender: 'male',
        birthDate: '1988-12-10',
        bio: 'رائد أعمال، أهتم بالرياضة والثقافة، أبحث عن شريكة حياة طموحة ومثقفة.',
        values: ['النجاح', 'الاحترام', 'المغامرة'],
        goals: 'النمو معاً في رحلة الحياة وتحقيق التوازن بين النجاح الشخصي والأسري.',
        isPublic: true,
        isVerified: false,
        role: 'client',
        photoURL: 'https://picsum.photos/seed/khaled/200/200',
        aiAnalysis: {
          profileTitle: 'القائد الملهم',
          detailedAnalysis: 'شخصية قيادية ومبادرة، تسعى دائماً للأفضل وتمتلك طاقة إيجابية معدية.',
          readinessScore: 78
        }
      },
      {
        uid: 'demo_4',
        displayName: 'ليلى الشمري',
        gender: 'female',
        birthDate: '1996-03-05',
        bio: 'مصممة جرافيك، فنانة بطبعي، أبحث عن شخص يقدر الفن والجمال، ويكون سنداً لي في مسيرتي.',
        values: ['الإبداع', 'الحرية', 'الصدق'],
        goals: 'بناء حياة مليئة بالألوان والمشاركة والنمو المستمر.',
        isPublic: true,
        isVerified: true,
        role: 'client',
        photoURL: 'https://picsum.photos/seed/layla/200/200',
        aiAnalysis: {
          profileTitle: 'الفنانة الحالمة',
          detailedAnalysis: 'شخصية مبدعة وحساسة، تمتلك نظرة فريدة للحياة وتسعى لبناء علاقة قائمة على التفاهم العميق.',
          readinessScore: 88
        }
      }
    ];

    try {
      for (const user of dummyUsers) {
        await setDoc(doc(db, 'users', user.uid), {
          ...user,
          createdAt: serverTimestamp()
        });
      }
      alert("تمت إضافة البيانات التجريبية بنجاح!");
    } catch (error) {
      console.error("Error seeding data:", error);
      alert("حدث خطأ أثناء إضافة البيانات.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 pt-32 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Stats Section */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
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
          
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onClick={seedDummyData}
            className="bg-neutral-50 rounded-[3rem] p-10 border border-brand-gold/20 shadow-premium flex items-center gap-8 group hover:bg-brand-gold/10 transition-all relative overflow-hidden text-right"
          >
            <div className="w-20 h-20 rounded-[2rem] bg-brand-gold flex items-center justify-center text-white shadow-2xl relative z-10">
              <Database className="w-10 h-10" />
            </div>
            <div className="relative z-10">
              <p className="text-xl font-bold text-brand-primary mb-1">إضافة بيانات</p>
              <p className="text-[10px] font-bold text-brand-gold uppercase tracking-[0.2em]">تجريبية للنظام</p>
            </div>
          </motion.button>
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
              <div className="px-8 py-4 bg-neutral-50 rounded-[2rem] border border-brand-primary/5 flex items-center gap-4 shadow-inner">
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
                  <th className="pb-8 text-[10px] font-bold text-neutral-400 uppercase tracking-[0.3em]">تاريخ الميلاد</th>
                  <th className="pb-8 text-[10px] font-bold text-neutral-400 uppercase tracking-[0.3em] max-w-[200px]">النبذة</th>
                  <th className="pb-8 text-[10px] font-bold text-neutral-400 uppercase tracking-[0.3em]">الحالة</th>
                  <th className="pb-8 text-[10px] font-bold text-neutral-400 uppercase tracking-[0.3em]">تاريخ التسجيل</th>
                  <th className="pb-8 text-[10px] font-bold text-neutral-400 uppercase tracking-[0.3em]">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {users.map((u) => (
                  <tr key={u.uid} className="group hover:bg-neutral-50 transition-all duration-300">
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
                      <span className="text-xs font-medium text-neutral-500">
                        {u.birthDate ? new Date(u.birthDate).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
                      </span>
                    </td>
                    <td className="py-8 max-w-[200px]">
                      <p className="text-xs text-neutral-400 line-clamp-2 italic font-light leading-relaxed" title={u.bio}>
                        {u.bio ? (u.bio.length > 60 ? `${u.bio.substring(0, 60)}...` : u.bio) : '-'}
                      </p>
                    </td>
                    <td className="py-8">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-2.5 h-2.5 rounded-full",
                          u.isVerified ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" : 
                          u.verificationData?.status === 'pending' ? "bg-brand-gold animate-pulse shadow-[0_0_10px_rgba(212,175,55,0.5)]" :
                          "bg-neutral-300"
                        )} />
                        <span className="text-xs font-bold text-neutral-600 uppercase tracking-widest">
                          {u.isVerified ? 'موثق' : u.verificationData?.status === 'pending' ? 'بانتظار المراجعة' : 'غير موثق'}
                        </span>
                      </div>
                    </td>
                    <td className="py-8">
                      <span className="text-xs font-medium text-neutral-400 font-mono">{u.createdAt ? new Date(u.createdAt.seconds * 1000).toLocaleDateString('ar-EG') : '-'}</span>
                    </td>
                    <td className="py-8">
                      <div className="flex items-center gap-4">
                        {u.verificationData?.status === 'pending' && (
                          <button 
                            onClick={() => setReviewingUser(u)}
                            className="p-3 rounded-2xl text-brand-gold bg-brand-gold/5 border border-brand-gold/20 hover:bg-brand-gold hover:text-white transition-all hover:scale-110 active:scale-90 shadow-sm"
                            title="مراجعة طلب التوثيق"
                          >
                            <FileText className="w-5 h-5" />
                          </button>
                        )}
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

      {/* Verification Review Modal */}
      <AnimatePresence>
        {reviewingUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setReviewingUser(null)}
              className="absolute inset-0 bg-brand-primary/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[4rem] p-12 max-w-2xl w-full shadow-2xl relative z-10 border border-white/20 overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-brand-gold" />
              
              <div className="flex justify-between items-start mb-10">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-3xl bg-brand-primary/5 flex items-center justify-center text-brand-primary">
                    <Shield className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-serif font-bold text-brand-primary mb-2">مراجعة طلب التوثيق</h3>
                    <p className="text-neutral-400 font-light italic">مراجعة مستندات المستخدم: {reviewingUser.displayName}</p>
                  </div>
                </div>
                <button onClick={() => setReviewingUser(null)} className="p-4 bg-neutral-50 rounded-2xl text-neutral-400 hover:bg-neutral-100 transition-all">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-8 mb-12">
                <div className="p-8 bg-neutral-50 rounded-[2.5rem] border border-brand-primary/5">
                  <p className="text-[10px] font-bold text-brand-primary uppercase tracking-[0.3em] mb-4">نوع الوثيقة</p>
                  <p className="text-xl font-bold text-brand-primary">
                    {reviewingUser.verificationData?.docType === 'national_id' ? 'الهوية الوطنية' : 'جواز السفر'}
                  </p>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-brand-primary uppercase tracking-[0.3em]">معاينة الوثيقة</p>
                  <div className="aspect-video bg-neutral-100 rounded-[2.5rem] overflow-hidden border border-neutral-200 shadow-inner group relative">
                    <img 
                      src={reviewingUser.verificationData?.docUrl} 
                      alt="Verification Document" 
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-brand-primary/0 group-hover:bg-brand-primary/10 transition-all flex items-center justify-center">
                      <a 
                        href={reviewingUser.verificationData?.docUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-8 py-3 bg-white text-brand-primary rounded-full font-bold text-xs opacity-0 group-hover:opacity-100 transition-all shadow-xl"
                      >
                        فتح في نافذة جديدة
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-6">
                <button 
                  onClick={() => handleVerifyRequest(reviewingUser.uid, true)}
                  className="flex-1 py-6 bg-brand-primary text-white rounded-[2rem] font-bold text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-brand-primary/20 flex items-center justify-center gap-3"
                >
                  <Check className="w-6 h-6" />
                  <span>قبول التوثيق</span>
                </button>
                <button 
                  onClick={() => handleVerifyRequest(reviewingUser.uid, false)}
                  className="flex-1 py-6 bg-neutral-50 text-brand-secondary rounded-[2rem] font-bold text-sm uppercase tracking-widest hover:bg-brand-secondary hover:text-white transition-all flex items-center justify-center gap-3"
                >
                  <X className="w-6 h-6" />
                  <span>رفض الطلب</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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
                    <h3 className="text-xl font-serif font-bold text-brand-primary">رؤية موثوق الذكية</h3>
                  </div>
                </div>
                <h4 className="text-3xl font-serif font-bold text-brand-primary mb-6 leading-tight text-gold-gradient">{profile.aiAnalysis.profileTitle}</h4>
                
                {/* Readiness Score Display */}
                <div className="mb-8 p-6 bg-brand-primary/5 rounded-[2rem] border border-brand-primary/10">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-bold text-brand-primary uppercase tracking-widest">نسبة الجاهزية للزواج</span>
                    <span className="text-2xl font-bold text-brand-gold">{profile.aiAnalysis.readinessScore}%</span>
                  </div>
                  <div className="w-full h-3 bg-brand-primary/10 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${profile.aiAnalysis.readinessScore}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full premium-gradient"
                    />
                  </div>
                </div>

                <div className="bg-neutral-50 p-8 rounded-[2rem] border border-brand-primary/5 relative mb-8">
                  <div className="absolute top-4 left-4 opacity-10">
                    <Sparkles className="w-8 h-8 text-brand-gold" />
                  </div>
                  <p className="text-base text-neutral-600 leading-relaxed italic font-light">
                    {profile.aiAnalysis.detailedAnalysis}
                  </p>
                </div>

                {/* Support & Guidance Section */}
                <div className="space-y-4">
                  <h5 className="text-sm font-bold text-brand-primary uppercase tracking-[0.2em] mb-4">الدعم والتطوير المقترح</h5>
                  
                  {profile.aiAnalysis.readinessScore < 70 ? (
                    <div className="p-6 bg-brand-secondary/5 rounded-[2rem] border border-brand-secondary/10 flex items-center gap-5 group hover:bg-brand-secondary/10 transition-all cursor-pointer">
                      <div className="w-12 h-12 bg-brand-secondary/10 rounded-xl flex items-center justify-center text-brand-secondary">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <div className="flex-1 text-right">
                        <p className="font-bold text-brand-primary text-sm">دورة تأهيل المقبلين على الزواج</p>
                        <p className="text-[10px] text-neutral-400 font-medium">برنامج تدريبي شامل لتعزيز مهارات التواصل وبناء الأسرة</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-brand-secondary group-hover:translate-x-1 transition-transform" />
                    </div>
                  ) : (
                    <div className="p-6 bg-green-50 rounded-[2rem] border border-green-100 flex items-center gap-5">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div className="flex-1 text-right">
                        <p className="font-bold text-brand-primary text-sm">جاهزية ممتازة</p>
                        <p className="text-[10px] text-neutral-400 font-medium">أنت تمتلك وعياً عالياً بمتطلبات الحياة الزوجية</p>
                      </div>
                    </div>
                  )}

                  <button 
                    onClick={() => alert("سيتم التواصل معك من قبل مستشار أسري قريباً.")}
                    className="w-full p-6 bg-white border border-brand-gold/20 rounded-[2rem] flex items-center gap-5 group hover:shadow-gold transition-all"
                  >
                    <div className="w-12 h-12 bg-brand-gold/10 rounded-xl flex items-center justify-center text-brand-gold">
                      <Headphones className="w-6 h-6" />
                    </div>
                    <div className="flex-1 text-right">
                      <p className="font-bold text-brand-primary text-sm">طلب جلسة إرشاد خاصة</p>
                      <p className="text-[10px] text-neutral-400 font-medium">تحدث مع خبير أسري لمناقشة تطلعاتك وتحدياتك</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-brand-gold group-hover:translate-x-1 transition-transform" />
                  </button>
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
                      <div className="w-28 h-28 bg-neutral-50 rounded-[2.5rem] border-2 border-brand-primary/5 flex items-center justify-center text-brand-primary shadow-inner group-hover/avatar:scale-105 transition-transform overflow-hidden">
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
                  
                  <div className="bg-neutral-50 p-6 rounded-[2rem] border border-brand-primary/5 mb-10 relative group-hover:bg-neutral-100 transition-colors">
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

const Settings = ({ user, profile, onUpdateProfile }: { user: any, profile: UserProfile, onUpdateProfile: (p: UserProfile) => void }) => {
  const [bio, setBio] = useState(profile.bio || '');
  const [goals, setGoals] = useState(profile.goals || '');
  const [values, setValues] = useState<string[]>(profile.values || []);
  const [newValue, setNewValue] = useState('');
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const [docType, setDocType] = useState<'national_id' | 'passport'>('national_id');
  const [docUrl, setDocUrl] = useState('');
  const [isSubmittingVerification, setIsSubmittingVerification] = useState(false);

  const handleUpdateProfile = async () => {
    setIsUpdatingProfile(true);
    try {
      const updatedProfile = { ...profile, bio, goals, values };
      await updateDoc(doc(db, 'users', profile.uid), { bio, goals, values });
      onUpdateProfile(updatedProfile);
      alert('تم تحديث الملف الشخصي بنجاح');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('حدث خطأ أثناء تحديث الملف الشخصي');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleSubmitVerification = async () => {
    setIsSubmittingVerification(true);
    try {
      const verificationData = {
        docType,
        docUrl,
        status: 'pending',
        submittedAt: serverTimestamp()
      };
      await updateDoc(doc(db, 'users', profile.uid), { verificationData });
      onUpdateProfile({ ...profile, verificationData: { ...verificationData, submittedAt: new Date() } as any });
      alert('تم إرسال طلب التوثيق بنجاح');
    } catch (error) {
      console.error('Error submitting verification:', error);
      alert('حدث خطأ أثناء إرسال طلب التوثيق');
    } finally {
      setIsSubmittingVerification(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword) {
      alert('يرجى إدخال كلمة مرور جديدة');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('كلمات المرور غير متطابقة');
      return;
    }
    setIsChangingPassword(true);
    try {
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, newPassword);
        alert('تم تغيير كلمة المرور بنجاح');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error: any) {
      console.error('Error changing password:', error);
      if (error.code === 'auth/requires-recent-login') {
        alert('يرجى تسجيل الخروج والدخول مرة أخرى لتغيير كلمة المرور لدواعي أمنية');
      } else {
        alert('حدث خطأ أثناء تغيير كلمة المرور. قد يكون هذا بسبب تسجيل الدخول عبر Google.');
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف حسابك؟ لا يمكن التراجع عن هذا الإجراء.')) return;
    
    setIsDeletingAccount(true);
    try {
      if (auth.currentUser) {
        await deleteDoc(doc(db, 'users', profile.uid));
        await deleteUser(auth.currentUser);
        alert('تم حذف الحساب بنجاح');
        window.location.reload();
      }
    } catch (error: any) {
      console.error('Error deleting account:', error);
      if (error.code === 'auth/requires-recent-login') {
        alert('يرجى تسجيل الخروج والدخول مرة أخرى لحذف الحساب لدواعي أمنية');
      } else {
        alert('حدث خطأ أثناء حذف الحساب');
      }
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const addValue = () => {
    if (newValue.trim() && !values.includes(newValue.trim())) {
      setValues([...values, newValue.trim()]);
      setNewValue('');
    }
  };

  const removeValue = (val: string) => {
    setValues(values.filter(v => v !== val));
  };

  return (
    <div className="max-w-4xl mx-auto py-20 space-y-12">
      <div className="text-center space-y-4">
        <h2 className="text-5xl font-serif font-bold text-brand-primary">إعدادات الحساب</h2>
        <p className="text-neutral-500 font-light">إدارة ملفك الشخصي وتفضيلات الأمان</p>
      </div>

      <section className="bg-white rounded-[3rem] p-10 border border-brand-primary/5 shadow-soft space-y-8">
        <div className="flex items-center gap-4 border-b border-neutral-50 pb-6">
          <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary">
            <UserIcon className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-serif font-bold text-brand-primary">الملف الشخصي</h3>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-brand-primary uppercase tracking-widest">النبذة الشخصية</label>
            <textarea 
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-6 bg-neutral-50 border border-brand-primary/10 rounded-[2rem] focus:ring-2 focus:ring-brand-primary/20 outline-none min-h-[150px] transition-all"
              placeholder="تحدث عن نفسك..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-brand-primary uppercase tracking-widest">الأهداف</label>
            <textarea 
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              className="w-full p-6 bg-neutral-50 border border-brand-primary/10 rounded-[2rem] focus:ring-2 focus:ring-brand-primary/20 outline-none min-h-[100px] transition-all"
              placeholder="ما هي أهدافك من الزواج؟"
            />
          </div>

          <div className="space-y-4">
            <label className="text-sm font-bold text-brand-primary uppercase tracking-widest block">القيم الشخصية</label>
            <div className="flex flex-wrap gap-3 mb-4">
              {values.map(val => (
                <span key={val} className="px-4 py-2 bg-brand-primary/5 text-brand-primary rounded-full text-xs font-bold flex items-center gap-2">
                  {val}
                  <button onClick={() => removeValue(val)} className="hover:text-brand-secondary transition-colors">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-3">
              <input 
                type="text"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addValue()}
                className="flex-1 px-6 py-4 bg-neutral-50 border border-brand-primary/10 rounded-2xl focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                placeholder="أضف قيمة جديدة..."
              />
              <button 
                onClick={addValue}
                className="px-8 py-4 bg-brand-primary text-white rounded-2xl font-bold text-sm hover:scale-105 transition-all"
              >
                إضافة
              </button>
            </div>
          </div>

          <button 
            onClick={handleUpdateProfile}
            disabled={isUpdatingProfile}
            className="w-full py-5 premium-gradient text-white rounded-[2rem] font-bold shadow-premium hover:scale-[1.02] transition-all disabled:opacity-50"
          >
            {isUpdatingProfile ? 'جاري التحديث...' : 'حفظ التغييرات'}
          </button>
        </div>
      </section>

      <section className="bg-white rounded-[3rem] p-10 border border-brand-primary/5 shadow-soft space-y-8">
        <div className="flex items-center gap-4 border-b border-neutral-50 pb-6">
          <div className="w-12 h-12 bg-brand-secondary/10 rounded-2xl flex items-center justify-center text-brand-secondary">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-serif font-bold text-brand-primary">توثيق الحساب</h3>
        </div>

        {profile.isVerified ? (
          <div className="flex items-center gap-6 p-8 bg-green-50 rounded-[2rem] border border-green-100">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-green-200">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <p className="text-xl font-bold text-green-900">حسابك موثق بنجاح</p>
              <p className="text-green-700 font-light">تم التحقق من هويتك، شارة التوثيق تظهر الآن على ملفك الشخصي.</p>
            </div>
          </div>
        ) : profile.verificationData?.status === 'pending' ? (
          <div className="flex items-center gap-6 p-8 bg-brand-gold/5 rounded-[2rem] border border-brand-gold/10">
            <div className="w-16 h-16 bg-brand-gold rounded-full flex items-center justify-center text-white shadow-lg shadow-brand-gold/20">
              <Clock className="w-10 h-10" />
            </div>
            <div>
              <p className="text-xl font-bold text-brand-gold">طلب التوثيق قيد المراجعة</p>
              <p className="text-brand-gold/80 font-light">سيقوم فريق الإدارة بمراجعة مستنداتك قريباً.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="p-8 bg-neutral-50 rounded-[2rem] border border-brand-primary/5 space-y-4">
              <div className="flex items-center gap-3 text-brand-primary">
                <AlertCircle className="w-5 h-5" />
                <p className="font-bold">لماذا توثيق الحساب؟</p>
              </div>
              <p className="text-neutral-500 text-sm leading-relaxed">
                التوثيق يزيد من مصداقية ملفك الشخصي بنسبة ٨٠٪ ويجذب شركاء أكثر جدية. يتطلب التوثيق رفع صورة واضحة للهوية الوطنية أو جواز السفر.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-brand-primary uppercase tracking-widest">نوع الوثيقة</label>
                <select 
                  value={docType}
                  onChange={(e) => setDocType(e.target.value as any)}
                  className="w-full px-6 py-4 bg-neutral-50 border border-brand-primary/10 rounded-2xl focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                >
                  <option value="national_id">الهوية الوطنية</option>
                  <option value="passport">جواز السفر</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-brand-primary uppercase tracking-widest">رابط الوثيقة (لأغراض العرض)</label>
                <input 
                  type="text"
                  value={docUrl}
                  onChange={(e) => setDocUrl(e.target.value)}
                  placeholder="أدخل رابط الصورة..."
                  className="w-full px-6 py-4 bg-neutral-50 border border-brand-primary/10 rounded-2xl focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                />
              </div>
            </div>

            <button 
              onClick={handleSubmitVerification}
              disabled={isSubmittingVerification || !docUrl}
              className="w-full py-5 bg-brand-primary text-white rounded-[2rem] font-bold shadow-premium hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
            >
              <Upload className="w-5 h-5" />
              {isSubmittingVerification ? 'جاري الإرسال...' : 'إرسال طلب التوثيق'}
            </button>
          </div>
        )}
      </section>

      <section className="bg-white rounded-[3rem] p-10 border border-brand-primary/5 shadow-soft space-y-8">
        <div className="flex items-center gap-4 border-b border-neutral-50 pb-6">
          <div className="w-12 h-12 bg-brand-gold/10 rounded-2xl flex items-center justify-center text-brand-gold">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-serif font-bold text-brand-primary">الأمان</h3>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-brand-primary uppercase tracking-widest">كلمة المرور الجديدة</label>
              <input 
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-6 py-4 bg-neutral-50 border border-brand-primary/10 rounded-2xl focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-brand-primary uppercase tracking-widest">تأكيد كلمة المرور</label>
              <input 
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-6 py-4 bg-neutral-50 border border-brand-primary/10 rounded-2xl focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
              />
            </div>
          </div>

          <button 
            onClick={handleChangePassword}
            disabled={isChangingPassword}
            className="w-full py-5 bg-brand-gold text-white rounded-[2rem] font-bold shadow-premium hover:scale-[1.02] transition-all disabled:opacity-50"
          >
            {isChangingPassword ? 'جاري التغيير...' : 'تغيير كلمة المرور'}
          </button>
        </div>
      </section>

      <section className="bg-rose-50 rounded-[3rem] p-10 border border-rose-100 space-y-8">
        <div className="flex items-center gap-4 border-b border-rose-100 pb-6">
          <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-600">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-serif font-bold text-rose-900">منطقة الخطر</h3>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-right">
            <p className="font-bold text-rose-900">حذف الحساب نهائياً</p>
            <p className="text-sm text-rose-600 font-light">سيتم حذف جميع بياناتك ومطابقاتك ولا يمكن استعادتها.</p>
          </div>
          <button 
            onClick={handleDeleteAccount}
            disabled={isDeletingAccount}
            className="px-10 py-4 bg-rose-600 text-white rounded-2xl font-bold hover:bg-rose-700 transition-all disabled:opacity-50"
          >
            {isDeletingAccount ? 'جاري الحذف...' : 'حذف الحساب'}
          </button>
        </div>
      </section>
    </div>
  );
};

const ConsultationView = () => (
  <div className="py-20 text-center space-y-10">
    <div className="w-32 h-32 bg-brand-primary/5 rounded-[3rem] flex items-center justify-center mx-auto shadow-premium">
      <Headphones className="w-16 h-16 text-brand-primary" />
    </div>
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-5xl font-serif font-bold text-brand-primary">خدمات ما بعد الزواج</h2>
      <p className="text-xl text-neutral-500 font-light leading-relaxed">
        نحن معك في كل خطوة. نقدم جلسات إرشادية خاصة مع خبراء أسريين لضمان استقرار وسعادة حياتك الزوجية الجديدة.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-10">
        {[
          { title: "جلسات إرشادية", desc: "تواصل مباشر مع مستشارين متخصصين." },
          { title: "حل النزاعات", desc: "أدوات ومهارات للتعامل مع التحديات الأسرية." },
          { title: "تطوير الذات", desc: "برامج لتعزيز النمو الشخصي داخل العلاقة." },
          { title: "دعم مستمر", desc: "متابعة دورية لضمان جودة الحياة الزوجية." }
        ].map((item, i) => (
          <div key={i} className="p-8 bg-white rounded-[2rem] border border-brand-primary/5 shadow-soft hover:shadow-gold transition-all text-right">
            <h3 className="font-bold text-brand-primary mb-2">{item.title}</h3>
            <p className="text-sm text-neutral-400 font-light">{item.desc}</p>
          </div>
        ))}
      </div>
      <button className="mt-12 px-12 py-5 premium-gradient text-white rounded-[2rem] font-bold text-lg shadow-premium hover:scale-105 transition-all">
        حجز جلسة إرشادية
      </button>
    </div>
  </div>
);

const PreparationView = () => (
  <div className="py-20 text-center space-y-10">
    <div className="w-32 h-32 bg-brand-gold/5 rounded-[3rem] flex items-center justify-center mx-auto shadow-premium">
      <Gift className="w-16 h-16 text-brand-gold" />
    </div>
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-5xl font-serif font-bold text-brand-primary">خدمات الزواج (تجهيز)</h2>
      <p className="text-xl text-neutral-500 font-light leading-relaxed">
        كل ما تحتاجه لبدء رحلتك الجديدة. نوفر لك أفضل العروض والخدمات لتجهيز منزلك وحفل زفافك بأعلى المعايير.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-10">
        {[
          { title: "تجهيز المنزل", desc: "عروض حصرية على الأثاث والأجهزة الكهربائية." },
          { title: "تنظيم الحفلات", desc: "تنسيق كامل لحفل الزفاف بأرقى القاعات." },
          { title: "عروض السفر", desc: "باقات مميزة لشهر العسل في أجمل الوجهات." },
          { title: "هدايا موثوق", desc: "خصومات خاصة لمشتركي المنصة من شركائنا." }
        ].map((item, i) => (
          <div key={i} className="p-8 bg-white rounded-[2rem] border border-brand-primary/5 shadow-soft hover:shadow-gold transition-all text-right">
            <h3 className="font-bold text-brand-primary mb-2">{item.title}</h3>
            <p className="text-sm text-neutral-400 font-light">{item.desc}</p>
          </div>
        ))}
      </div>
      <button className="mt-12 px-12 py-5 premium-gradient text-white rounded-[2rem] font-bold text-lg shadow-premium hover:scale-105 transition-all">
        استكشف العروض الحصرية
      </button>
    </div>
  </div>
);

export default function App() {
  const [user, setUser] = useState<any | null>(null);
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
      if (user?.uid === 'demo_admin') {
        setUser(null);
        setProfile(null);
        return;
      }
      await signOut(auth);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const handleDemoSignIn = () => {
    const mockUser = {
      uid: 'demo_admin',
      displayName: 'مشرف تجريبي',
      photoURL: 'https://ui-avatars.com/api/?name=Admin&background=random',
      email: 'admin@mawada.com'
    };
    const mockProfile: UserProfile = {
      uid: 'demo_admin',
      displayName: 'مشرف تجريبي',
      photoURL: 'https://ui-avatars.com/api/?name=Admin&background=random',
      role: 'admin',
      gender: 'male',
      birthDate: '1985-01-01',
      bio: 'حساب تجريبي لإدارة المنصة واستعراض المميزات.',
      values: ['الإدارة', 'التطوير'],
      goals: 'تحسين تجربة المستخدم.',
      isPublic: false,
      isVerified: true,
      createdAt: new Date()
    };
    setUser(mockUser);
    setProfile(mockProfile);
    setIsAuthReady(true);
  };

  if (loading || !isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
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
    <div dir="rtl" className="min-h-screen bg-white selection:bg-brand-primary/10 selection:text-brand-primary flex flex-col">
      <Navbar user={user} profile={profile} onSignOut={handleSignOut} currentView={view} setView={setView} />
      
      <main className="flex-grow">
        {!user ? (
          <LandingPage onSignIn={handleSignIn} onDemoSignIn={handleDemoSignIn} />
        ) : !profile ? (
          <div className="pt-32 pb-20 px-6">
            <ProfileSetup user={user} onComplete={setProfile} />
          </div>
        ) : (
          <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
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
              ) : view === 'preparation' ? (
                <motion.div
                  key="preparation"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <PreparationView />
                </motion.div>
              ) : view === 'consultation' ? (
                <motion.div
                  key="consultation"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <ConsultationView />
                </motion.div>
              ) : view === 'settings' ? (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Settings user={user} profile={profile} onUpdateProfile={setProfile} />
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

      <Footer />
    </div>
  );
}
