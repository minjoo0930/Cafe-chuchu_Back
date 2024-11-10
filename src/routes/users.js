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


// 회원가입 route
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
            cafe_preferences: cafe_preferences || [] // 사용자가 선택하지 않으면 기본값으로 빈 배열
        });
        
        await newUser.save(); // 수정된 부분
        return res.sendStatus(200);
    } catch (error) {
        next(error);
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

module.exports = router