import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import stagesData from '../data/stagesData.json';
import { useGame } from '../context/GameContext';

// --- Sub-Components ---

const CourseModal = ({ stage, onClose }) => (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 50 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full text-center p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="font-semibold text-orange-500">{stage.era}</p>
        <h2 className="text-3xl font-extrabold gradient-text mt-2">{stage.name}</h2>
        <p className="mt-4 text-slate-600">{stage.description}</p>
        <div className="mt-8">
            <Link to="/quests" className="px-8 py-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold hover:scale-105 transition-transform shadow-lg shadow-orange-500/20">
                Go to Quests
            </Link>
        </div>
        <button onClick={onClose} className="mt-4 text-sm text-slate-500 hover:underline">
          Close
        </button>
      </motion.div>
    </motion.div>
);

const CourseNode = ({ stage, isLocked, isCurrent, isCompleted, onSelect, masteryPercent }) => {
    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', delay: Math.random() * 0.4, stiffness: 300, damping: 20 }}
            whileHover={!isLocked ? { scale: 1.05, y: -5 } : {}}
            onClick={() => !isLocked && onSelect(stage)}
            className={`relative p-5 text-center rounded-2xl border-4 transition-all duration-300 w-48 h-48 flex flex-col justify-center
                ${isLocked ? 'bg-slate-200 border-slate-300 grayscale cursor-not-allowed' : 'bg-white border-teal-400 shadow-lg cursor-pointer'}
                ${isCurrent ? 'shadow-2xl shadow-yellow-400/50 border-yellow-400' : ''}
            `}
        >
            {isLocked && <div className="absolute top-3 right-3 text-2xl">🔒</div>}
            <h3 className={`font-extrabold text-lg leading-tight ${isLocked ? 'text-slate-500' : 'text-slate-800'}`}>{stage.name}</h3>
            <p className={`text-xs mt-2 ${isLocked ? 'text-slate-400' : 'text-slate-500'}`}>{stage.era}</p>
            {isCompleted && (
                 <div className="absolute -top-4 -right-4 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md border-4 border-white">✓</div>
            )}
            {isCurrent && (
                <div className="absolute -bottom-4 px-3 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full shadow-md">
                   {masteryPercent.toFixed(0)}% Complete
                </div>
            )}
        </motion.div>
    );
};

const PathSeries = ({ title, stages, onSelect }) => {
    // 1. GRAB EVERYTHING WE NEED FROM CONTEXT
    const { userProgress, getQuestionIdsForSaga, correctlyAnsweredQIDs } = useGame();

    // 2. SAFETY CHECK: If context isn't ready, don't render yet.
    if (!userProgress || !getQuestionIdsForSaga) {
        return <div className="p-8 text-center text-slate-500">Loading path...</div>;
    }

    return (
        <div className="mt-12">
            <h3 className="text-3xl font-extrabold text-slate-900 mb-6 pl-4 border-l-4 border-teal-500">{title}</h3>
            <div className="flex gap-12 overflow-x-auto pb-10 -mx-6 px-6">
                {stages.map((stage) => {
                    const isCompleted = userProgress.completedStages.includes(stage.id);
                    const isCurrent = userProgress.activeStages.includes(stage.id);
                    const isLocked = !isCompleted && !isCurrent;

                    const allQuestionIdsInSaga = getQuestionIdsForSaga(stage.relatedSaga);
                    // Use Sets for faster lookup if correctlyAnsweredQIDs is a Set
                    const correctlyAnsweredInSaga = allQuestionIdsInSaga.filter(id => correctlyAnsweredQIDs.has(id));
                    const masteryPercent = allQuestionIdsInSaga.length > 0 ? (correctlyAnsweredInSaga.length / allQuestionIdsInSaga.length) * 100 : 0;

                    return (
                        <div key={stage.id} className="flex-shrink-0">
                            <CourseNode 
                                stage={stage} 
                                isLocked={isLocked}
                                isCurrent={isCurrent}
                                isCompleted={isCompleted}
                                onSelect={onSelect}
                                masteryPercent={masteryPercent}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// --- Main Page Component ---
export default function Explore() {
    const [selectedStage, setSelectedStage] = useState(null);
    const { stages } = stagesData;
    
    const historyStages = stages.filter(s => s.id.startsWith('history'));
    const cultureStages = stages.filter(s => s.id.startsWith('culture'));

    return (
        <>
            <section>
                <div className="text-center">
                    <h2 className="text-4xl font-extrabold tracking-tight text-slate-900">Your Learning Path 🗺️</h2>
                    <p className="mt-2 text-lg text-slate-600">Master 60% of a saga's content to unlock the next stage!</p>
                </div>
                
                <PathSeries title="The History of India" stages={historyStages} onSelect={setSelectedStage} />
                <PathSeries title="The Culture of India" stages={cultureStages} onSelect={setSelectedStage} />
            </section>
            
            <AnimatePresence>
                {selectedStage && (
                    <CourseModal stage={selectedStage} onClose={() => setSelectedStage(null)} />
                )}
            </AnimatePresence>
        </>
    );
}