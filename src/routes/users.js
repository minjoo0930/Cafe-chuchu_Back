const express = require("express");
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

router.get('/auth', auth, async (req, res, next) => {
    
    return res.json({
        id: req.user._id,
        userid: req.user.userid,
        name: req.user.name,
        gender: req.user.gender,
        email: req.user.email,
        phone : req.user.phone,
        cafe_preferences: req.user.cafe_preferences 
    })
})


router.post('/register', async (req, res, next) => {
    try {
        const { userid, name, password, gender, email, phone, cafe_preferences } = req.body;

        const newUser = new User({
            userid,
            name,
            password,
            gender,
            email,
            phone,
            cafe_preferences: cafe_preferences || [] 
        });

        await newUser.save();
        return res.status(200).json({ message: '회원가입 성공' });
    } catch (error) {
        console.error("회원가입 중 오류 발생:", error);
        if (error.code === 11000) { // 중복 키 오류
            res.status(400).json({ message: '이미 사용 중인 이메일 또는 아이디입니다.' });
        } else {
            res.status(500).json({ message: '서버 오류가 발생했습니다.' });
        }
    }
});




//로그인 route
router.post('/login', async(req, res, next) => {
    try {
        //존재하는 유저인지 체크
        const user = await User.findOne({ userid: req.body.userid });
        if(!user) {
            return res.status(400).send("Auth failed, ID not found");
        }

        //비밀 번호가 올바른 것인지 체크
        const isMatch = await user.comparePassword(req.body.password);
        if(!isMatch) {
            return res. status(400).send('Wrong password');
        }

        const payload = {
            userId: user._id.toHexString(),
        }

        // token 생성
        const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' })

        return res.json({ user, accessToken })

    } catch (error) {
        next(error)
    }
})


//로그아웃 router
router.post('/logout', auth, async(req, res, next) => {
    try {
        return res.sendStatus(200);
    } catch (error) {
        next(error);
    }
})


// 마이페이지 조회 (GET /users/mypage)
router.get('/mypage', auth, async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).select('-password'); // 비밀번호 제외
        if (!user) return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
        return res.json(user);
    } catch (error) {
        next(error);
    }
});

// 마이페이지 업데이트 (PUT /users/mypage)
router.put('/mypage', auth, async (req, res, next) => {
    try {
        const { name, email, phone, cafe_preferences } = req.body;
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { name, email, phone, cafe_preferences },
            { new: true, runValidators: true }
        ).select('-password'); // 비밀번호 제외

        if (!updatedUser) return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
        return res.json(updatedUser);
    } catch (error) {
        next(error);
    }
});


module.exports = router