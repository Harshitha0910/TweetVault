const mongoose = require('mongoose');

mongoose.connect(MONGO_URL)

const UserSchema = mongoose.Schema(
    {
        email:String,
        username:String,
        password:String,
    }
);

module.exports = mongoose.model('User', UserSchema);
