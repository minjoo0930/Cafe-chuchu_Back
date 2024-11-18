const express = require('express');
const router = express.Router();
const Favorite = require('../models/Favorite');
const Cafe = require('../models/Cafe'); 
const Review = require('../models/Review'); 
const auth = require('../middleware/auth');


// 카페 찜 추가 (POST /favorites/:cafe_id)
router.post('/:cafe_id', auth, async (req, res, next) => {
    const cafeId = req.params.cafe_id;
    const userId = req.user._id;

    try {
        // 이미 찜한 카페인지 확인
        const existingFavorite = await Favorite.findOne({ user_id: userId, cafe_id: cafeId });
        if (existingFavorite) {
            return res.status(400).json({ success: false, message: 'Cafe already in favorites' });
        }

        // 새로운 찜 추가
        const favorite = new Favorite({ user_id: userId, cafe_id: cafeId });
        await favorite.save();

        return res.status(201).json({ success: true, message: 'Cafe added to favorites', favorite });
    } catch (error) {
        next(error);
    }
});

// 카페 찜 삭제 (DELETE /favorites/:cafe_id)
router.delete('/:cafe_id', auth, async (req, res, next) => {
    const cafeId = req.params.cafe_id;
    const userId = req.user._id;

    try {
        // 찜 목록에서 해당 카페 삭제
        const result = await Favorite.findOneAndDelete({ user_id: userId, cafe_id: cafeId });
        if (!result) {
            return res.status(404).json({ success: false, message: 'Favorite not found' });
        }

        return res.status(200).json({ success: true, message: 'Cafe removed from favorites' });
    } catch (error) {
        next(error);
    }
});

// 자신의 찜 목록 조회 (GET /favorites)
router.get('/', auth, async (req, res, next) => {
    const userId = req.user._id;

    try {
        // 유저의 찜 목록 조회 (카페 정보와 리뷰 개수, 평점 포함)
        const favorites = await Favorite.find({ user_id: userId })
            .populate({
                path: 'cafe_id',
                select: 'name address image_url rating'
            });

        // 데이터 포맷 조정
        const favoriteList = await Promise.all(
            favorites.map(async (favorite) => {
                const cafe = favorite.cafe_id;

                if (!cafe) {
                    return null; // 카페 정보가 없을 경우 처리
                }

                // 리뷰 개수 계산
                const reviewCount = await Review.countDocuments({ cafe_id: cafe._id });

                return {
                    cafe_id: cafe._id,
                    name: cafe.name,
                    address: cafe.address,
                    image_url: cafe.image_url ? cafe.image_url[0] : null, // 첫 번째 이미지
                    rating: cafe.rating || '평점 없음',
                    reviewCount
                };
            })
        );

        // null 값을 필터링하여 최종 목록을 반환
        return res.status(200).json({ success: true, favorites: favoriteList.filter(item => item !== null) });
    } catch (error) {
        next(error);
    }
});


module.exports = router;
