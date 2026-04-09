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
  Check
} from 'lucide-react';
import { cn } from '../lib/utils';

export interface AssessmentData {
  conflictStyle: string;
  lifePriority: string;
  financialView: string;
  socialPreference: string;
  traditionalValues: string;
}

const questions = [
  {
    id: 'conflictStyle',
    icon: Brain,
    question: 'كيف تتعامل مع الخلافات عادةً؟',
    options: [
      { value: 'calm', label: 'النقاش الهادئ والبحث عن حل وسط' },
      { value: 'space', label: 'أحتاج لبعض الوقت بمفردي قبل النقاش' },
      { value: 'direct', label: 'المواجهة المباشرة والصريحة فوراً' },
      { value: 'avoid', label: 'تجنب الخلاف قدر الإمكان للحفاظ على الهدوء' }
    ]
  },
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

  const handleSelect = (value: string) => {
    const newAnswers = { ...answers, [questions[currentStep].id]: value };
    setAnswers(newAnswers);
    
    if (currentStep < questions.length - 1) {
      setTimeout(() => setCurrentStep(currentStep + 1), 400);
    }
  };

  const isLastStep = currentStep === questions.length - 1;
  const canFinish = Object.keys(answers).length === questions.length;

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
              onClick={() => onComplete(answers as AssessmentData)}
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
