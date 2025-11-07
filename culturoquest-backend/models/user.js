const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  avatar: { type: String, default: 'default' },
  questPoints: { type: Number, default: 1000 },
  
  // --- MAKE SURE THESE TWO LINES ARE HERE ---
  ownedItems: { type: [String], default: [] },
  unlockedArchiveEntries: { type: [String], default: [] },
  // ------------------------------------------
  
  unlockedAchievements: { type: [String], default: ['quest_novice'] },
  correctlyAnsweredQIDs: { type: [String], default: [] },
  userProgress: {
    completedStages: { type: [String], default: [] },
    activeStages: { type: [String], default: ['history_1', 'culture_1'] },
  },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('user', UserSchema);