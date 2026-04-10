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
  Sparkles,
  Filter,
  ArrowUpDown,
  Calendar,
  BrainCircuit,
  ShieldCheck,
  Star,
  Target,
  Users,
  Wallet,
  Smile,
  MapPin,
  Brain,
  Search,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';
import { UserProfile } from '../App';
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
  otherProfile?: UserProfile;
}

export const Matches = ({ currentUserUid, onStartChat }: { currentUserUid: string, onStartChat: (uid: string, name: string) => void }) => {
  const [matches, setMatches] = useState<MatchWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [displaySettings, setDisplaySettings] = useState({
    showBio: false,
    showValues: false,
    showAiAnalysis: true
  });
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);

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

  const filteredMatches = matches
    .filter(m => {
      const matchesStatus = filterStatus === 'all' || m.status === filterStatus;
      const matchesSearch = m.otherProfile?.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? true;
      return matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      const dateA = a.createdAt?.seconds || 0;
      const dateB = b.createdAt?.seconds || 0;
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

  const pendingMatches = filteredMatches.filter(m => m.status === 'pending');
  const acceptedMatches = filteredMatches.filter(m => m.status === 'accepted');
  const rejectedMatches = filteredMatches.filter(m => m.status === 'rejected');

  return (
    <div className="space-y-16">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-6 bg-white/60 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/40 shadow-soft">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary">
              <Filter className="w-5 h-5" />
            </div>
            <div className="flex gap-2">
              {(['all', 'pending', 'accepted', 'rejected'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={cn(
                    "px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border",
                    filterStatus === status 
                      ? "bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/20" 
                      : "bg-white text-neutral-400 border-neutral-100 hover:border-brand-primary/20 hover:text-brand-primary"
                  )}
                >
                  {status === 'all' ? 'الكل' : status === 'pending' ? 'قيد الانتظار' : status === 'accepted' ? 'مقبول' : 'معتذر'}
                </button>
              ))}
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 right-6 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-brand-primary transition-colors">
              <Search className="w-4 h-4" />
            </div>
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="البحث بالاسم..."
              className="pr-14 pl-6 py-2.5 bg-white border border-neutral-100 rounded-full text-xs font-medium text-brand-primary placeholder:text-neutral-400 focus:ring-2 focus:ring-brand-primary/10 focus:border-brand-primary/20 outline-none w-64 transition-all"
            />
          </div>

          <div className="flex items-center gap-3 bg-brand-cream/50 p-1.5 rounded-full border border-brand-primary/5">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-brand-primary shadow-sm">
              <Settings className="w-4 h-4" />
            </div>
            <div className="flex gap-1">
              <button 
                onClick={() => setDisplaySettings(prev => ({ ...prev, showBio: !prev.showBio }))}
                className={cn(
                  "px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-wider transition-all",
                  displaySettings.showBio ? "bg-brand-primary text-white shadow-md" : "text-neutral-400 hover:text-brand-primary"
                )}
              >
                النبذة
              </button>
              <button 
                onClick={() => setDisplaySettings(prev => ({ ...prev, showValues: !prev.showValues }))}
                className={cn(
                  "px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-wider transition-all",
                  displaySettings.showValues ? "bg-brand-primary text-white shadow-md" : "text-neutral-400 hover:text-brand-primary"
                )}
              >
                القيم
              </button>
              <button 
                onClick={() => setDisplaySettings(prev => ({ ...prev, showAiAnalysis: !prev.showAiAnalysis }))}
                className={cn(
                  "px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-wider transition-all",
                  displaySettings.showAiAnalysis ? "bg-brand-primary text-white shadow-md" : "text-neutral-400 hover:text-brand-primary"
                )}
              >
                التحليل
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-brand-gold/10 rounded-xl flex items-center justify-center text-brand-gold">
            <ArrowUpDown className="w-5 h-5" />
          </div>
          <button
            onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
            className="flex items-center gap-3 px-6 py-2.5 bg-white border border-neutral-100 rounded-full text-[10px] font-bold text-neutral-600 uppercase tracking-widest hover:border-brand-gold/20 hover:text-brand-gold transition-all"
          >
            <Calendar className="w-4 h-4" />
            <span>التاريخ: {sortOrder === 'desc' ? 'الأحدث' : 'الأقدم'}</span>
          </button>
        </div>
      </div>

      {filterStatus === 'all' ? (
        <>
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
                    onViewProfile={setSelectedProfile}
                    displaySettings={displaySettings}
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
                    onViewProfile={setSelectedProfile}
                    displaySettings={displaySettings}
                  />
                ))
              ) : (
                <div className="col-span-full py-20 text-center bg-white/40 backdrop-blur-xl rounded-[3rem] border border-white/30 italic text-neutral-400">
                  لم يتم قبول أي مطابقات بعد.
                </div>
              )}
            </div>
          </section>

          {rejectedMatches.length > 0 && (
            <section>
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-neutral-100 rounded-2xl flex items-center justify-center text-neutral-400">
                  <XCircle className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-4xl font-serif font-bold text-brand-primary">طلبات معتذر عنها</h2>
                  <p className="text-neutral-400 text-sm font-light">الطلبات التي لم يتم التوافق عليها</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {rejectedMatches.map((match, i) => (
                  <MatchCard 
                    key={match.id} 
                    match={match} 
                    index={i} 
                    isOwnRequest={match.fromUid === currentUserUid} 
                    onStartChat={onStartChat}
                    currentUserUid={currentUserUid}
                    onViewProfile={setSelectedProfile}
                    displaySettings={displaySettings}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      ) : (
        <section>
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary">
              {filterStatus === 'pending' ? <Clock className="w-6 h-6" /> : filterStatus === 'accepted' ? <Heart className="w-6 h-6 fill-current" /> : <XCircle className="w-6 h-6" />}
            </div>
            <div>
              <h2 className="text-4xl font-serif font-bold text-brand-primary">
                {filterStatus === 'pending' ? 'طلبات قيد الانتظار' : filterStatus === 'accepted' ? 'المطابقات المقبولة' : 'الطلبات المعتذر عنها'}
              </h2>
              <p className="text-neutral-400 text-sm font-light">نتائج البحث المصفاة بناءً على اختيارك</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {filteredMatches.length > 0 ? (
              filteredMatches.map((match, i) => (
                <MatchCard 
                  key={match.id} 
                  match={match} 
                  index={i} 
                  isOwnRequest={match.fromUid === currentUserUid} 
                  onStartChat={onStartChat}
                  currentUserUid={currentUserUid}
                  onViewProfile={setSelectedProfile}
                  displaySettings={displaySettings}
                />
              ))
            ) : (
              <div className="col-span-full py-20 text-center bg-white/40 backdrop-blur-xl rounded-[3rem] border border-white/30 italic text-neutral-400">
                لا توجد نتائج تطابق هذا الفلتر.
              </div>
            )}
          </div>
        </section>
      )}

      <AnimatePresence>
        {selectedProfile && (
          <ProfileModal 
            profile={selectedProfile} 
            onClose={() => setSelectedProfile(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const ProfileModal = ({ profile, onClose }: { profile: UserProfile, onClose: () => void }) => {
  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-10"
    >
      <div className="absolute inset-0 bg-brand-primary/40 backdrop-blur-md" onClick={onClose} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-brand-cream w-full max-w-4xl max-h-[90vh] rounded-[4rem] shadow-premium overflow-hidden relative flex flex-col"
      >
        <button 
          onClick={onClose}
          className="absolute top-8 left-8 z-20 w-12 h-12 bg-white/20 backdrop-blur-md hover:bg-white/40 rounded-full flex items-center justify-center text-white transition-all"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="overflow-y-auto flex-grow custom-scrollbar">
          {/* Hero Header */}
          <div className="relative h-80 sm:h-96">
            <img 
              src={profile.photoURL || `https://ui-avatars.com/api/?name=${profile.displayName}&background=random`} 
              alt={profile.displayName} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-primary via-brand-primary/20 to-transparent" />
            
            <div className="absolute bottom-10 right-10 left-10 text-right">
              <div className="flex items-center gap-4 mb-4">
                <h2 className="text-4xl sm:text-6xl font-serif font-bold text-white">{profile.displayName}</h2>
                {profile.isVerified && (
                  <div className="w-8 h-8 bg-brand-gold rounded-full flex items-center justify-center text-brand-primary shadow-lg">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-4">
                <div className="px-6 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white text-sm font-bold">
                  {calculateAge(profile.birthDate)} سنة
                </div>
                <div className="px-6 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white text-sm font-bold">
                  {profile.gender === 'male' ? 'رجل' : 'امرأة'}
                </div>
                {profile.aiAnalysis?.profileTitle && (
                  <div className="px-6 py-2 bg-brand-gold text-brand-primary rounded-full text-sm font-bold shadow-lg">
                    {profile.aiAnalysis.profileTitle}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-10 sm:p-16 space-y-16">
            {/* Bio */}
            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-brand-primary/5 rounded-xl flex items-center justify-center text-brand-primary">
                  <UserIcon className="w-5 h-5" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-brand-primary">نبذة تعريفية</h3>
              </div>
              <p className="text-xl text-neutral-500 font-light leading-relaxed text-right">
                {profile.bio || "لا توجد نبذة تعريفية متاحة."}
              </p>
            </section>

            {/* Values & Goals */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <section className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-brand-gold/10 rounded-xl flex items-center justify-center text-brand-gold">
                    <Star className="w-5 h-5" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-brand-primary">القيم والمبادئ</h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  {profile.values?.map((val, i) => (
                    <span key={i} className="px-5 py-2 bg-white border border-brand-primary/5 rounded-2xl text-sm text-neutral-600 shadow-sm">
                      {val}
                    </span>
                  ))}
                </div>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-brand-secondary/10 rounded-xl flex items-center justify-center text-brand-secondary">
                    <Target className="w-5 h-5" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-brand-primary">أهداف الزواج</h3>
                </div>
                <p className="text-neutral-500 font-light leading-relaxed">
                  {profile.goals || "لم يتم تحديد أهداف الزواج بعد."}
                </p>
              </section>
            </div>

            {/* AI Analysis */}
            {profile.aiAnalysis && (
              <section className="bg-white rounded-[3rem] p-10 border border-brand-primary/5 shadow-soft space-y-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-brand-gold" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-brand-primary/5 rounded-2xl flex items-center justify-center text-brand-primary">
                      <BrainCircuit className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-serif font-bold text-brand-primary">تحليل موثوق الذكي</h3>
                      <p className="text-xs text-brand-gold font-bold uppercase tracking-widest">بناءً على اختبار الشخصية</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">جاهزية الزواج</p>
                    <div className="text-3xl font-bold text-brand-primary">{profile.aiAnalysis.readinessScore}%</div>
                  </div>
                </div>
                <p className="text-neutral-500 font-light leading-relaxed italic border-r-4 border-brand-gold/20 pr-6">
                  {profile.aiAnalysis.detailedAnalysis}
                </p>
              </section>
            )}

            {/* Assessment Strengths */}
            {profile.assessment && (
              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-brand-primary/5 rounded-xl flex items-center justify-center text-brand-primary">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-brand-primary">سمات الشخصية</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { label: 'أسلوب النقاش', value: profile.assessment.conflictStyle, icon: Brain },
                    { label: 'الأولوية الحالية', value: profile.assessment.lifePriority, icon: Target },
                    { label: 'النمط الاجتماعي', value: profile.assessment.socialPreference, icon: Users },
                    { label: 'النظرة المالية', value: profile.assessment.financialView, icon: Wallet },
                    { label: 'القيم التقليدية', value: profile.assessment.traditionalValues, icon: Heart }
                  ].map((item, i) => (
                    <div key={i} className="p-6 bg-white rounded-3xl border border-brand-primary/5 shadow-sm flex items-center gap-4">
                      <div className="w-10 h-10 bg-brand-gold/10 rounded-xl flex items-center justify-center text-brand-gold shrink-0">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{item.label}</p>
                        <p className="text-sm font-bold text-brand-primary">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const MatchCard = ({ 
  match, 
  index, 
  isOwnRequest,
  onStartChat,
  currentUserUid,
  onViewProfile,
  displaySettings
}: { 
  match: MatchWithProfile, 
  index: number, 
  isOwnRequest: boolean,
  onStartChat: (uid: string, name: string) => void,
  currentUserUid: string,
  onViewProfile: (profile: UserProfile) => void,
  displaySettings: { showBio: boolean, showValues: boolean, showAiAnalysis: boolean }
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
      className="bg-white rounded-[3.5rem] p-10 border border-brand-primary/5 hover:border-brand-primary/10 hover:shadow-premium transition-all duration-500 group relative overflow-hidden flex flex-col h-full"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-brand-gold/10 transition-all" />
      
      {/* Header: Profile & Status */}
      <div className="flex items-start justify-between mb-8 relative z-10">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 bg-brand-cream rounded-[2.5rem] flex items-center justify-center text-brand-primary shadow-inner group-hover:scale-105 transition-transform overflow-hidden border-2 border-white">
              <img src={match.otherProfile?.photoURL || `https://ui-avatars.com/api/?name=${match.otherProfile?.displayName}&background=random`} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            {match.status === 'accepted' && (
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center text-white shadow-lg">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            )}
          </div>
          <div>
            <h3 className="text-3xl font-serif font-bold text-brand-primary mb-2">{match.otherProfile?.displayName || 'مستخدم موثوق'}</h3>
            <div className={cn(
              "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border shadow-sm",
              statusColors[match.status as keyof typeof statusColors]
            )}>
              {match.status === 'pending' ? <Clock className="w-3.5 h-3.5" /> : match.status === 'accepted' ? <Heart className="w-3.5 h-3.5 fill-current" /> : <XCircle className="w-3.5 h-3.5" />}
              {statusLabels[match.status as keyof typeof statusLabels]}
            </div>
          </div>
        </div>
      </div>

      {/* Optional Details */}
      <div className="relative z-10 space-y-4 mb-6">
        {displaySettings.showBio && match.otherProfile?.bio && (
          <p className="text-xs text-neutral-500 line-clamp-2 italic font-light leading-relaxed border-r-2 border-brand-gold/20 pr-3">
            "{match.otherProfile.bio}"
          </p>
        )}
        
        {displaySettings.showValues && match.otherProfile?.values && match.otherProfile.values.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {match.otherProfile.values.slice(0, 3).map((val, i) => (
              <span key={i} className="px-3 py-1 bg-brand-gold/5 border border-brand-gold/10 rounded-lg text-[9px] text-brand-gold font-bold">
                {val}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Compatibility Section - Premium Display */}
      {match.compatibilityScore && (
        <div className="relative mb-8 z-10">
          <div className="bg-gradient-to-br from-brand-primary/5 to-brand-gold/5 rounded-[2.5rem] p-8 border border-brand-gold/20 flex items-center justify-between overflow-hidden group/score relative">
            <div className="absolute top-0 right-0 w-40 h-full bg-brand-gold/10 skew-x-12 -mr-20 blur-2xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
                <p className="text-[10px] font-bold text-brand-gold uppercase tracking-[0.3em]">نسبة التوافق</p>
              </div>
              <h4 className="text-6xl font-bold text-brand-primary tracking-tighter flex items-baseline">
                {match.compatibilityScore}
                <span className="text-2xl text-brand-gold ml-1 font-serif">%</span>
              </h4>
              <p className="text-[9px] text-neutral-400 font-medium mt-1">بناءً على تحليل القيم والأهداف</p>
            </div>
            <div className="relative z-10 w-24 h-24">
              <svg className="w-full h-full transform -rotate-90 drop-shadow-lg">
                <circle
                  cx="48"
                  cy="48"
                  r="42"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-brand-gold/10"
                />
                <motion.circle
                  cx="48"
                  cy="48"
                  r="42"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={264}
                  initial={{ strokeDashoffset: 264 }}
                  animate={{ strokeDashoffset: 264 - (264 * match.compatibilityScore) / 100 }}
                  transition={{ duration: 2, ease: "circOut", delay: 0.5 }}
                  strokeLinecap="round"
                  className="text-brand-gold"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-inner">
                  <Heart className={cn("w-6 h-6", match.compatibilityScore > 80 ? "text-brand-secondary fill-current" : "text-brand-gold")} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Analysis Section - Premium Glassmorphism */}
      {displaySettings.showAiAnalysis && (
        <div className="flex-grow mb-10 relative z-10">
          <div className="bg-brand-primary/5 backdrop-blur-sm rounded-[2.5rem] p-8 border border-brand-primary/10 h-full relative overflow-hidden group/ai">
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-brand-primary/5 rounded-full blur-3xl group-hover/ai:bg-brand-primary/10 transition-all" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-primary text-white flex items-center justify-center shadow-lg shadow-brand-primary/20">
                    <BrainCircuit className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-brand-primary uppercase tracking-[0.2em] block">تحليل موثوق الذكي</span>
                    <span className="text-[8px] text-brand-gold font-bold uppercase tracking-widest">AI Insights</span>
                  </div>
                </div>
                <div className="px-3 py-1 bg-brand-gold/10 rounded-full border border-brand-gold/20 text-[8px] font-bold text-brand-gold uppercase tracking-widest">
                  دقة عالية
                </div>
              </div>
              <div className="relative">
                <div className="absolute top-0 right-0 w-1 h-full bg-brand-gold/20 rounded-full" />
                <p className="text-sm leading-relaxed text-neutral-600 italic font-light pr-6">
                  {match.analysis || "تحليل التوافق الذكي متاح للمطابقات المقبولة لبناء جسور التفاهم والانسجام بين الطرفين."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4 relative z-10 mt-auto">
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
            <button 
              onClick={() => match.otherProfile && onViewProfile(match.otherProfile)}
              className="flex-1 py-5 bg-brand-cream text-brand-primary rounded-[1.5rem] font-bold text-xs uppercase tracking-widest hover:bg-brand-primary hover:text-white transition-all flex items-center justify-center gap-3 group/btn"
            >
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
