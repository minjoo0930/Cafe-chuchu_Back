const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const auth = require('../middleware/auth');

//리뷰 작성 (POST /reviews/:cafe_id)
router.post('/:cafe_id', auth, async(req, res, next) => {
    const { content, rating } = req.body;
    const cafe_id = req.params.cafe_id;
    const writer = req.user._id;

    try {
        //리뷰 작성
        const newReview = new Review({
            content,
            rating,
            cafe_id,
            writer
        });

        await newReview.save();
        return res.status(201).json({ success: true, review: newReview});
    } catch (error) {
        next(error);
    }
});


//리뷰 조회 (GET /reviews/:cafe_id)
router.get('/:cafe_id', async(req, res, next) => {
    const cafe_id = req.params.cafe_id;

    try {
        //해당 카페의 리뷰 조회
        const reviews = await Review.find( { cafe_id })
            .populate('writer', 'name') // 작성자 이름도 함께 조회
            .sort({ createdAt: -1 });
        
        return res.status(200).json({ success: true, reviews });
    } catch(error) {
        next(error);
    }
});


// 리뷰 수정 (PUT /reviews/:review_id)
router.put('/:review_id', auth, async (req, res, next) => {
    const { content, rating } = req.body;
    const review_id = req.params.review_id;
    const user_id = req.user._id;

    try {
        // 수정할 리뷰 찾기
        const review = await Review.findById(review_id);
        if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

        //리뷰 작성자만 수정 가능
        if(review.writer.toString() !== user_id.toString()){
            return res.status(403).json({ success: false, message: 'You can only edit your own review'});
        }

        //리뷰 내용 및 평점 수정
        review.content = content;
        review.rating = rating;
        await review.save();

        return res.status(200).json({ success: true, review});
    } catch (error) {
        next(error);
    }
})


//리뷰 삭제 (DELETE /reviews/:review_id)
router.delete('/:review_id', auth, async (req, res, next) => {
    const review_id = req.params.review_id;
    const user_id = req.user._id;

    try {
        // 삭제할 리뷰 찾기
        const review = await Review.findById(review_id);
        if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

        //리뷰 작성자만 삭제 가능
        if(review.writer.toString() !== user_id.toString()){
            return res.status(403).json({ success: false, message: 'You can only delete your own review'});
        }

        await review.deleteOne();
        return res.status(200).json({ success: true, message: 'Review deleted successfully'});
    } catch (error) {
        next(error);
    }
})

module.exports = router;