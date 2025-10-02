import React, { createContext, useState, useContext, useEffect } from 'react';
import stagesData from '../data/stagesData.json';
import mauryanSaga from '../data/mauryanEmpire.json';
import triviaSaga from '../data/culturalTrivia.json';
import achievementData from '../data/achievements.json';

const GameContext = createContext(null);
export const useGame = () => useContext(GameContext);

const allSagasData = {
  "ancient-india-bce": mauryanSaga,
  "indian-culture-101": triviaSaga
};

const getQuestionIdsForSaga = (sagaId) => {
    const saga = allSagasData[sagaId];
    if (!saga) return [];
    let ids = [];
    Object.values(saga.games).forEach(game => {
        if (game.questionBank) {
            game.questionBank.forEach(qSet => {
                if (qSet.events) ids.push(...qSet.events.map(e => e.id));
                if (qSet.rulers) ids.push(...qSet.rulers.map(r => r.id));
                if (qSet.statements) ids.push(qSet.id);
                if (qSet.item) ids.push(qSet.id);
                if (qSet.imageUrl) ids.push(qSet.id);
            });
        }
        if (game.riddles) ids.push(...game.riddles.map(r => r.id));
    });
    return [...new Set(ids)];
};

export const GameProvider = ({ children }) => {
  const [questPoints, setQuestPoints] = useState(1000);
  const [ownedItems, setOwnedItems] = useState([]);
  const [selectedAvatar, setSelectedAvatar] = useState(localStorage.getItem('userAvatar') || 'default');
  const [correctlyAnsweredQIDs, setCorrectlyAnsweredQIDs] = useState(new Set());
  
  const [userProgress, setUserProgress] = useState({
    completedStages: [],
    // --- FIX: Storing active stages as an Array instead of a Set ---
    activeStages: [
        stagesData.stages.find(s => s.id.startsWith('history_')).id,
        stagesData.stages.find(s => s.id.startsWith('culture_')).id
    ]
  });

  const [unlockedAchievements, setUnlockedAchievements] = useState(new Set());

  useEffect(() => {
    // --- FIX: Using Array methods for consistent logic ---
    const newCompletedStages = [...userProgress.completedStages];
    let nextActiveStages = [...userProgress.activeStages];
    let progressionChanged = false;

    userProgress.activeStages.forEach(activeStageId => {
        const stage = stagesData.stages.find(s => s.id === activeStageId);
        if (!stage || newCompletedStages.includes(activeStageId)) return;

        const relatedSagaId = stage.relatedSaga;
        const allQuestionIdsInSaga = getQuestionIdsForSaga(relatedSagaId);
        if (allQuestionIdsInSaga.length === 0) return;

        const correctlyAnsweredInSaga = allQuestionIdsInSaga.filter(id => correctlyAnsweredQIDs.has(id));
        const masteryPercentage = (correctlyAnsweredInSaga.length / allQuestionIdsInSaga.length) * 100;

        if (masteryPercentage >= 60) {
            newCompletedStages.push(activeStageId);
            
            const currentStageIndex = stagesData.stages.findIndex(s => s.id === activeStageId);
            const nextStage = stagesData.stages[currentStageIndex + 1];

            if (nextStage && nextStage.id.split('_')[0] === activeStageId.split('_')[0]) {
                nextActiveStages.push(nextStage.id);
            }
            progressionChanged = true;
        }
    });

    if (progressionChanged) {
        setUserProgress({
            completedStages: newCompletedStages,
            // Filter out completed stages from the new active list
            activeStages: nextActiveStages.filter(id => !newCompletedStages.includes(id))
        });
    }

  }, [correctlyAnsweredQIDs, userProgress.activeStages]);

  useEffect(() => {
    const historyStages = stagesData.stages.filter(s => s.relatedSaga === "ancient-india-bce").map(s => s.id);
    if (historyStages.every(id => userProgress.completedStages.includes(id))) {
      setUnlockedAchievements(prev => new Set(prev).add('mauryan_scholar'));
    }

    const cultureStages = stagesData.stages.filter(s => s.relatedSaga === "indian-culture-101").map(s => s.id);
    if (cultureStages.every(id => userProgress.completedStages.includes(id))) {
      setUnlockedAchievements(prev => new Set(prev).add('cultural_connoisseur'));
    }
  }, [userProgress.completedStages]);

  const addPoints = (amount) => {
    setQuestPoints(p => p + amount);
  };

  const spendPoints = (amount) => {
    if (questPoints >= amount) {
      setQuestPoints(prevPoints => prevPoints - amount);
      return true;
    }
    return false;
  };

  const markQuestionCorrect = (id) => {
    if (correctlyAnsweredQIDs.size === 0) {
        setUnlockedAchievements(prev => new Set(prev).add('quest_novice'));
    }
    setCorrectlyAnsweredQIDs(prev => new Set(prev).add(id));
  };

  const buyItem = (item) => {
    if (spendPoints(item.price)) {
      setOwnedItems(prevOwned => [...prevOwned, item.id]);
      return true;
    }
    return false;
  };
  
  const setAvatar = (id) => {
    localStorage.setItem('userAvatar', id);
    setSelectedAvatar(id);
  };

  const value = { 
    questPoints, addPoints, spendPoints, ownedItems, buyItem, 
    selectedAvatar, setAvatar, userProgress, correctlyAnsweredQIDs, 
    markQuestionCorrect, getQuestionIdsForSaga, unlockedAchievements
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

