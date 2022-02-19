const mongoose = require('mongoose');

const mailErrorInfo = new mongoose.Schema({
    _id: false,
    toMailId: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    occuredAt: { type: Date, required: true },
});

const mailErrorsSchema = new mongoose.Schema({
    empId: {
        type: String,
        required: true,
    },
    empName: {
        type: String,
        required: true,
    },
    errorInfo: { type: [mailErrorInfo], required: true },
});

const mailErrorModel = mongoose.model('mailerrors', mailErrorsSchema);
module.exports = mailErrorModel;
