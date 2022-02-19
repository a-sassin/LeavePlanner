const mongoose = require('mongoose');
const validator = require('validator');
const ErrorClass = require('../services/errorClass');

const TeamSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            validate(name) {
                if (validator.isNumeric(name)) {
                    throw new ErrorClass(
                        'Name cannot contain only numbers!!',
                        400
                    );
                }
            },
        },
        owner: {
            type: String,
            required: true,
        },
        ownerId: {
            type: String,
            required: true,
        },
        members: [
            {
                _id: false,
                name: { type: String, required: true },
                empId: { type: String, required: true },
            },
        ],
        teamId: {
            type: mongoose.Schema.ObjectId,
            required: true,
            unique: true,
        },
    },
    { timestamps: true }
);

const TeamModel = mongoose.model('Teams', TeamSchema);
module.exports = TeamModel;
