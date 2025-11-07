const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const User = require('../models/user');

// @route   POST api/users/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    user = new User({ username, email, password });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const payload = { user: { id: user.id } };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 360000 },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/users/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const payload = { user: { id: user.id } };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 360000 },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/users/me
// @desc    Get current user's profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/users/update-progress
// @desc    Update user's game progress
// @access  Private
router.put('/update-progress', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const { questPoints, avatar, unlockedAchievements, correctlyAnsweredQIDs, userProgress, ownedItems, unlockedArchiveEntries } = req.body;

    if (questPoints !== undefined) user.questPoints = questPoints;
    if (avatar !== undefined) user.avatar = avatar;

    const addUnique = (targetArray, newItems) => {
        if (newItems && Array.isArray(newItems)) {
            newItems.forEach(item => {
                if (!targetArray.includes(item)) targetArray.push(item);
            });
        }
    };

    addUnique(user.unlockedAchievements, unlockedAchievements);
    addUnique(user.correctlyAnsweredQIDs, correctlyAnsweredQIDs);
    addUnique(user.ownedItems, ownedItems);
    addUnique(user.unlockedArchiveEntries, unlockedArchiveEntries);

    if (userProgress) {
        if (userProgress.completedStages) {
             addUnique(user.userProgress.completedStages, userProgress.completedStages);
        }
        if (userProgress.activeStages) {
            user.userProgress.activeStages = userProgress.activeStages;
        }
    }

    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/users/leaderboard
// @desc    Get top 5 users by Quest Points
// @access  Public
router.get('/leaderboard', async (req, res) => {
  try {
    const topUsers = await User.find()
      .sort({ questPoints: -1 })
      .limit(5)
      .select('username questPoints avatar');
      
    res.json(topUsers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;