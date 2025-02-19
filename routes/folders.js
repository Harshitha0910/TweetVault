const express = require('express');
const router = express.Router();
const Folder = require('../models/folders.js');
const Tweet = require('../models/tweets.js');
const { verifyToken } = require('../middleware/auth'); // Import the middleware

// GET route to render the folders page
router.get('/', verifyToken, async (req, res) => {
    const folders = await Folder.find({ userId: req.user.id });
    res.render('folders', { folders });
});

router.post('/create', verifyToken, async (req, res) => {
    const { name } = req.body;
    const userId = req.user.id; 
  
    if (!userId) {
      return res.status(400).send('User ID not found');
    }
  
    const folder = new Folder({ name, userId });
    try {
      await folder.save();
      res.redirect('/folders');
    } catch (error) {
      console.error('Error creating folder:', error);
      res.status(500).send('Error creating folder: ' + error.message);
    }
  });
  

// POST route to save a tweet to a folder
router.post('/save-to-folder', verifyToken, async (req, res) => {
    const { tweetId, folderId } = req.body;

    try {
        console.log('tweetId:', tweetId);
        console.log('folderId:', folderId);

        const folder = await Folder.findById(folderId);
        const tweet = await Tweet.findById(tweetId);

        if (!folder) {
            console.error('Folder not found');
            return res.status(404).send('Folder not found');
        }

        if (!tweet) {
            console.error('Tweet not found');
            return res.status(404).send('Tweet not found');
        }

        // Check if the tweet is already in the folder
        if (!folder.tweets.includes(tweetId)) {
            folder.tweets.push(tweetId);
            await folder.save();
        }

        res.redirect(`/folders/${folderId}`);
    } catch (error) {
        console.error('Error saving tweet to folder:', error);
        res.status(500).send('Error saving tweet to folder');
    }
});


// GET route to view tweets in a specific folder
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const folder = await Folder.findById(req.params.id).populate('tweets');
        if (!folder) {
            return res.status(404).send('Folder not found');
        }
        res.render('folderTweets', { folder });
    } catch (error) {
        console.error('Error fetching folder:', error);
        res.status(500).send('Error fetching folder');
    }
});

// POST route to delete a folder
router.post('/delete/:id', verifyToken, async (req, res) => {
    try {
        await Folder.findByIdAndDelete(req.params.id);
        res.redirect('/folders');
    } catch (error) {
        console.error('Error deleting folder:', error);
        res.status(500).send('Error deleting folder');
    }
});

// POST route to rename a folder
router.post('/rename/:id', verifyToken, async (req, res) => {
    try {
        const { name } = req.body;
        await Folder.findByIdAndUpdate(req.params.id, { name: name });
        res.redirect('/folders');
    } catch (error) {
        console.error('Error renaming folder:', error);
        res.status(500).send('Error renaming folder');
    }
});

router.post('/remove-tweet/:folderId', verifyToken, async (req, res) => {
    const { tweetId } = req.body;
    const { folderId } = req.params;

    try {
        const folder = await Folder.findById(folderId);

        if (!folder) {
            return res.status(404).send('Folder not found');
        }

        // Remove the tweet from the folder's tweets array
        folder.tweets = folder.tweets.filter(tweet => tweet.toString() !== tweetId); 

        await folder.save();

        res.redirect(`/folders/${folderId}`);
    } catch (error) {
        console.error('Error removing tweet from folder:', error);
        res.status(500).send('Error removing tweet from folder');
    }
});


module.exports = router;
