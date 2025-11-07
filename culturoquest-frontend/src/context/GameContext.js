import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import stagesData from '../data/stagesData.json';
import mauryanSaga from '../data/mauryanEmpire.json';
import triviaSaga from '../data/culturalTrivia.json';
import { useAuth } from './AuthContext';

const GameContext = createContext(null);
export const useGame = () => useContext(GameContext);

const API_URL = 'https://culturoquest-app-1.onrender.com/api/users/login';

const allSagasData = {
  "ancient-india-bce": mauryanSaga,
  "indian-culture-101": triviaSaga
};

// Helper to get all Question IDs for a specific saga
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
  const [questPoints, setQuestPoints] = useState(0);
  const [ownedItems, setOwnedItems] = useState(new Set());
  const [selectedAvatar, setSelectedAvatar] = useState('default');
  const [correctlyAnsweredQIDs, setCorrectlyAnsweredQIDs] = useState(new Set());
  const [unlockedAchievements, setUnlockedAchievements] = useState(new Set(['quest_novice']));
  const [unlockedArchiveEntries, setUnlockedArchiveEntries] = useState(new Set());
  const [userProgress, setUserProgress] = useState({
    completedStages: [],
    activeStages: ['history_1', 'culture_1']
  });

  const { token } = useAuth();

  // --- BACKEND SYNC ---
  const syncToBackend = useCallback(async (updates) => {
    if (!token) return;
    try {
       await fetch(`${API_URL}/update-progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify(updates)
      });
    } catch (error) {
      console.error("Sync error:", error);
    }
  }, [token]);

  // --- INITIAL LOAD ---
  useEffect(() => {
    if (token) {
        fetch(`${API_URL}/me`, { headers: { 'x-auth-token': token } })
            .then(res => res.json())
            .then(data => {
                if (data._id) {
                    setQuestPoints(data.questPoints);
                    setSelectedAvatar(data.avatar);
                    setOwnedItems(new Set(data.ownedItems));
                    setCorrectlyAnsweredQIDs(new Set(data.correctlyAnsweredQIDs));
                    setUnlockedAchievements(new Set(data.unlockedAchievements));
                    setUnlockedArchiveEntries(new Set(data.unlockedArchiveEntries));
                    setUserProgress({
                        completedStages: data.userProgress.completedStages || [],
                        activeStages: data.userProgress.activeStages?.length ? data.userProgress.activeStages : ['history_1_mauryan', 'culture_1_basics']
                    });
                }
            })
            .catch(err => console.error("Failed to load profile:", err));
    }
  }, [token]);

  // --- ACTIONS ---
  const addPoints = (amount) => {
    setQuestPoints(prev => { const n = prev + amount; syncToBackend({ questPoints: n }); return n; });
  };

  const spendPoints = (amount) => {
    if (questPoints >= amount) {
      setQuestPoints(prev => { const n = prev - amount; syncToBackend({ questPoints: n }); return n; });
      return true;
    }
    return false;
  };

  const markQuestionCorrect = (ids) => {
    const idsToMark = Array.isArray(ids) ? ids : [ids];
    setCorrectlyAnsweredQIDs(prev => {
        const newSet = new Set(prev);
        let hasNew = false;
        idsToMark.forEach(id => { if (!newSet.has(id)) { newSet.add(id); hasNew = true; } });
        if (hasNew) syncToBackend({ correctlyAnsweredQIDs: Array.from(newSet) });
        return newSet;
    });
  };

  const unlockAchievement = (id) => {
    setUnlockedAchievements(prev => {
        if (!prev.has(id)) { syncToBackend({ unlockedAchievements: [id] }); return new Set(prev).add(id); }
        return prev;
    });
  };

  const unlockArchiveEntry = (id) => {
      setUnlockedArchiveEntries(prev => {
          if (!prev.has(id)) { syncToBackend({ unlockedArchiveEntries: [id] }); return new Set(prev).add(id); }
          return prev;
      });
  };

  const setAvatar = (id) => { setSelectedAvatar(id); syncToBackend({ avatar: id }); };

  const buyItem = (item) => {
      if (!ownedItems.has(item.id) && spendPoints(item.price)) {
          setOwnedItems(prev => {
              const newSet = new Set(prev).add(item.id);
              syncToBackend({ ownedItems: Array.from(newSet) });
              return newSet;
          });
          return true;
      }
      return false;
  };

  // --- PROGRESSION LOGIC ---
  useEffect(() => {
    const newCompleted = [...userProgress.completedStages];
    let newActive = [...userProgress.activeStages];
    let changed = false;

    userProgress.activeStages.forEach(activeStageId => {
        if (newCompleted.includes(activeStageId)) return;
        const stage = stagesData.stages.find(s => s.id === activeStageId);
        if (!stage) return;
        const totalQs = getQuestionIdsForSaga(stage.relatedSaga);
        if (totalQs.length === 0) return;
        const answeredInSaga = totalQs.filter(id => correctlyAnsweredQIDs.has(id)).length;
        
        if ((answeredInSaga / totalQs.length) >= 0.6) {
             newCompleted.push(activeStageId);
             changed = true;
             const currentIndex = stagesData.stages.findIndex(s => s.id === activeStageId);
             const nextStage = stagesData.stages[currentIndex + 1];
             if (nextStage && nextStage.id.split('_')[0] === activeStageId.split('_')[0]) {
                 newActive.push(nextStage.id);
             }
        }
    });

    if (changed) {
        const newActiveFiltered = newActive.filter(id => !newCompleted.includes(id));
        setUserProgress({ completedStages: newCompleted, activeStages: newActiveFiltered });
        syncToBackend({ userProgress: { completedStages: newCompleted, activeStages: newActiveFiltered }});
    }
  }, [correctlyAnsweredQIDs, userProgress, syncToBackend]);

  const value = { 
    questPoints, addPoints, spendPoints, ownedItems, buyItem, 
    selectedAvatar, setAvatar, userProgress, correctlyAnsweredQIDs, 
    markQuestionCorrect, unlockedAchievements, unlockAchievement,
    unlockedArchiveEntries, unlockArchiveEntry,
    getQuestionIdsForSaga // <--- ADDED BACK!
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};