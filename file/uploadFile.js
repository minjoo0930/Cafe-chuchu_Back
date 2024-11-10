const mongoose = require("mongoose");
const fs = require("fs");
const Favorite = require("../src/models/Favorite"); // Favorite 모델을 불러옵니다.
require("dotenv").config({ path: "../.env" });

// MongoDB 연결 설정
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("MongoDB 연결 성공"))
  .catch(err => console.log("MongoDB 연결 실패:", err));

// 찜 목록 데이터 가져오기 및 삽입 함수
const importFavorites = async () => {
    try {
        // favorites.json 파일에서 데이터를 읽어옵니다.
        const data = fs.readFileSync("./favorite.json", "utf-8");
        const favorites = JSON.parse(data);

        // 각 찜 데이터를 MongoDB에 저장합니다.
        for (let favorite of favorites) {
            const newFavorite = new Favorite({
                cafe_id: favorite.cafe_id,
                user_id: favorite.user_id
            });
            await newFavorite.save();
            console.log(`찜 데이터 저장 완료 - 사용자 ID: ${favorite.user_id}, 카페 ID: ${favorite.cafe_id}`);
        }

        console.log("찜 데이터 삽입 완료!");
    } catch (error) {
        console.error("찜 데이터 삽입 중 오류:", error);
    } finally {
        mongoose.connection.close();
    }
};

// 데이터 삽입 함수 실행
importFavorites();
