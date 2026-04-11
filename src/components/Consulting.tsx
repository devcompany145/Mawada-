import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Headphones, Star, Calendar, Clock, CheckCircle2, X } from 'lucide-react';
import { cn } from '../lib/utils';

const CONSULTANTS = [
  {
    id: 'c1',
    name: 'د. سارة الأحمد',
    specialty: 'مستشارة أسرية وزوجية',
    rating: 4.9,
    reviews: 120,
    price: 350,
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800',
    availableSlots: ['10:00 ص', '02:00 م', '05:00 م']
  },
  {
    id: 'c2',
    name: 'أ. خالد العبدالله',
    specialty: 'أخصائي حل النزاعات الزوجية',
    rating: 4.8,
    reviews: 85,
    price: 300,
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=800',
    availableSlots: ['11:00 ص', '04:00 م', '08:00 م']
  },
  {
    id: 'c3',
    name: 'د. نورة السالم',
    specialty: 'مستشارة تربوية ونفسية',
    rating: 5.0,
    reviews: 200,
    price: 400,
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=800',
    availableSlots: ['09:00 ص', '01:00 م', '06:00 م']
  }
];

export const Consulting = () => {
  const [selectedConsultant, setSelectedConsultant] = useState<typeof CONSULTANTS[0] | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const handleBooking = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setBookingSuccess(true);
      setTimeout(() => {
        setBookingSuccess(false);
        setSelectedConsultant(null);
        setSelectedDate('');
        setSelectedTime('');
      }, 3000);
    }, 2000);
  };

  return (
    <div className="space-y-10">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-brand-primary/5 rounded-[2rem] flex items-center justify-center mx-auto shadow-premium">
          <Headphones className="w-10 h-10 text-brand-primary" />
        </div>
        <h2 className="text-4xl font-serif font-bold text-brand-primary">استشر خبراء موثوق</h2>
        <p className="text-lg text-neutral-500 font-light max-w-2xl mx-auto">
          نخبة من المستشارين الأسريين والنفسيين لمساعدتك في بناء حياة زوجية سعيدة ومستقرة.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {CONSULTANTS.map(consultant => (
          <motion.div 
            key={consultant.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] border border-brand-primary/5 shadow-soft p-6 space-y-6 hover:shadow-xl transition-all"
          >
            <div className="flex items-center gap-4">
              <img 
                src={consultant.image} 
                alt={consultant.name} 
                className="w-20 h-20 rounded-2xl object-cover border-2 border-brand-primary/10"
              />
              <div>
                <h3 className="text-lg font-bold text-brand-primary">{consultant.name}</h3>
                <p className="text-sm text-neutral-500">{consultant.specialty}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-4 h-4 text-brand-gold fill-current" />
                  <span className="text-sm font-bold text-brand-gold">{consultant.rating}</span>
                  <span className="text-xs text-neutral-400">({consultant.reviews} تقييم)</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-neutral-50">
              <div className="text-brand-primary font-bold">
                {consultant.price} <span className="text-sm font-normal">ر.س / جلسة</span>
              </div>
              <button 
                onClick={() => setSelectedConsultant(consultant)}
                className="px-6 py-2 bg-brand-primary/10 text-brand-primary rounded-xl text-sm font-bold hover:bg-brand-primary hover:text-white transition-colors"
              >
                حجز موعد
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedConsultant && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6"
          >
            <div className="absolute inset-0 bg-brand-primary/40 backdrop-blur-sm" onClick={() => !isProcessing && setSelectedConsultant(null)} />
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[3rem] p-10 max-w-md w-full relative z-10 shadow-2xl"
            >
              {!bookingSuccess ? (
                <>
                  <button 
                    onClick={() => setSelectedConsultant(null)}
                    disabled={isProcessing}
                    className="absolute top-6 left-6 w-10 h-10 bg-neutral-50 rounded-full flex items-center justify-center text-neutral-500 hover:bg-neutral-100 transition-colors disabled:opacity-50"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  
                  <div className="space-y-8">
                    <div className="flex items-center gap-4 border-b border-neutral-50 pb-6">
                      <img src={selectedConsultant.image} alt={selectedConsultant.name} className="w-16 h-16 rounded-2xl object-cover" />
                      <div>
                        <h3 className="text-lg font-bold text-brand-primary">حجز موعد مع</h3>
                        <p className="text-brand-gold font-bold">{selectedConsultant.name}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-brand-primary uppercase tracking-widest mb-2">اختر التاريخ</label>
                        <div className="relative">
                          <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                          <input 
                            type="date" 
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full pr-12 pl-4 py-3 bg-neutral-50 border border-neutral-100 rounded-xl focus:ring-2 focus:ring-brand-primary/20 outline-none text-brand-primary font-medium"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-brand-primary uppercase tracking-widest mb-2">اختر الوقت</label>
                        <div className="grid grid-cols-3 gap-2">
                          {selectedConsultant.availableSlots.map(time => (
                            <button
                              key={time}
                              onClick={() => setSelectedTime(time)}
                              className={cn(
                                "py-2 rounded-xl text-sm font-bold transition-all border",
                                selectedTime === time 
                                  ? "bg-brand-primary text-white border-brand-primary" 
                                  : "bg-white text-neutral-500 border-neutral-100 hover:border-brand-primary/30"
                              )}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={handleBooking}
                      disabled={isProcessing || !selectedDate || !selectedTime}
                      className="w-full py-4 bg-brand-primary text-white rounded-2xl font-bold text-lg hover:bg-brand-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isProcessing ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                      ) : (
                        <>
                          <CheckCircle2 className="w-5 h-5" />
                          <span>تأكيد الحجز ({selectedConsultant.price} ر.س)</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center space-y-6 py-8">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-500"
                  >
                    <CheckCircle2 className="w-12 h-12" />
                  </motion.div>
                  <div>
                    <h3 className="text-2xl font-serif font-bold text-brand-primary mb-2">تم الحجز بنجاح!</h3>
                    <p className="text-neutral-500">تم تأكيد موعدك مع {selectedConsultant.name} يوم {selectedDate} الساعة {selectedTime}.</p>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
