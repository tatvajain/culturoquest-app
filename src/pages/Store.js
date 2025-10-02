import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import storeData from '../data/storeItems.json';

// --- Sub-Components (Redesigned with new SVG Logos) ---

const BrandLogo = ({ brand, placeholder }) => {
    const logoStyles = {
        width: "40px",
        height: "40px",
        fontFamily: "Poppins, sans-serif",
        fontWeight: "bold",
        fontSize: "20px",
        color: "white"
    };

    switch (brand) {
        case 'Amazon.in':
            return <svg style={logoStyles} viewBox="0 0 40 40"><rect width="40" height="40" rx="8" fill="#232F3E"/><path d="M12 25 C 18 32, 22 32, 28 25" stroke="#FF9900" strokeWidth="2.5" fill="none" strokeLinecap="round"/><text x="10" y="22" fill="#fff" fontSize="18">a</text></svg>;
        case 'Swiggy':
            return <svg style={logoStyles} viewBox="0 0 40 40"><rect width="40" height="40" rx="8" fill="#FC8019"/><path d="M20 10 C 15 10, 10 15, 10 20 C 10 28, 20 35, 20 35 S 30 28, 30 20 C 30 15, 25 10, 20 10 Z" fill="white"/></svg>;
        case 'Zepto':
             return <svg style={logoStyles} viewBox="0 0 40 40"><rect width="40" height="40" rx="8" fill="#3D0079"/><text x="50%" y="50%" dy=".3em" textAnchor="middle">{placeholder}</text></svg>;
        case 'BookMyShow':
             return <svg style={logoStyles} viewBox="0 0 40 40"><rect width="40" height="40" rx="8" fill="#EC1E43"/><path d="M10 5 L 30 5 L 30 35 L 10 35 Q 15 20, 10 5 Z" fill="#fff"/><text x="18" y="23" fill="#EC1E43" fontSize="16">b</text></svg>;
        default:
            return (
                <svg style={logoStyles} viewBox="0 0 40 40">
                    <defs>
                        <linearGradient id="defaultLogoBg" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#2dd4bf"/>
                            <stop offset="100%" stopColor="#0d9488"/>
                        </linearGradient>
                    </defs>
                    <rect width="40" height="40" rx="8" fill="url(#defaultLogoBg)"/>
                    <text x="50%" y="50%" dy=".3em" textAnchor="middle">{placeholder}</text>
                </svg>
            );
    }
};


const CouponCard = ({ item, onRedeem, owned, canAfford }) => (
  <motion.div 
    layout
    whileHover={{ scale: 1.03, y: -5 }}
    className="bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200 shadow-lg overflow-hidden flex flex-col transition-shadow hover:shadow-2xl"
  >
    <div className="p-6 bg-gradient-to-br from-teal-50 to-orange-50 relative">
      <div className="absolute top-4 right-4 bg-white p-1 rounded-lg shadow-md">
        <BrandLogo brand={item.brandName} placeholder={item.logo_placeholder} />
      </div>
      <p className="font-semibold text-slate-600">{item.brandName}</p>
      <h3 className="text-4xl font-extrabold text-slate-800 mt-1">{item.offer}</h3>
    </div>

    <div className="p-6 flex flex-col flex-grow">
      <p className="text-sm text-slate-600 flex-grow">{item.description}</p>
      <div className="mt-auto pt-6">
        {owned ? (
          <button disabled className="w-full px-6 py-3 rounded-full bg-green-500 text-white font-bold">
            Redeemed
          </button>
        ) : (
          <button 
            onClick={() => onRedeem(item)}
            disabled={!canAfford}
            className={`w-full px-6 py-3 rounded-full font-bold transition-all ${
              canAfford 
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg hover:scale-105' 
                : 'bg-slate-200 text-slate-500 cursor-not-allowed'
            }`}
          >
            Redeem for {item.price} QP
          </button>
        )}
      </div>
    </div>
  </motion.div>
);

const RedeemModal = ({ item, onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(item.couponCode);
    } else {
        const textArea = document.createElement("textarea");
        textArea.value = item.couponCode;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.7, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full text-center p-8 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <svg width="100%" height="100%"><defs><pattern id="p" width="50" height="50" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="2" fill="%23f97316"/></pattern></defs><rect width="100%" height="100%" fill="url(#p)"/></svg>
        </div>
        <div className="relative">
            <p className="font-semibold text-slate-500">Congratulations!</p>
            <h2 className="text-4xl font-extrabold gradient-text mt-2">Coupon Redeemed!</h2>
            <p className="mt-4 text-slate-600">Use the code below to claim your <span className="font-bold">{item.offer}</span> from <span className="font-bold">{item.brandName}</span>.</p>
            
            <div className="my-6 p-4 bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg">
              <p className="text-3xl font-bold tracking-widest text-slate-800">{item.couponCode}</p>
            </div>

            <button 
              onClick={handleCopy}
              className="w-full px-6 py-3 rounded-full bg-teal-500 text-white font-bold transition-colors hover:bg-teal-600"
            >
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
            <button onClick={onClose} className="mt-4 text-sm text-slate-500 hover:underline">
              Close
            </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// --- Main Page Component ---

export default function Store() {
  const { questPoints, ownedItems, buyItem } = useGame();
  const [selectedCoupon, setSelectedCoupon] = useState(null);

  const handleRedeem = (item) => {
    if (buyItem(item)) {
      setSelectedCoupon(item);
    }
  };

  return (
    <section>
      <div className="text-center">
        <h2 className="text-4xl font-extrabold tracking-tight text-slate-900">Rewards Store 🎟️</h2>
        <p className="mt-2 text-lg text-slate-600">Redeem your Quest Points for real-world discounts and offers!</p>
      </div>
      
      <div className="flex justify-center my-8">
        <div className="p-4 bg-white/50 backdrop-blur-sm rounded-full inline-block shadow-md border border-slate-200">
            <p className="font-bold text-lg text-slate-700">Your Balance: <span className="gradient-text">{questPoints} QP</span></p>
        </div>
      </div>
      

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {storeData.items.map(item => (
          <CouponCard 
            key={item.id}
            item={item}
            onRedeem={handleRedeem}
            owned={ownedItems.includes(item.id)}
            canAfford={questPoints >= item.price}
          />
        ))}
      </div>
      
      <AnimatePresence>
        {selectedCoupon && (
          <RedeemModal item={selectedCoupon} onClose={() => setSelectedCoupon(null)} />
        )}
      </AnimatePresence>
    </section>
  );
}

