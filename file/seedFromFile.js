const mongoose = require("mongoose");
const User = require("../src/models/Cafe");
const fs = require("fs");
require("dotenv").config({ path: "../.env" });  // .env 파일에서 MongoDB URI를 불러오기 위해 사용

// MongoDB 연결 설정
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("MongoDB 연결 성공"))
  .catch(err => console.log("MongoDB 연결 실패:", err));

// JSON 파일에서 사용자 데이터 읽기
const importData = async () => {
    try {
        const data = fs.readFileSync("./cafes.json", "utf-8");  // JSON 파일 읽기
        const users = JSON.parse(data);  // JSON 문자열을 자바스크립트 객체로 변환

        // 각 사용자의 비밀번호를 해시화 후 저장
        const userPromises = users.map(async (user) => {
            const newUser = new User(user);
            await newUser.save();
        });

        await Promise.all(userPromises);
        console.log("데이터 삽입 완료!");
    } catch (error) {
        console.error("데이터 삽입 중 오류:", error);
    } finally {
        mongoose.connection.close();  // 연결 종료
    }
};

// 데이터 삽입 함수 실행
importData();
