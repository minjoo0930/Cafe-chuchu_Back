const express = require("express");
const axios = require("axios");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/", auth, async (req, res) => {
    try {
        // 1. 인증된 사용자 정보 가져오기
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });

        // 2. 사용자 선호 카페 분위기 데이터 가져오기
        const userPreferences = {
            categories: user.cafe_preferences || []
        };

        // 3. 파이썬 추천 서비스에 요청 보내기
        const response = await axios.post("https://port-0-flask-m39ixlhha27ce70c.sel4.cloudtype.app/api/recommend", {
            preferences: userPreferences
        });

        res.status(200).json(response.data);

    } catch (error) {
        console.error("요청 중 오류 발생:", error);
        res.status(500).json({ error: "요청 처리 중 오류가 발생했습니다." });
    }
});

module.exports = router;