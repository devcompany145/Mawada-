import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, 
  ChevronLeft, 
  Brain, 
  Target, 
  Users, 
  Wallet, 
  Heart,
  Sparkles,
  Check,
  Star,
  ShieldCheck,
  Zap,
  Smile,
  MessageCircle,
  Home,
  Headphones
} from 'lucide-react';
import { cn } from '../lib/utils';

export interface AssessmentData {
  // Core Values
  religionImportance: string;
  honestyView: string;
  loyaltyDefinition: string;
  
  // Future Goals
  careerFamilyBalance: string;
  childrenDesire: string;
  residencePreference: string;
  
  // Conflict Resolution
  angerManagement: string;
  apologyWillingness: string;
  conflictStyle: string;
  
  // Communication
  communicationDepth: string;
  sharingFeelings: string;
  communicationMedium: string;

  // General
  lifePriority: string;
  financialView: string;
  socialPreference: string;
  traditionalValues: string;
}

const questions = [
  // --- Core Values ---
  {
    id: 'religionImportance',
    icon: ShieldCheck,
    question: 'ما مدى تأثير الالتزام الديني على قراراتك اليومية؟',
    options: [
      { value: 'central', label: 'هو المحرك الأساسي لكل قراراتي' },
      { value: 'important', label: 'مهم جداً وأحاول الالتزام قدر المستطاع' },
      { value: 'moderate', label: 'أهتم بالجوهر والقيم الأخلاقية العامة' },
      { value: 'personal', label: 'علاقة شخصية خاصة لا تتدخل في كل التفاصيل' }
    ]
  },
  {
    id: 'honestyView',
    icon: Zap,
    question: 'كيف تنظر إلى الصراحة المطلقة بين الزوجين؟',
    options: [
      { value: 'absolute', label: 'يجب قول الحقيقة كاملة مهما كانت العواقب' },
      { value: 'balanced', label: 'الصراحة مطلوبة مع مراعاة مشاعر الطرف الآخر' },
      { value: 'selective', label: 'هناك أمور خاصة لا داعي لمشاركتها دائماً' },
      { value: 'tactful', label: 'أفضل "الكذب الأبيض" أحياناً لتجنب المشاكل' }
    ]
  },
  {
    id: 'loyaltyDefinition',
    icon: Heart,
    question: 'ما هو المفهوم الأهم للوفاء في نظرك؟',
    options: [
      { value: 'exclusivity', label: 'الإخلاص التام وعدم التفكير في غير الشريك' },
      { value: 'support', label: 'الوقوف بجانب الشريك في الأزمات والشدائد' },
      { value: 'trust', label: 'بناء جسور الثقة وعدم الشك' },
      { value: 'transparency', label: 'الوضوح التام في كل التحركات والعلاقات' }
    ]
  },

  // --- Future Goals ---
  {
    id: 'careerFamilyBalance',
    icon: Target,
    question: 'إذا تعارض النجاح المهني مع الاستقرار الأسري، فماذا تختار؟',
    options: [
      { value: 'family_first', label: 'الأسرة دائماً هي الأولوية القصوى' },
      { value: 'career_first', label: 'تحقيق الذات مهنياً يخدم الأسرة لاحقاً' },
      { value: 'compromise', label: 'البحث عن حل وسط يرضي الطرفين' },
      { value: 'flexible', label: 'يعتمد على المرحلة والظروف المحيطة' }
    ]
  },
  {
    id: 'childrenDesire',
    icon: Smile,
    question: 'ما هي رؤيتك لموضوع الإنجاب وتكوين أسرة؟',
    options: [
      { value: 'immediate', label: 'أرغب في الإنجاب في أقرب وقت ممكن' },
      { value: 'planned', label: 'بعد فترة من الاستقرار والتعارف (سنة أو أكثر)' },
      { value: 'limited', label: 'أفضل عدداً محدوداً جداً من الأطفال' },
      { value: 'open', label: 'أترك الأمر للظروف والاتفاق المستقبلي' }
    ]
  },
  {
    id: 'residencePreference',
    icon: Home,
    question: 'أين تفضل العيش والاستقرار في المستقبل؟',
    options: [
      { value: 'city', label: 'في قلب المدينة حيث الحيوية والخدمات' },
      { value: 'suburbs', label: 'في الضواحي الهادئة القريبة من المدينة' },
      { value: 'rural', label: 'في مكان ريفي أو بعيد عن الضجيج' },
      { value: 'abroad', label: 'لدي رغبة في السفر والاستقرار خارج البلاد' }
    ]
  },

  // --- Conflict Resolution ---
  {
    id: 'angerManagement',
    icon: Brain,
    question: 'كيف تتصرف عندما تشعر بالغضب الشديد من الشريك؟',
    options: [
      { value: 'silent', label: 'ألتزم الصمت تماماً حتى أهدأ' },
      { value: 'expressive', label: 'أعبر عن غضبي فوراً وبكل صراحة' },
      { value: 'logical', label: 'أحاول كبت مشاعري والنقاش بمنطقية' },
      { value: 'physical_activity', label: 'أخرج من المكان أو أمارس نشاطاً لتفريغ الطاقة' }
    ]
  },
  {
    id: 'apologyWillingness',
    icon: Check,
    question: 'ما مدى سهولة اعتذارك إذا اكتشفت أنك مخطئ؟',
    options: [
      { value: 'easy', label: 'أعتذر فوراً وبكل بساطة' },
      { value: 'difficult', label: 'أجد صعوبة في الاعتذار المباشر ولكن ألمح له' },
      { value: 'reciprocal', label: 'أعتذر فقط إذا اعتذر الطرف الآخر عن خطئه أيضاً' },
      { value: 'action_based', label: 'أفضل الاعتذار بالأفعال لا بالأقوال' }
    ]
  },
  {
    id: 'conflictStyle',
    icon: Brain,
    question: 'ما هو أسلوبك المفضل لإنهاء أي خلاف؟',
    options: [
      { value: 'calm', label: 'النقاش الهادئ والبحث عن حل وسط' },
      { value: 'space', label: 'أحتاج لبعض الوقت بمفردي قبل النقاش' },
      { value: 'direct', label: 'المواجهة المباشرة والصريحة فوراً' },
      { value: 'avoid', label: 'تجنب الخلاف قدر الإمكان للحفاظ على الهدوء' }
    ]
  },

  // --- Communication Patterns ---
  {
    id: 'communicationDepth',
    icon: MessageCircle,
    question: 'كم مرة تحتاج لإجراء حوارات عميقة حول علاقتكما؟',
    options: [
      { value: 'daily', label: 'بشكل يومي ومستمر' },
      { value: 'weekly', label: 'مرة في الأسبوع كافية جداً' },
      { value: 'as_needed', label: 'فقط عند وجود مشكلة أو موضوع طارئ' },
      { value: 'rarely', label: 'أفضل العيش ببساطة دون كثرة تحليل' }
    ]
  },
  {
    id: 'sharingFeelings',
    icon: Sparkles,
    question: 'كيف تصف قدرتك على مشاركة مشاعرك الداخلية؟',
    options: [
      { value: 'open', label: 'كتاب مفتوح، أشارك كل ما أشعر به' },
      { value: 'guarded', label: 'أحتاج وقتاً طويلاً لأثق وأشارك مشاعري' },
      { value: 'selective', label: 'أشارك الإيجابيات وأحتفظ بالسلبيات لنفسي' },
      { value: 'private', label: 'أفضل معالجة مشاعري داخلياً دون إزعاج الآخرين' }
    ]
  },
  {
    id: 'communicationMedium',
    icon: Headphones,
    question: 'ما هي وسيلة التواصل المفضلة لديك في المواضيع الهامة؟',
    options: [
      { value: 'face_to_face', label: 'المواجهة المباشرة وجهاً لوجه' },
      { value: 'phone', label: 'اتصال هاتفي لسماع نبرة الصوت' },
      { value: 'text', label: 'الرسائل النصية لترتيب الأفكار بدقة' },
      { value: 'written', label: 'كتابة رسالة طويلة (إيميل أو ورقة)' }
    ]
  },

  // --- General ---
  {
    id: 'lifePriority',
    icon: Target,
    question: 'ما هي أولويتك الكبرى في الحياة حالياً؟',
    options: [
      { value: 'family', label: 'بناء أسرة مستقرة وتربية الأبناء' },
      { value: 'career', label: 'النجاح المهني وتحقيق الذات مالياً' },
      { value: 'religion', label: 'الالتزام الديني والنمو الروحي' },
      { value: 'growth', label: 'تطوير الذات والتعلم المستمر' }
    ]
  },
  {
    id: 'financialView',
    icon: Wallet,
    question: 'كيف ترى إدارة الأموال في الزواج؟',
    options: [
      { value: 'shared', label: 'ميزانية مشتركة تماماً لكل شيء' },
      { value: 'separate', label: 'استقلال مالي مع المساهمة في المصاريف' },
      { value: 'provider', label: 'الرجل هو المسؤول الأساسي عن النفقة' },
      { value: 'balanced', label: 'توزيع المسؤوليات حسب القدرة والاتفاق' }
    ]
  },
  {
    id: 'socialPreference',
    icon: Users,
    question: 'ما هو نمط حياتك الاجتماعي المفضل؟',
    options: [
      { value: 'introvert', label: 'أفضل الهدوء والجلسات العائلية الضيقة' },
      { value: 'extrovert', label: 'أحب المناسبات الاجتماعية واللقاءات الكثيرة' },
      { value: 'balanced', label: 'توازن بين الخصوصية والاجتماعيات' },
      { value: 'private', label: 'أميل للخصوصية الشديدة والابتعاد عن الأضواء' }
    ]
  },
  {
    id: 'traditionalValues',
    icon: Heart,
    question: 'ما مدى أهمية القيم والتقاليد في حياتك؟',
    options: [
      { value: 'very_high', label: 'أساسية جداً ولا يمكن التنازل عنها' },
      { value: 'moderate', label: 'مهمة ولكن مع مرونة في التطبيق' },
      { value: 'low', label: 'أفضل النمط العصري والتحرر من القيود' },
      { value: 'selective', label: 'أختار ما يناسب قناعاتي الشخصية منها' }
    ]
  }
];

export const Assessment = ({ onComplete }: { onComplete: (data: AssessmentData) => void }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<AssessmentData>>({});
  const [showStrengths, setShowStrengths] = useState(false);

  const handleSelect = (value: string) => {
    const newAnswers = { ...answers, [questions[currentStep].id]: value };
    setAnswers(newAnswers);
    
    if (currentStep < questions.length - 1) {
      setTimeout(() => setCurrentStep(currentStep + 1), 400);
    }
  };

  const isLastStep = currentStep === questions.length - 1;
  const canFinish = Object.keys(answers).length === questions.length;

  const getStrengths = (data: AssessmentData) => {
    const strengths = [];
    
    // Core Values
    if (data.religionImportance === 'central') strengths.push({ title: 'العمق الروحي', desc: 'تمتلك مبادئ راسخة تجعل منك شريكاً صاحب رسالة وقيم واضحة.', icon: ShieldCheck });
    if (data.honestyView === 'absolute') strengths.push({ title: 'النزاهة المطلقة', desc: 'تعتبر الصراحة ركيزة أساسية، مما يبني ثقة عميقة لا تتزعزع.', icon: Zap });
    
    // Future Goals
    if (data.careerFamilyBalance === 'family_first') strengths.push({ title: 'الإخلاص الأسري', desc: 'تضع استقرار بيتك في المقدمة، مما يضمن بيئة دافئة ومستقرة.', icon: Heart });
    if (data.childrenDesire === 'immediate' || data.childrenDesire === 'planned') strengths.push({ title: 'روح الأبوة/الأمومة', desc: 'لديك رؤية واضحة لبناء جيل جديد، مما يعكس نضجاً عاطفياً.', icon: Smile });
    
    // Conflict Resolution
    if (data.conflictStyle === 'calm') strengths.push({ title: 'الحكمة والهدوء', desc: 'تمتلك قدرة عالية على إدارة الأزمات بنقاش بناء وهادئ.', icon: ShieldCheck });
    if (data.apologyWillingness === 'easy') strengths.push({ title: 'التواضع والنبل', desc: 'قدرتك على الاعتذار تعكس شخصية قوية وواثقة تسعى للحق دائماً.', icon: Check });
    
    // Communication
    if (data.communicationDepth === 'daily') strengths.push({ title: 'التواصل الفعال', desc: 'تحرص على تجديد الروابط العاطفية من خلال الحوار المستمر.', icon: MessageCircle });
    if (data.sharingFeelings === 'open') strengths.push({ title: 'الذكاء العاطفي', desc: 'قدرتك على التعبير عن مشاعرك تفتح آفاقاً للتفاهم العميق مع الشريك.', icon: Sparkles });
    
    // Fallbacks
    if (strengths.length < 3) {
      strengths.push({ title: 'الوضوح والصراحة', desc: 'تفضل دائماً الوضوح في التعامل مما يبني جسور الثقة.', icon: Zap });
      strengths.push({ title: 'المرونة النفسية', desc: 'لديك قدرة على التكيف مع مختلف الشخصيات والظروف.', icon: Smile });
    }
    
    return strengths.slice(0, 3);
  };

  if (showStrengths) {
    const strengths = getStrengths(answers as AssessmentData);
    return (
      <div className="max-w-4xl mx-auto px-6 py-20">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <div className="w-24 h-24 bg-brand-gold/10 rounded-[2.5rem] flex items-center justify-center text-brand-gold mx-auto mb-8 shadow-soft">
            <Star className="w-12 h-12 fill-current" />
          </div>
          <h2 className="text-5xl font-serif font-bold text-brand-primary mb-6">اكتشفنا نقاط قوتك!</h2>
          <p className="text-xl text-neutral-500 max-w-2xl mx-auto leading-relaxed font-light">
            بناءً على إجاباتك، حدد الذكاء الاصطناعي أهم السمات التي تميز شخصيتك كشريك حياة مثالي.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {strengths.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              className="bg-white rounded-[3rem] p-10 border border-brand-primary/5 shadow-premium group hover:shadow-gold transition-all relative overflow-hidden"
            >
              <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-brand-gold/5 rounded-full blur-3xl group-hover:bg-brand-gold/10 transition-all" />
              <div className="w-16 h-16 bg-brand-gold/10 rounded-2xl flex items-center justify-center text-brand-gold mb-8 shadow-sm group-hover:scale-110 transition-transform">
                <s.icon className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-brand-primary mb-4">{s.title}</h3>
              <p className="text-neutral-500 text-sm leading-relaxed font-light italic">{s.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onComplete(answers as AssessmentData)}
            className="px-16 py-7 premium-gradient text-white rounded-[2.5rem] font-bold text-xl shadow-2xl shadow-brand-primary/30 flex items-center gap-4 group"
          >
            <span>إتمام الملف الشخصي</span>
            <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6">
      <div className="mb-20 text-center">
        <motion.div 
          initial={{ scale: 0, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          className="w-24 h-24 premium-gradient rounded-[2.5rem] flex items-center justify-center text-brand-gold mx-auto mb-8 shadow-2xl shadow-brand-primary/20"
        >
          <Sparkles className="w-12 h-12" />
        </motion.div>
        <h2 className="text-5xl md:text-6xl font-serif font-bold text-brand-primary mb-6">اختبار الشخصية والتوافق العميق</h2>
        <p className="text-xl text-neutral-500 max-w-2xl mx-auto leading-relaxed font-light">
          أجب بصدق لنتمكن من رسم صورة دقيقة لشخصيتك ومساعدتك في العثور على الشريك الأنسب الذي يشاركك قيمك وأهدافك.
        </p>
      </div>

      <div className="relative">
        {/* Progress Bar */}
        <div className="w-full h-3 bg-neutral-100 rounded-full mb-16 overflow-hidden shadow-inner border border-neutral-200/50">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
            className="h-full premium-gradient rounded-full shadow-lg"
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="space-y-12"
          >
            <div className="flex items-center gap-8 mb-10">
              <div className="p-6 premium-gradient rounded-[2rem] text-brand-gold shadow-xl">
                {(() => {
                  const Icon = questions[currentStep].icon;
                  return <Icon className="w-10 h-10" />;
                })()}
              </div>
              <h3 className="text-3xl md:text-4xl font-serif font-bold text-brand-primary leading-tight">
                {questions[currentStep].question}
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-5">
              {questions[currentStep].options.map((option, idx) => (
                <motion.button
                  key={option.value}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    "p-8 rounded-[2rem] border-2 text-right transition-all flex items-center justify-between group relative overflow-hidden",
                    answers[questions[currentStep].id as keyof AssessmentData] === option.value
                      ? "border-brand-primary bg-brand-primary/5 text-brand-primary shadow-soft"
                      : "border-neutral-100 hover:border-brand-primary/30 text-neutral-600 hover:bg-white hover:shadow-md"
                  )}
                >
                  <span className="font-bold text-xl relative z-10">{option.label}</span>
                  <div className={cn(
                    "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all relative z-10",
                    answers[questions[currentStep].id as keyof AssessmentData] === option.value
                      ? "border-brand-primary bg-brand-primary shadow-lg shadow-brand-primary/20"
                      : "border-neutral-200 group-hover:border-brand-primary/30"
                  )}>
                    {answers[questions[currentStep].id as keyof AssessmentData] === option.value && (
                      <Check className="w-5 h-5 text-white" />
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-20 flex justify-between items-center">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="flex items-center gap-3 text-neutral-400 hover:text-brand-primary disabled:opacity-0 transition-all font-bold uppercase tracking-[0.2em] text-xs"
          >
            <ChevronLeft className="w-6 h-6" />
            <span>السابق</span>
          </button>
          
          {isLastStep && canFinish && (
              <motion.button
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={() => setShowStrengths(true)}
                className="px-12 py-6 premium-gradient text-white rounded-[2.5rem] font-bold text-lg shadow-2xl shadow-brand-primary/30 hover:scale-105 transition-all flex items-center gap-4 group"
              >
                <span>إرسال النتائج وتحليل الشخصية</span>
                <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform text-brand-gold" />
              </motion.button>
          )}
        </div>
      </div>
    </div>
  );
};
