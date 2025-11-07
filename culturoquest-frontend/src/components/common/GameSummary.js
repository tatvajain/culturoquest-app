import React from 'react';
import { motion } from 'framer-motion';

export default function GameSummary({ stats, onComplete }) {
  const { score, correct, total, perfectionBonus } = stats;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }} 
      animate={{ opacity: 1, scale: 1 }} 
      className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 text-center p-8"
    >
      <motion.h2 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-3xl font-extrabold gradient-text"
      >
        Round Complete!
      </motion.h2>
      
      <motion.p 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-lg mt-4 text-slate-600"
      >
        You answered <span className="font-bold">{correct}</span> out of <span className="font-bold">{total}</span> correctly.
      </motion.p>
      
      {perfectionBonus > 0 && (
        <motion.p 
          initial={{ scale: 0 }} 
          animate={{ scale: 1 }} 
          transition={{ delay: 0.8, type: 'spring' }} 
          className="text-xl font-bold text-green-500 mt-2"
        >
          PERFECTION! +{perfectionBonus} Bonus QP!
        </motion.p>
      )}

      <motion.div 
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.2, type: 'spring', stiffness: 150 }}
      >
        <p className="text-5xl font-bold text-slate-800 mt-6">{score + perfectionBonus}</p>
        <p className="text-slate-500">Total QP Earned This Round</p>
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        onClick={onComplete}
        className="mt-8 px-8 py-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold hover:scale-105 transition-transform shadow-lg shadow-orange-500/20"
      >
        Continue
      </motion.button>
    </motion.div>
  );
}
