const express = require('express');
const router = express.Router();
const Cafe = require('../models/Cafe');
const Review = require('../models/Review');

// 카페 조회 라우트 (Get/cafes/search)
router.get('/search', async (req, res, next) => {
    const { category, openTime, closeTime, cafe_name } = req.query;
    const limit = req.query.limit ? Number(req.query.limit) : 10; // 한 페이지에 보여줄 카페 수 (기본 10개)
    const page = req.query.page ? Number(req.query.page) : 1; // 페이지 번호 (기본값 1)
    const skip = (page - 1) * limit;

    let findArgs = {};

    // 카테고리별 조회
    if (category) {
        findArgs.category = category; 
    }

    // 시간 기반 조회
    const currentTime = new Date();
    const currentHoursMinutes = currentTime.toTimeString().slice(0, 5); // "HH:MM" 형식의 현재 시간

    findArgs.$and = [
        { open_time: { $lte: currentHoursMinutes } },   // 현재 시간이 오픈 시간 이후
        { close_time: { $gte: currentHoursMinutes } }    // 현재 시간이 마감 시간 이전
    ];

    try {
        const cafes = await Cafe.find(findArgs)
            .skip(skip)
            .limit(limit);

        const totalCafes = await Cafe.countDocuments(findArgs);
        const hasMore = skip + limit < totalCafes;

        return res.status(200).json({
            success: true,
            cafes,
            currentPage: page, 
            totalPages: Math.ceil(totalCafes / limit), 
            totalCafes, 
            hasMore 
        });
    } catch (error) {
        next(error);
    }


    // 카페 이름 검색 
    if (cafe_name) {
        findArgs.cafe_name = { $regex: cafe_name, $options: 'i' }; 
    }

    try {
        // 조건에 맞는 카페 목록 조회
        const cafes = await Cafe.find(findArgs)
            .skip(skip) 
            .limit(limit);

        // 전체 카페 수 구하기
        const totalCafes = await Cafe.countDocuments(findArgs);
        const hasMore = skip + limit < totalCafes; // 다음 페이지가 있는지 확인

        // 응답으로 카페 목록 전송
        return res.status(200).json({
            success: true,
            cafes,
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

    try{
        const cafe = await Cafe.findById(cafeId);

        if(!cafe) {
            return res.status(404).json({ success : false, message: 'Cafe not found'});
        }

        //해당 카페 리뷰 가져오기
        const reviews = await Review.find({ cafe_id: cafeId })
            .populate('writer', 'name')
            .sort({ createdAt: -1 });

        //카페 정보와 리뷰 정보 반환
        return res.status(200).json({
            success: true,
            cafe,
            reviews
        }); 
    } catch (error) {
        next(error);
    }
});


module.exports = router;

