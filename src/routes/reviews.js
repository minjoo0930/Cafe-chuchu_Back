const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Cafe = require('../models/Cafe');
const auth = require('../middleware/auth');

// 평균 평점 및 리뷰 수 업데이트 함수
async function updateCafeStats(cafeId) {
    const reviews = await Review.find({ cafe_id: cafeId });

    const reviewCount = reviews.length;
    const averageRating = reviewCount > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
        : 0;

    await Cafe.findByIdAndUpdate(cafeId, { averageRating, reviewCount });
}

// 리뷰 작성 (POST /reviews/:cafe_id)
router.post('/:cafe_id', auth, async (req, res, next) => {
    const { content, rating } = req.body;
    const cafeId = req.params.cafe_id;
    const writer = req.user._id;

    try {
        const newReview = new Review({ content, rating, cafe_id: cafeId, writer });
        await newReview.save();

        await updateCafeStats(cafeId);
        return res.status(201).json({ success: true, review: newReview });
    } catch (error) {
        next(error);
    }
});

// 리뷰 수정 (PUT /reviews/:review_id)
router.put('/:review_id', auth, async (req, res, next) => {
    const { content, rating } = req.body;
    const reviewId = req.params.review_id;
    const userId = req.user._id;

    try {
        const review = await Review.findById(reviewId);
        if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
        if (review.writer.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: 'You can only edit your own review' });
        }

        review.content = content;
        review.rating = rating;
        await review.save();

        await updateCafeStats(review.cafe_id);
        return res.status(200).json({ success: true, review });
    } catch (error) {
        next(error);
    }
});

// 리뷰 삭제 (DELETE /reviews/:review_id)
router.delete('/:review_id', auth, async (req, res, next) => {
    const reviewId = req.params.review_id;
    const userId = req.user._id;

    try {
        const review = await Review.findById(reviewId);
        if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
        if (review.writer.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: 'You can only delete your own review' });
        }

        const cafeId = review.cafe_id;
        await review.deleteOne();

        await updateCafeStats(cafeId);
        return res.status(200).json({ success: true, message: 'Review deleted successfully' });
    } catch (error) {
        next(error);
    }
});

// 특정 카페에 대한 리뷰 수 조회 라우트 (GET /reviews/count/:cafe_id)
router.get('/count/:cafe_id', async (req, res, next) => {
    const cafeId = req.params.cafe_id;

    try {
        const reviewCount = await Review.countDocuments({ cafe_id: cafeId });

        return res.status(200).json({
            success: true,
            count: reviewCount
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
