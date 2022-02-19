const mongoose = require('mongoose');
const validator = require('validator');
const { STATUS } = require('../constant');
const ErrorClass = require('../services/errorClass');

const ownershipRequest = new mongoose.Schema(
    {
        teamName: {
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
        currentOwner: {
            type: String,
            required: true,
        },
        currentOwnerId: {
            type: String,
            required: true,
        },
        teamId: {
            type: String,
            required: true,
        },
        newOwnerId: {
            type: String,
            required: true,
        },
        status: {
            enum: Object.values(STATUS),
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

const OwnershipModel = mongoose.model('Ownership', ownershipRequest);
module.exports = OwnershipModel;
