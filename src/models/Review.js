const { default: mongoose } = require("mongoose");

const reviewSchema = mongoose.Schema({
    content: {
        type: String,
        required: true,
        trim: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    cafe_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cafe',
        required: true
    },
    writer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
},{ timestamps: true }
);


const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;