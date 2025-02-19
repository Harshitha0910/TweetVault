const express = require('express');
const Tweet = require('../models/tweets.js');
const { verifyToken } = require('../middleware/auth');
const axios = require("axios");
const router = express.Router();

const BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;

// Function to extract Tweet ID from URL
const extractTweetId = (url) => {
    const match = url.match(/status\/(\d+)/);
    return match ? match[1] : null;
};

// GET route to render the dashboard page
router.get('/', (req, res) => {
    res.render('dashboard');
});

router.post('/save', verifyToken, async (req, res) => {
    const tweetUrl = req.body.url;
    const tweetId = extractTweetId(tweetUrl);

    if (!tweetId) return res.status(400).send("Invalid Tweet URL");

    try {
        // Fetch Tweet Data from Twitter API
        const response = await axios.get(`https://api.twitter.com/2/tweets/${tweetId}?expansions=author_id,attachments.media_keys&tweet.fields=text&user.fields=username,profile_image_url&media.fields=url`, {
            headers: { Authorization: `Bearer ${BEARER_TOKEN}` },
        });

        const tweetData = response.data;

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
        console.error("Error fetching tweet:", error.response ? error.response.data : error.message);
        res.status(500).send("Failed to fetch tweet"); 
    }
});


module.exports = router;
