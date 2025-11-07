import React, { useState, useEffect } from 'react';
import sagaData from '../../data/mauryanEmpire.json';
import { useGame } from '../../context/GameContext';
import { motion, AnimatePresence } from 'framer-motion';
import GameSummary from '../common/GameSummary';

// --- Smart Question Selector ---
const getSmartQuestions = (questionBank, answeredQIDs, num) => {
  const unanswered = questionBank.filter(q => !answeredQIDs.has(q.id));
  const shuffledUnanswered = [...unanswered].sort(() => 0.5 - Math.random());
  let selected = shuffledUnanswered.slice(0, num);
  if (selected.length < num) {
    const answered = questionBank.filter(q => answeredQIDs.has(q.id));
    const shuffledAnswered = [...answered].sort(() => 0.5 - Math.random());
    selected.push(...shuffledAnswered.slice(0, num - selected.length));
  }
  return selected;
};

// --- Flexible Answer Checker ---
const checkAnswer = (guess, answer) => {
    const cleanGuess = guess.trim().toLowerCase();
    const cleanAnswer = answer.toLowerCase();
    if (!cleanGuess) return false;
    // Checks if the user's guess is a key part of the answer
    return cleanAnswer.includes(cleanGuess);
};

const correctSound = new window.Tone.Synth().toDestination();
const wrongSound = new window.Tone.Synth({ oscillator: { type: 'square' } }).toDestination();

export default function RiddleOfTheSages({ onGameComplete }) {
  const { addPoints, correctlyAnsweredQIDs, markQuestionCorrect } = useGame();
  const gameData = sagaData.games.riddleOfTheSages;

  const [gameQuestions, setGameQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [roundScore, setRoundScore] = useState(0);

  const [clueIndex, setClueIndex] = useState(0);
  const [guess, setGuess] = useState('');
  const [isAnswered, setIsAnswered] = useState(false); // Used to lock the input after final answer
  const [isGameOver, setIsGameOver] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  
  useEffect(() => {
    setGameQuestions(getSmartQuestions(gameData.riddles, correctlyAnsweredQIDs, 5));
  }, []);
  
  const currentRiddle = gameQuestions[currentQuestionIndex];

  const handleNextQuestion = () => {
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < gameQuestions.length) {
      setCurrentQuestionIndex(nextIndex);
      setClueIndex(0);
      setGuess('');
      setIsAnswered(false);
      setFeedback({ type: '', message: '' });
    } else {
      setIsGameOver(true);
      if (correctAnswers === 5) {
        addPoints(50); // Add perfection bonus
      }
    }
  };

  const handleGuess = (e) => {
    e.preventDefault();
    if (isAnswered || !currentRiddle) return;

    if (checkAnswer(guess, currentRiddle.answer)) {
      // CORRECT ANSWER LOGIC
      correctSound.triggerAttackRelease("C4", "8n");
      markQuestionCorrect(currentRiddle.id);
      setCorrectAnswers(prev => prev + 1);
      const pointsWon = Math.max(10, 30 - (clueIndex * 10));
      addPoints(pointsWon);
      setRoundScore(prev => prev + pointsWon);
      setFeedback({ type: 'correct', message: 'Correct!' });
      setIsAnswered(true); // Lock input
      setTimeout(handleNextQuestion, 2000);
    } else {
      // WRONG ANSWER LOGIC
      wrongSound.triggerAttackRelease("C2", "8n");
      if (clueIndex < currentRiddle.clues.length - 1) {
        // Reveal next clue
        setClueIndex(prev => prev + 1);
        setGuess(''); // Clear input for next try
        setFeedback({ type: 'incorrect_retry', message: 'Not quite. Here is another clue.' });
      } else {
        // Final wrong answer
        setFeedback({ type: 'incorrect_final', message: `Incorrect. The answer was: ${currentRiddle.answer}` });
        setIsAnswered(true); // Lock input
        setTimeout(handleNextQuestion, 3000); // Longer delay to read the answer
      }
    }
  };

  if (isGameOver) {
    const stats = {
      score: roundScore,
      correct: correctAnswers,
      total: 5,
      perfectionBonus: correctAnswers === 5 ? 50 : 0
    };
    return <GameSummary stats={stats} onComplete={onGameComplete} />;
  }

  if (!currentRiddle) return <div className="text-center p-8">Loading riddle...</div>;

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200">
      <div className="p-6 text-center border-b-2 border-slate-200">
        <h2 className="text-3xl font-extrabold gradient-text">{gameData.title}</h2>
        <p className="mt-2 text-slate-600">Question {currentQuestionIndex + 1} of 5</p>
      </div>
      <div className="p-6 md:p-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-slate-800">Clues Revealed:</h3>
          <p className="font-bold text-teal-600">Potential Points: {Math.max(10, 30 - (clueIndex * 10))}</p>
        </div>
        
        {/* Display all revealed clues */}
        <div className="space-y-2">
            {currentRiddle.clues.slice(0, clueIndex + 1).map((clue, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-slate-100 rounded-lg text-lg text-center italic text-slate-700 flex items-center justify-center"
                >
                    <span className="font-bold mr-3 text-slate-400">{index + 1}.</span>
                    <span>"{clue}"</span>
                </motion.div>
            ))}
        </div>
      </div>

      <form onSubmit={handleGuess} className="p-6 bg-slate-50 rounded-b-2xl">
        <div className="flex gap-4">
          <input
            type="text"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            disabled={isAnswered}
            placeholder="Enter your guess..."
            className="flex-grow p-3 rounded-lg border-2 border-slate-300 focus:border-orange-500 focus:ring-0 transition disabled:opacity-70"
          />
          <button
            type="submit"
            disabled={isAnswered}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold transition-transform hover:scale-105 disabled:opacity-70 disabled:scale-100"
          >
            Submit
          </button>
        </div>
        {feedback.message && (
          <p className={`p-3 mt-4 rounded-lg text-center font-semibold ${
            feedback.type === 'correct' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {feedback.message}
          </p>
        )}
      </form>
    </div>
  );
}

