// model/File.js
const mongoose = require('mongoose');

const musicSchema = new mongoose.Schema({
    audioName: {
        type: String,
        required: true
    },
    audioFileName: {
        type: String,
        required: true
    },
    audioPath: {
        type: String,
        required: true
    },
    uploadDate: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Music', musicSchema);