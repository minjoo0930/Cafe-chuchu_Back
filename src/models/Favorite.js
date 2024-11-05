const mongoose = require('mongoose');

// 찜 목록 모델
const favoriteSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',   // 유저와의 관계
        required: true
    },
    cafe_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cafe',   // 카페와의 관계
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now  // 찜한 날짜 저장
    }
}, { timestamps: true });

const Favorite = mongoose.model('Favorite', favoriteSchema);

module.exports = Favorite;
