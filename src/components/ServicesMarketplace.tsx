import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Star, MapPin, CreditCard, CheckCircle2, X } from 'lucide-react';
import { cn } from '../lib/utils';

const SERVICES = [
  {
    id: 's1',
    category: 'قاعات الأفراح',
    title: 'قاعة اللؤلؤة الملكية',
    provider: 'مجموعة الفنادق الكبرى',
    price: 15000,
    rating: 4.8,
    location: 'الرياض',
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 's2',
    category: 'تنظيم الحفلات',
    title: 'باقة الزفاف المتكاملة',
    provider: 'أفراح لتنظيم المناسبات',
    price: 8000,
    rating: 4.9,
    location: 'جدة',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 's3',
    category: 'شهر العسل',
    title: 'رحلة المالديف الساحرة',
    provider: 'وكالة السفر المميزة',
    price: 25000,
    rating: 5.0,
    location: 'جزر المالديف',
    image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 's4',
    category: 'أثاث المنزل',
    title: 'تأثيث الشقة بالكامل',
    provider: 'مفروشات العائلة',
    price: 35000,
    rating: 4.7,
    location: 'الدمام',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800'
  }
];

const CATEGORIES = ['الكل', 'قاعات الأفراح', 'تنظيم الحفلات', 'شهر العسل', 'أثاث المنزل'];

export const ServicesMarketplace = () => {
  const [activeCategory, setActiveCategory] = useState('الكل');
  const [selectedService, setSelectedService] = useState<typeof SERVICES[0] | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const filteredServices = activeCategory === 'الكل' 
    ? SERVICES 
    : SERVICES.filter(s => s.category === activeCategory);

  const handlePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
      setTimeout(() => {
        setPaymentSuccess(false);
        setSelectedService(null);
      }, 3000);
    }, 2000);
  };

  return (
    <div className="space-y-10">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-brand-gold/10 rounded-[2rem] flex items-center justify-center mx-auto shadow-premium">
          <ShoppingBag className="w-10 h-10 text-brand-gold" />
        </div>
        <h2 className="text-4xl font-serif font-bold text-brand-primary">سوق خدمات الزواج</h2>
        <p className="text-lg text-neutral-500 font-light max-w-2xl mx-auto">
          كل ما تحتاجه لتجهيز زفافك ومنزلك في مكان واحد. اختر الخدمة، وادفع بأمان.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "px-6 py-2.5 rounded-full text-sm font-bold transition-all",
              activeCategory === cat 
                ? "bg-brand-primary text-white shadow-md" 
                : "bg-neutral-50 text-neutral-500 hover:bg-neutral-100"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredServices.map(service => (
          <motion.div 
            key={service.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2.5rem] border border-brand-primary/5 shadow-soft overflow-hidden group hover:shadow-xl transition-all"
          >
            <div className="h-48 overflow-hidden relative">
              <img 
                src={service.image} 
                alt={service.title} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[10px] font-bold text-brand-primary uppercase tracking-widest">
                {service.category}
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-brand-primary mb-1">{service.title}</h3>
                  <p className="text-sm text-neutral-500">{service.provider}</p>
                </div>
                <div className="flex items-center gap-1 bg-brand-gold/10 px-2 py-1 rounded-lg">
                  <Star className="w-4 h-4 text-brand-gold fill-current" />
                  <span className="text-sm font-bold text-brand-gold">{service.rating}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-neutral-400 text-sm">
                <MapPin className="w-4 h-4" />
                <span>{service.location}</span>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-neutral-50">
                <div className="text-brand-primary font-bold text-xl">
                  {service.price.toLocaleString()} <span className="text-sm font-normal">ر.س</span>
                </div>
                <button 
                  onClick={() => setSelectedService(service)}
                  className="px-6 py-2.5 bg-brand-primary text-white rounded-xl text-sm font-bold hover:bg-brand-primary/90 transition-colors"
                >
                  طلب الخدمة
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedService && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6"
          >
            <div className="absolute inset-0 bg-brand-primary/40 backdrop-blur-sm" onClick={() => !isProcessing && setSelectedService(null)} />
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[3rem] p-10 max-w-md w-full relative z-10 shadow-2xl"
            >
              {!paymentSuccess ? (
                <>
                  <button 
                    onClick={() => setSelectedService(null)}
                    disabled={isProcessing}
                    className="absolute top-6 left-6 w-10 h-10 bg-neutral-50 rounded-full flex items-center justify-center text-neutral-500 hover:bg-neutral-100 transition-colors disabled:opacity-50"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  
                  <div className="text-center space-y-6">
                    <div className="w-20 h-20 bg-brand-primary/5 rounded-2xl flex items-center justify-center mx-auto">
                      <CreditCard className="w-10 h-10 text-brand-primary" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-serif font-bold text-brand-primary mb-2">تأكيد الدفع</h3>
                      <p className="text-neutral-500">أنت على وشك طلب <span className="font-bold text-brand-primary">{selectedService.title}</span></p>
                    </div>
                    
                    <div className="bg-neutral-50 p-6 rounded-2xl space-y-3 text-right">
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-500">مزود الخدمة</span>
                        <span className="font-bold text-brand-primary">{selectedService.provider}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-500">الإجمالي</span>
                        <span className="font-bold text-brand-primary text-lg">{selectedService.price.toLocaleString()} ر.س</span>
                      </div>
                    </div>

                    <button 
                      onClick={handlePayment}
                      disabled={isProcessing}
                      className="w-full py-4 bg-brand-primary text-white rounded-2xl font-bold text-lg hover:bg-brand-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isProcessing ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                      ) : (
                        <>
                          <CreditCard className="w-5 h-5" />
                          <span>دفع الآن</span>
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
                    <h3 className="text-2xl font-serif font-bold text-brand-primary mb-2">تم الدفع بنجاح!</h3>
                    <p className="text-neutral-500">تم تأكيد طلبك لخدمة {selectedService.title}. سيتواصل معك مزود الخدمة قريباً.</p>
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
