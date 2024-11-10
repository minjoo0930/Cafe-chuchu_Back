const { default: mongoose } = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema({
    userid : {
        type : String,
        required : true,
        trim: true,
        unique : true, // 중복ID 방지
    },
    name : {
        type : String,
        required : true,
        maxLength: 50
    },
    password : {
        type : String,
        required : true
    },
    gender : {
        type : String,
        required : true,
    },
    email : {
        type : String,
        unique : true, // 중복 email 방지
        trim: true,
        required: true
    },
    phone : {
        type : String,
        required: true
    },
    cafe_preferences: {
        type: [String], 
        eenum: [
            '경치가 좋은',     
            '넓은',          
            '사람 많은',      
            '인테리어 예쁜', 
            '사진찍기 좋은', 
            '조용한' 
        ],
        validate: [arrayLimit, '{PATH} exceeds the limit of 6'], // 최대 6개까지 선택 가능
        default: []
    }
},{ timestamps: true }
)

//선호분위기 배열 6개 제한
function arrayLimit(val) {
    return val.length <= 6;
}

//비밀번호 암호화
userSchema.pre('save', async function(next) {
    let user = this;

    if(user.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(user.password, salt);
        user.password = hash;
    }

    next();
})

// 비밀번호 비교
userSchema.methods.comparePassword = async function (plainPassword) {
    let user = this;
    const match = await bcrypt.compare(plainPassword, user.password);
    return match;
}

const User = mongoose.model("User", userSchema);

module.exports = User;