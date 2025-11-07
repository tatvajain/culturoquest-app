import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import storeData from '../data/storeItems.json';

// --- UPDATED LOGO COMPONENT FOR STUDENT THEME ---
const BrandLogo = ({ brand, placeholder }) => {
    // Default vibrant student-friendly style
    let bgColor = "bg-teal-500";
    let textColor = "text-white";

    switch (brand) {
        case 'Campus Cafe': bgColor = "bg-amber-600"; break;
        case 'Scholar\'s Stash': bgColor = "bg-blue-500"; break;
        case 'Udemy': bgColor = "bg-purple-600"; break;
        case 'Central Library': bgColor = "bg-emerald-700"; break;
        case 'TechZone': bgColor = "bg-slate-700"; break;
        case 'Xerox Point': bgColor = "bg-cyan-600"; break;
        case 'College Fest': bgColor = "bg-pink-600"; break;
        case 'Career Cell': bgColor = "bg-indigo-600"; break;
        default: bgColor = "bg-teal-500";
    }

    return (
        <div className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center ${textColor} text-2xl shadow-sm`}>
            {placeholder}
        </div>
    );
};

const CouponCard = ({ item, onRedeem, owned, canAfford }) => (
  <motion.div 
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -8, scale: 1.02 }}
    className={`bg-white rounded-3xl border-4 overflow-hidden flex flex-col transition-all shadow-lg ${owned ? 'border-green-200 opacity-90' : 'border-slate-100 hover:border-indigo-200 hover:shadow-2xl'}`}
  >
    <div className={`p-6 relative ${owned ? 'bg-green-50' : 'bg-gradient-to-br from-indigo-50 to-purple-50'}`}>
      <div className="flex justify-between items-start">
          <div>
             <p className="font-bold text-slate-500 uppercase tracking-wider text-xs">{item.brandName}</p>
             <h3 className="text-2xl font-black text-slate-900 leading-tight mt-1">{item.offer}</h3>
          </div>
          <BrandLogo brand={item.brandName} placeholder={item.logo_placeholder} />
      </div>
    </div>

    <div className="p-6 flex flex-col flex-grow bg-white">
      <p className="text-slate-600 font-medium flex-grow">{item.description}</p>
      
      <div className="mt-6 pt-6 border-t-2 border-slate-100">
        {owned ? (
          <div className="w-full py-3 rounded-xl bg-green-100 text-green-700 font-black text-center flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            IN BACKPACK
          </div>
        ) : (
          <button 
            onClick={() => onRedeem(item)}
            disabled={!canAfford}
            className={`w-full py-3 rounded-xl font-black text-lg transition-all flex items-center justify-center
              ${canAfford 
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105 active:scale-95 shadow-md hover:shadow-indigo-500/30' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
          >
            {canAfford ? `UNLOCK (${item.price} QP)` : `NEED ${item.price} QP`}
          </button>
        )}
      </div>
    </div>
  </motion.div>
);

const RedeemModal = ({ item, onClose }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, opacity: 0 }} className="bg-white rounded-[2.5rem] p-8 max-w-md w-full text-center relative overflow-hidden" onClick={e => e.stopPropagation()}>
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-green-100 to-white -z-10" />
          <div className="text-6xl mb-4">🎒</div>
          <h2 className="text-4xl font-black text-green-600 mb-2">ADDED TO STASH!</h2>
          <p className="text-slate-600 font-medium text-lg">Ready to use at {item.brandName}</p>
          
          <div className="my-8 p-6 bg-slate-800 rounded-2xl relative group cursor-pointer" onClick={() => navigator.clipboard.writeText(item.couponCode)}>
              <p className="text-slate-400 text-sm font-bold mb-2 uppercase tracking-widest">Secret Code</p>
              <p className="text-3xl font-mono font-black text-yellow-400 tracking-wider">{item.couponCode}</p>
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                  <p className="text-white font-bold">CLICK TO COPY</p>
              </div>
          </div>
          
          <button onClick={onClose} className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black rounded-2xl transition-colors text-xl">
            AWESOME, THANKS!
          </button>
      </motion.div>
  </motion.div>
);

export default function Store() {
  const { questPoints, ownedItems, buyItem } = useGame();
  const [selectedCoupon, setSelectedCoupon] = useState(null);

  const handleRedeem = (item) => {
    if (buyItem(item)) {
      setSelectedCoupon(item);
    }
  };

  return (
    <section className="max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-5xl font-black text-indigo-900 tracking-tight">Student Stash 🎒</h2>
        <p className="mt-3 text-xl text-slate-600 font-medium">Turn your knowledge into campus perks!</p>
      </div>
      
      {/* Sticky Balance Bar */}
      <div className="sticky top-20 z-40 flex justify-center mb-10">
        <motion.div 
            initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="px-8 py-4 bg-slate-900 rounded-full shadow-2xl border-4 border-indigo-500 flex items-center gap-4"
        >
            <span className="text-3xl">💎</span>
            <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Current Balance</p>
                <p className="text-3xl font-black text-white leading-none">{questPoints.toLocaleString()} QP</p>
            </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
        <AnimatePresence>
            {storeData.items.map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <CouponCard 
                    item={item} 
                    onRedeem={handleRedeem} 
                    owned={ownedItems.has(item.id)} 
                    canAfford={questPoints >= item.price} 
                />
            </motion.div>
            ))}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {selectedCoupon && <RedeemModal item={selectedCoupon} onClose={() => setSelectedCoupon(null)} />}
      </AnimatePresence>
    </section>
  );
}