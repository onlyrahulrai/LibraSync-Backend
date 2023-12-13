const mongoose = require("mongoose");

const LibrarySchema = new mongoose.Schema({
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    name: {
        type: String,
        required: [true, "Please provide student name"],
    },
    address: {
        type: String,
    },
    images: [{
        type: String,
    }],
    description:{
        type:String
    }
}, { timestamps: true })

module.exports = mongoose.model("Library",LibrarySchema);