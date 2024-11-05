const express = require('express');
const path = require('path');
const app = express();
const cors = require('cors');
const axios = require('axios');  // axios 모듈 추가
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const port = 3000;

app.use(cors());
app.use(express.json());

// MongoDB 연결
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('연결완료');
    })
    .catch(err => {
        console.error('MongoDB 연결 오류:', err);
    });

// 기본 테스트 라우트
app.get('/', (req, res, next) => {
    setImmediate(() => { next(new Error('it is an error')) });
});

app.post('/', (req, res) => {
    console.log(req.body);
    res.json(req.body);
});

// Flask API와 통신
app.post('/chat', async (req, res) => {
    const userMessage = req.body.message;

    try {
        // Flask API로 POST 요청
        const response = await axios.post('http://localhost:5000/recommend', {
            message: userMessage
        });

        // 응답 반환
        res.json({ response: response.data.recommendations });
    } catch (error) {
        console.error('Flask API와 통신 중 오류 발생:', error);
        res.status(500).json({ error: 'Flask API와 통신에 실패했습니다.' });
    }
});

// 라우트 연결
app.use('/users', require('./routes/users'));
app.use('/cafes', require('./routes/cafes'));
app.use('/reviews', require('./routes/reviews'));
app.use('/favorites', require('./routes/favorites'));

// 에러 핸들링 미들웨어
app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.send(error.message || '서버에서 에러가 났습니다.');
});

// 정적 파일 미들웨어
app.use(express.static(path.join(__dirname, '../uploads')));

app.listen(port, () => {
    console.log(`${port}번에서 실행이 되었습니다.`);
});
