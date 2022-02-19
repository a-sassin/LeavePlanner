const mongoose = require('mongoose');
const leaveType = require('../constant');

const leaveSchema = new mongoose.Schema({
    from: {
        type: Date,
        required: true,
    },
    to: {
        type: Date,
        required: true,
    },

    leave_id: {
        type: mongoose.Schema.ObjectId,
        required: true,
        unique: true,
    },
    reason: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
        enum: Object.values(leaveType),
    },
    empId: {
        type: String,
        required: true,
    },
    empName: {
        type: String,
        required: true,
    },
    markedAbsentBy: {
        type: String,
    },
});

const LeaveModel = mongoose.model('Leave', leaveSchema);
module.exports = LeaveModel;
