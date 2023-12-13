const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true
        },
        date: {
            type: Date,
            required: true
        },
        checkin: {
            type: Date,
        },
        checkout: {
            type: Date,
        }
    },
    {
        timestamps: true
    })

module.exports = mongoose.model("Attendance", AttendanceSchema);