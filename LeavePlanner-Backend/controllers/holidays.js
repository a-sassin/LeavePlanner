const fs = require('fs');
const Formidable = require('formidable');
const moment = require('moment');
const HolidayModel = require('../models/publicholidays');
const ErrorClass = require('../services/errorClass');
const utilsFile = require('../services/utils');

module.exports.addHolidays = async (req, res, next) => {
    const form = new Formidable();
    form.maxFileSize = 1024;
    form.uploadDir = '/tmp';
    form.keepExtensions = false;

    form.parse(req, async (err, fields, files) => {
        try {
            checkCsvFile(err, files);
            const holiday = {};
            const rows = [];

            holiday.updatedBy = req.employee.empId;
            holiday.year = fields.year;

            const data = fs.readFileSync(files.file.path);
            const fileData = data.toString('utf-8').split(/\n/);
            const headers = fileData[0].split(',');
            if (
                (headers[0]
                    .toLowerCase()
                    .trim()
                    .replace(/\s/g, '') !== 'date(mm/dd/yyyy)' &&
                    headers[0].toLowerCase().trim() !== 'date') ||
                headers[1].toLowerCase().trim() !== 'ocassion name'
            ) {
                throw new ErrorClass(
                    'Headers should be in this format:- Date (MM/DD/YYYY), Ocassion Name',
                    400
                );
            }
            for (let i = 1; i < fileData.length; i++) {
                rows.push(fileData[i].trim());
            }

            const list = [];

            verifyCsvData(rows, list, fields);
            holiday.holidaysList = list;

            await HolidayModel.updateOne({ year: fields.year }, holiday, {
                upsert: true,
            });
            const holidayResponse = {
                year: holiday.year,
                holidaysList: list,
                updatedBy: holiday.updatedBy,
            };
            res.send({
                status: 200,
                message: 'Holiday added successfully',
                data: holidayResponse,
            });
        } catch (error) {
            next(error);
        }
    });
};

module.exports.listHolidays = async (req, res, next) => {
    try {
        if (Object.keys(req.query).length) {
            const isInvalidRequest = utilsFile.validateRequest(
                req.query,
                ['year'],
                true
            );
            if (isInvalidRequest) {
                throw new ErrorClass('Invalid parameters', 400);
            }
            const holiday = await HolidayModel.findOne({
                year: req.query.year,
            }).select(['holidaysList', 'year', '-_id']);
            res.send({
                status: 200,
                holiday,
            });
        }
        const allHolidays = await HolidayModel.findOne({
            year: moment(Date.now()).format('YYYY'),
        }).select(['holidaysList', 'year', '-_id']);
        res.send({
            status: 200,
            holidays: allHolidays,
        });
    } catch (err) {
        next(err);
    }
};
function checkCsvFile(err, files) {
    if (err) {
        throw new ErrorClass('Internal server error', 500);
    }
    if (!files.file) {
        throw new ErrorClass('Please upload a csv file', 400);
    }
    if (files.file.type !== 'text/csv') {
        throw new ErrorClass('Please upload only csv file', 400);
    }
    if (!files.file.size) {
        throw new ErrorClass('Empty csv file', 400);
    }
}

function verifyCsvData(rows, list, fields) {
    rows.forEach(row => {
        if (row.length) {
            const rowArray = row.split(',');

            if (!moment(rowArray[0].trim(), 'MM/DD/YYYY', true).isValid()) {
                throw new ErrorClass(
                    'Please enter a valid date and use MM/DD/YYYY format',
                    400
                );
            }

            list.push({
                date: moment(rowArray[0], 'MM/DD/YYYY').format('L'),
                occasionName: rowArray[1].trim(),
            });
        }
    });
    list.forEach(eachholiday => {
        if (
            !Object.keys(eachholiday.occasionName).length ||
            !Object.keys(eachholiday.date).length
        ) {
            throw new ErrorClass('Date or Occasion name is missing', 400);
        }
        if (
            moment(eachholiday.date, 'MM/DD/YYYY').year() !==
            Number(fields.year)
        ) {
            throw new ErrorClass(
                'Value entered in year field should be equal to value of year field in date',
                400
            );
        }
    });
}
