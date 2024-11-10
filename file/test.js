const axios = require("axios");
require("dotenv").config({ path: "../.env" });

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
            console.log("Coordinates:", {
                latitude: parseFloat(addresses[0].y),
                longitude: parseFloat(addresses[0].x)
            });
            return {
                latitude: parseFloat(addresses[0].y),
                longitude: parseFloat(addresses[0].x)
            };
        } else {
            console.log("좌표를 찾을 수 없습니다.");
            return null;
        }
    } catch (error) {
        console.error("좌표 변환 중 오류 발생:", error.response ? error.response.data : error.message);
        return null;
    }
}

// 테스트 주소를 사용하여 좌표를 가져옵니다
getCoordinates("대구 북구 호암로 51");