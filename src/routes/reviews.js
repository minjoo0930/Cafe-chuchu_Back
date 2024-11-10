const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Cafe = require('../models/Cafe');
const auth = require('../middleware/auth');

// 평균 평점 업데이트 함수
async function updateAverageRating(cafeId) {
    const reviews = await Review.find({ cafe_id: cafeId });
    if (reviews.length === 0) {
        await Cafe.findByIdAndUpdate(cafeId, { averageRating: 0 });
        return;
    }
    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    await Cafe.findByIdAndUpdate(cafeId, { averageRating });
}

// 리뷰 작성 (POST /reviews/:cafe_id)
router.post('/:cafe_id', auth, async(req, res, next) => {
    const { content, rating } = req.body;
    const cafe_id = req.params.cafe_id;
    const writer = req.user._id;

    try {
        const newReview = new Review({ content, rating, cafe_id, writer });
        await newReview.save();

        await updateAverageRating(cafe_id);
        return res.status(201).json({ success: true, review: newReview });
    } catch (error) {
        next(error);
    }
});

// 리뷰 수정 (PUT /reviews/:review_id)
router.put('/:review_id', auth, async (req, res, next) => {
    const { content, rating } = req.body;
    const review_id = req.params.review_id;
    const user_id = req.user._id;

    try {
        const review = await Review.findById(review_id);
        if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
        if (review.writer.toString() !== user_id.toString()) {
            return res.status(403).json({ success: false, message: 'You can only edit your own review' });
        }

        review.content = content;
        review.rating = rating;
        await review.save();

        await updateAverageRating(review.cafe_id);
        return res.status(200).json({ success: true, review });
    } catch (error) {
        next(error);
    }
});

// 리뷰 삭제 (DELETE /reviews/:review_id)
router.delete('/:review_id', auth, async (req, res, next) => {
    const review_id = req.params.review_id;
    const user_id = req.user._id;

    try {
        const review = await Review.findById(review_id);
        if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
        if (review.writer.toString() !== user_id.toString()) {
            return res.status(403).json({ success: false, message: 'You can only delete your own review' });
        }

        const cafe_id = review.cafe_id;
        await review.deleteOne();

        await updateAverageRating(cafe_id);
        return res.status(200).json({ success: true, message: 'Review deleted successfully' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;