const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
    name: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tweets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tweet' }]
});

module.exports = mongoose.model('Folder', folderSchema);
