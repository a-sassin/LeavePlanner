const mongoose = require('mongoose');
const validator = require('validator');
const ErrorClass = require('../services/errorClass');

const EmployeeSchema = new mongoose.Schema({
    empId: {
        type: String,
        unique: true,
        required: true,
    },
    empName: {
        type: String,
        required: true,
        validate(empName) {
            if (validator.isNumeric(empName)) {
                throw new ErrorClass('Name cannot contain only numbers!!', 400);
            }
        },
    },
    tokens: { type: Array, required: true },
    isAdmin: {
        type: Boolean,
        default: false,
    },
});

EmployeeSchema.statics.findEmpById = async (empId, next) => {
    try {
        const data = await this.findOne({ empId });
        if (!data) {
            return 'employee does not exits !';
        }
        return data;
    } catch (error) {
        next(error);
    }
    return 0;
};
const EmpModel = mongoose.model('Employees', EmployeeSchema);
module.exports = EmpModel;
