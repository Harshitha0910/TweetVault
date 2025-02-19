require('dotenv').config();
const axios = require("axios");
const express = require('express');
const Tweet = require('../models/tweets.js');
const Folder = require('../models/folders.js');
const { verifyToken } = require('../middleware/auth');
const router = express.Router();


const BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;

// Function to extract Tweet ID from URL
const extractTweetId = (url) => {
    const match = url.match(/status\/(\d+)/);
    return match ? match[1] : null;
};

router.get("/", verifyToken, async (req, res) => {
  const tweets = await Tweet.find({ userId: req.user.id });
  const folders = await Folder.find({ userId: req.user.id });
  res.render("tweets", { tweets, folders });
});

router.post("/save", verifyToken, async (req, res) => {
  const tweetUrl = req.body.url;
  const tweetId = extractTweetId(tweetUrl);

  if (!tweetId) return res.status(400).send("Invalid Tweet URL");

  try {
    // Fetch Tweet Data from Twitter API
    const response = await axios.get(`https://api.twitter.com/2/tweets/${tweetId}?expansions=author_id,attachments.media_keys&tweet.fields=text&user.fields=username,profile_image_url&media.fields=url`, {
      headers: { Authorization: `Bearer ${BEARER_TOKEN}` },
    });

    const tweetData = response.data;

    console.log('API Response:', response.data);

    // Extract tweet information
    const tweet = new Tweet({
      tweet_id: tweetId,
      username: tweetData.includes.users[0].name,
      user_handle: "@" + tweetData.includes.users[0].username,
      profile_image: tweetData.includes.users[0].profile_image_url,
      text: tweetData.data.text,
      media: tweetData.includes.media ? tweetData.includes.media.map(m => m.url) : [],
      external_links: tweetData.data.text.match(/https?:\/\/[^\s]+/g) || [],
      userId: req.user.id // Add this line to associate the tweet with the user
    });

    await tweet.save();
    res.redirect("/tweets");
  } catch (error) {
    console.error("Error fetching tweet:", error);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
      console.error("Response headers:", error.response.headers);
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Error message:", error.message);
    }
    res.status(500).send("Failed to fetch tweet");
  }
});

// Route to Save Tweet to Folder
router.post("/save-to-folder", verifyToken, async (req, res) => {
    const { tweetId, folderId } = req.body;

    try {
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

// Route to Delete Tweet
router.post("/delete", verifyToken, async (req, res) => {
    const { tweetId } = req.body;

    try {
        await Tweet.findByIdAndDelete(tweetId);
        res.redirect("/tweets");
    } catch (error) {
        console.error('Error deleting tweet:', error);
        res.status(500).send('Error deleting tweet');
    }
});

module.exports = router;