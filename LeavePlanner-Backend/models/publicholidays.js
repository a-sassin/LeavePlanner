const mongoose = require('mongoose');
const validator = require('validator');
const moment = require('moment');
const ErrorClass = require('../services/errorClass');

const holidaySchema = new mongoose.Schema({
    _id: false,
    date: {
        type: String,
        required: true,
        validate(date) {
            if (!moment(date).isValid()) {
                throw new Error('Please enter a valid date');
            }
        },
    },
    occasionName: {
        type: String,
        required: true,
        validate(occasionName) {
            if (validator.isNumeric(occasionName)) {
                throw new ErrorClass(
                    'occasionName cannot contain numbers!!',
                    400
                );
            }
        },
    },
});

const publicholidaysSchema = new mongoose.Schema({
    year: {
        type: String,
        unique: true,
        required: true,
        validate(Year) {
            if (!validator.isNumeric(Year)) {
                throw new ErrorClass('Year can only contain numbers!!', 400);
            }
        },
    },
    holidaysList: {
        _id: false,
        type: [holidaySchema],
        required: true,
    },
    updatedBy: {
        type: String,
        validate(updatedBy) {
            if (validator.isNumeric(updatedBy)) {
                throw new ErrorClass('Name cannot contain only numbers!!', 400);
            }
        },
    },
});

publicholidaysSchema.post('save', (error, doc, next) => {
    if (error.name === 'MongoError' && error.code === 11000) {
        next(new ErrorClass('Record for this year already exists', 400));
    } else {
        next();
    }
});

const publicholidaysModel = mongoose.model(
    'publicHolidays',
    publicholidaysSchema
);
module.exports = publicholidaysModel;
