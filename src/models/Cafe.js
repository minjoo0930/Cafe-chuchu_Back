const { default: mongoose } = require("mongoose");

const cafeSchema = mongoose.Schema({
    cafe_name : {
        type: String,
        maxLength: 50
    },
    location : {
        type: String
    },
    category : {
        type: [String],
        default: []
    },
    image: {
        type: [String],
        default: []
    },
    open_time: {
        type: String
    },
    close_time: {
        type: String
    }
},{ timestamps: true }
)


const Cafe = mongoose.model('Cafe', cafeSchema);

module.exports = Cafe;