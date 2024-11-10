const { default: mongoose } = require("mongoose");

const cafeSchema = new mongoose.Schema({
    name: { // 카페 이름
        type: String,
        maxLength: 50,
        required: true,
        trim: true
    },
    address: { // 카페 주소
        type: String,
        required: true
    },
    rating: { // 카페 평점
        type: String,
        default: 0
    },
    averageRating: { // 사용자 리뷰를 통한 평균 평점
        type: Number,
        default: 0
    },
    image_url: { // 이미지 URL 배열로 저장
        type: [String],
        default: []
    },
    sns_link: { // SNS 링크 배열로 저장
        type: [String],
        default: []
    },
    category: { // 카페 카테고리
        type: [String],
        default: []
    },
    review1: { // 첫 번째 리뷰
        type: String,
        default: ""
    },
    review2: { // 두 번째 리뷰
        type: String,
        default: ""
    },
    review3: { // 세 번째 리뷰
        type: String,
        default: ""
    },
    latitude: {  
        type: Number,
        default: null
    },
    longitude: { 
        type: Number,
        default: null
    },
    reviewCount: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

const Cafe = mongoose.model('Cafe', cafeSchema);

module.exports = Cafe;
