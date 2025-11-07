import React, { useState, useEffect, useMemo } from 'react';
import sagaData from '../../data/mauryanEmpire.json';
import { useGame } from '../../context/GameContext';
import { Reorder } from 'framer-motion';
import GameSummary from '../common/GameSummary';
import FeedbackModal from '../common/FeedbackModal';

// --- ROBUST AUDIO ---
let lastSoundTime = 0;
const safePlaySound = (url) => {
    const now = Date.now();
    if (now - lastSoundTime < 250) return;
    lastSoundTime = now;
    try { new Audio(url).play().catch(() => {}); } catch (e) {}
};
const playCorrect = () => safePlaySound('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3');
const playWrong = () => safePlaySound('https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3');

const getSmartRandomSet = (questionBank, answeredQIDs) => {
    const unanswered = questionBank.filter(set => !set.events.every(e => answeredQIDs.has(e.id)));
    return unanswered.length > 0 ? unanswered[Math.floor(Math.random() * unanswered.length)] : questionBank[Math.floor(Math.random() * questionBank.length)];
};

export default function TimelineJigsaw({ onGameComplete }) {
  const { addPoints, correctlyAnsweredQIDs, markQuestionCorrect, unlockAchievement } = useGame();
  const gameData = sagaData.games.timelineJigsaw;
  const [questionSet, setQuestionSet] = useState(null);
  const [items, setItems] = useState([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [roundScore, setRoundScore] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalIsCorrect, setModalIsCorrect] = useState(false);

  useEffect(() => {
    const set = getSmartRandomSet(gameData.questionBank, correctlyAnsweredQIDs);
    setQuestionSet(set);
    setItems([...set.events].sort(() => 0.5 - Math.random()));
  }, []);

  const correctOrder = useMemo(() => questionSet ? [...questionSet.events].sort((a, b) => a.year - b.year) : [], [questionSet]);

  const handleCheck = () => {
    if (!questionSet) return;
    const correct = items.every((item, index) => item.id === correctOrder[index].id);
    setModalIsCorrect(correct);
    if (correct) {
      playCorrect();
      questionSet.events.forEach(e => markQuestionCorrect(e.id));
      unlockAchievement('timeline_titan');
      const points = 30 * questionSet.events.length;
      addPoints(points);
      setRoundScore(points);
    } else {
      playWrong();
    }
    setModalOpen(true);
  };

  const handleModalClose = () => {
      setModalOpen(false);
      if (modalIsCorrect) {
          setIsGameOver(true);
      }
  };

  if (isGameOver) {
      const stats = { score: roundScore, correct: questionSet.events.length, total: questionSet.events.length, perfectionBonus: 0 };
      return <GameSummary stats={stats} onComplete={onGameComplete} />;
  }

  if (!questionSet) return <div className="p-8 text-center">Loading timeline...</div>;

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-3xl shadow-2xl border-4 border-amber-100 p-6">
      <h2 className="text-3xl font-black text-amber-800 text-center mb-4">{gameData.title}</h2>
      <p className="text-center text-amber-600 mb-6 font-medium">{gameData.instruction}</p>
      
      <Reorder.Group axis="y" values={items} onReorder={setItems} className="space-y-3">
        {items.map((item, i) => (
          <Reorder.Item key={item.id} value={item} className="flex items-center p-4 bg-amber-50 rounded-xl border-2 border-amber-200 cursor-grab active:cursor-grabbing shadow-sm">
            <span className="text-2xl font-bold text-amber-400 mr-4">{i + 1}.</span>
            <span className="text-amber-900 font-semibold text-lg">{item.event}</span>
          </Reorder.Item>
        ))}
      </Reorder.Group>

      <button onClick={handleCheck} className="w-full mt-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xl font-black rounded-2xl shadow-lg hover:scale-105 transition-transform">
        CHECK TIMELINE
      </button>

      <FeedbackModal 
        isOpen={modalOpen}
        isCorrect={modalIsCorrect}
        onClose={handleModalClose}
        educationalLink={questionSet.educationalLink}
        correctMessage="History Restored! 📜"
        wrongMessage="Time Paradox Detected! ⏳"
      />
    </div>
  );
}