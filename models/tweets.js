const mongoose = require('mongoose');

const tweetSchema = new mongoose.Schema({
    tweet_id: String,
    username: String,
    user_handle: String,
    profile_image: String,
    text: String,
    media: [String],  // Array to store images/videos
    external_links: [String],
    createdAt: { type: Date, default: Date.now },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } 
  });

module.exports = mongoose.model('Tweet', tweetSchema);
