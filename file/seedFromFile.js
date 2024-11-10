const mongoose = require("mongoose");
const axios = require("axios");
const fs = require("fs");
const Cafe = require("../src/models/Cafe");
require("dotenv").config({ path: "../.env" });

// MongoDB 연결 설정
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("MongoDB 연결 성공"))
  .catch(err => console.log("MongoDB 연결 실패:", err));

// Geocoding API 호출 함수
async function getCoordinates(address) {
    const url = `https://naveropenapi.apigw.ntruss.com/map-geocode/v2/geocode`;
    try {
        const response = await axios.get(url, {
            params: { query: address },
            headers: {
                "X-NCP-APIGW-API-KEY-ID": process.env.NAVER_CLIENT_ID,
                "X-NCP-APIGW-API-KEY": process.env.NAVER_CLIENT_SECRET
            }
        });
        
        const { addresses } = response.data;
        if (addresses.length > 0) {
            return {
                latitude: parseFloat(addresses[0].y),
                longitude: parseFloat(addresses[0].x)
            };
        }
        return null;
    } catch (error) {
        console.error("좌표 변환 중 오류 발생:", error.response ? error.response.data : error.message);
        return null;
    }
}

// 카페 데이터 가져오기 및 삽입 함수
const importData = async () => {
    try {
        const data = fs.readFileSync("./CafeData_processed.json", "utf-8");
        const cafes = JSON.parse(data);

        for (let cafe of cafes) {
            const coordinates = await getCoordinates(cafe.주소);
            if (coordinates) {
                cafe.latitude = coordinates.latitude;
                cafe.longitude = coordinates.longitude;
            } else {
                console.log(`${cafe.이름}의 좌표를 가져올 수 없습니다.`);
                continue;
            }

            const newCafe = new Cafe({
                name: cafe.이름,
                address: cafe.주소,
                rating: cafe.평점,
                image_url: cafe["이미지 주소"],
                sns_link: cafe["SNS 링크"],
                category: cafe.category,
                review1: cafe.리뷰1,
                review2: cafe.리뷰2,
                review3: cafe.리뷰3,
                latitude: cafe.latitude,
                longitude: cafe.longitude
            });
            await newCafe.save();
            console.log(`${cafe.이름} 저장 완료.`);
        }

        console.log("데이터 삽입 완료!");
    } catch (error) {
        console.error("데이터 삽입 중 오류:", error);
    } finally {
        mongoose.connection.close();
    }
};

// 데이터 삽입 함수 실행
importData();
