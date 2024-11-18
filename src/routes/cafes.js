const express = require('express');
const router = express.Router();
const Cafe = require('../models/Cafe');
const Review = require('../models/Review');

// 거리 계산 함수
function calculateDistance(lat1, lon1, lat2, lon2) {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // 지구 반지름 (km)
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// 카페 조회 라우트 (Get /cafes/search)
router.get('/search', async (req, res, next) => {
    const { category, cafe_name, sortByProximity, latitude, longitude } = req.query;
    const limit = req.query.limit ? Number(req.query.limit) : 10; // 한 페이지에 보여줄 카페 수 (기본 10개)
    const page = req.query.page ? Number(req.query.page) : 1; // 페이지 번호 (기본값 1)
    const skip = (page - 1) * limit;

    let findArgs = {};

    // 카테고리별 조회
    if (category) findArgs.category = category;

    // 카페 이름 검색 
    if (cafe_name) {
        findArgs.name = { $regex: cafe_name, $options: 'i' }; 
    }

    try {
        // 모든 조건에 맞는 카페 목록 조회
        let cafes = await Cafe.find(findArgs);

        // 사용자가 가까운 순 정렬을 요청했을 때
        if (sortByProximity === 'true' && latitude && longitude) {
            const userLat = parseFloat(latitude);
            const userLon = parseFloat(longitude);

            cafes = cafes.map(cafe => {
                if (cafe.latitude && cafe.longitude) {
                    // 거리 계산 후 distance 필드 추가
                    cafe = cafe.toObject(); // Mongoose 문서를 일반 객체로 변환
                    cafe.distance = calculateDistance(
                        userLat,
                        userLon,
                        cafe.latitude,
                        cafe.longitude
                    );
                }
                return cafe;
            });

            // 거리 기준으로 정렬
            cafes.sort((a, b) => a.distance - b.distance);
        }

        // 페이지 처리
        const totalCafes = cafes.length;
        const paginatedCafes = cafes.slice(skip, skip + limit);
        const hasMore = skip + limit < totalCafes; // 다음 페이지가 있는지 확인

        // 응답으로 카페 목록 전송
        return res.status(200).json({
            success: true,
            cafes: paginatedCafes,
            currentPage: page, 
            totalPages: Math.ceil(totalCafes / limit), 
            totalCafes, 
            hasMore 
        });
    } catch (error) {
        next(error);
    }
});

// 카페 상세 페이지 (GET /cafes/:id)
router.get('/:id', async (req, res, next) => {
    const cafeId = req.params.id;

    try {
        // 카페 정보를 조회
        const cafe = await Cafe.findById(cafeId).select(
            'name rating address category image_url sns_link'
        );

        if (!cafe) {
            return res.status(404).json({ success: false, message: 'Cafe not found' });
        }

        // 해당 카페 리뷰 가져오기
        const reviews = await Review.find({ cafe_id: cafeId })
            .populate('writer', 'name') // 리뷰 작성자의 이름
            .sort({ createdAt: -1 });  // 최신순으로 정렬

        // 리뷰 수 계산
        const reviewCount = reviews.length;

        // 반환할 데이터 구성
        return res.status(200).json({
            success: true,
            cafe: {
                id: cafe._id,
                name: cafe.name,
                rating: cafe.rating || '평점 없음',
                reviewCount: reviewCount,
                address: cafe.address,
                category: cafe.category || [], // 분위기 키워드
                image_url: cafe.image_url || [], // 이미지 URL 배열
                sns_link: cafe.sns_link || []   // SNS 링크 배열
            },
            reviews: reviews.map(review => ({
                id: review._id,
                content: review.content,
                rating: review.rating,
                writer: review.writer ? review.writer.name : '익명',
                createdAt: review.createdAt
            }))
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
