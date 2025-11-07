import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FeedbackModal({ isOpen, isCorrect, onClose, educationalLink, correctMessage = "Awesome!", wrongMessage = "Oops! Not quite." }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
          <motion.div
            initial={{ scale: 0.5, opacity: 0, rotate: isCorrect ? -10 : 10 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", bounciness: 15 }}
            className={`relative w-full max-w-md p-8 text-center bg-white rounded-3xl shadow-2xl border-8 ${isCorrect ? 'border-green-400' : 'border-orange-400'}`}
            onClick={e => e.stopPropagation()}
          >
            <div className="text-8xl mb-4">
              {isCorrect ? '🎉' : '🤔'}
            </div>
            <h2 className={`text-4xl font-black ${isCorrect ? 'text-green-600' : 'text-orange-600'}`}>
              {isCorrect ? correctMessage : wrongMessage}
            </h2>
            
            {/* Only show the learning link if they got it WRONG and a link EXISTS */}
            {!isCorrect && educationalLink && (
              <div className="mt-6 p-4 bg-indigo-50 rounded-2xl border-4 border-indigo-200">
                <p className="text-indigo-900 font-bold mb-3 text-lg">Curious? Learn more here! 👇</p>
                <a 
                  href={educationalLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block w-full py-3 bg-red-600 text-white font-extrabold rounded-xl hover:scale-105 transition-transform flex items-center justify-center shadow-md"
                >
                  <svg className="w-8 h-8 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                  WATCH VIDEO
                </a>
              </div>
            )}

            <button 
              onClick={onClose}
              className={`mt-8 w-full py-4 text-white font-black rounded-2xl text-2xl shadow-lg transition-all hover:scale-105 ${isCorrect ? 'bg-green-500' : 'bg-orange-500'}`}
            >
              {isCorrect ? 'NEXT QUESTION ➜' : 'GOT IT! 👍'}
            </button>
          </motion.div>
        </div>
    </AnimatePresence>
  );
}