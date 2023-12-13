const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema({
    library:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Library"
    },
    name: {
        type: String,
        required: [true, "Please provide student name"],
    },
    email: {
        type: String,
        required: [true, "Please provide unique email"],
    },
    mobile: {
        type: String,
        required: [true, "Please provide student mobile."]
    },
    address: {
        type: String,
    },
    profile: {
        type: String,
    },
}, { timestamps: true })

module.exports = mongoose.model("Student",StudentSchema);