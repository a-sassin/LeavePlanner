const moment = require('moment');
const mongoose = require('mongoose');
const utilsFile = require('../services/utils');
const ErrorClass = require('../services/errorClass');
const Emp = require('../models/employee');
const Team = require('../models/team');
const Leave = require('../models/leave');
const { leaveType, weekends } = require('../constant');
const Holidays = require('../models/publicholidays');
const { sendMail } = require('../services/mail');

module.exports.declareLeave = async (req, res, next) => {
    try {
        const isInvalidRequest = utilsFile.validateRequest(
            req.body,
            ['to', 'from', 'reason', 'type'],
            true
        );
        if (isInvalidRequest) {
            throw new ErrorClass('Invalid parameters', 400);
        }
        const leave = new Leave();
        const { from } = req.body;
        const { to } = req.body;
        leave.from = moment(from, 'MM-DD-YYYY');
        leave.to = moment(to, 'MM-DD-YYYY');
        leave.reason = req.body.reason;
        isDateValid(from, to, req);
        const isPublicHoliday = await Holidays.findOne({
            year: [
                moment(leave.from, moment.ISO_8601).format('YYYY'),
                moment(leave.to, moment.ISO_8601).format('YYYY'),
            ],
            holidaysList: {
                $elemMatch: {
                    date: [
                        moment(leave.from, moment.ISO_8601).format('L'),
                        moment(leave.to, moment.ISO_8601).format('L'),
                    ],
                },
            },
        });
        isLeaveOnWeekendOrPH(leave, isPublicHoliday);

        isBackdatedLeave(leave, req);

        if (
            !moment(leave.to, moment.ISO_8601).isSameOrBefore(
                moment().add(3, 'months')
            )
        )
            throw new ErrorClass(
                'Leave cannot apply for date which is  greater than 3 months from current date',
                400
            );
        const alreadyleave = await Leave.find({
            empId: req.employee.empId,
        });
        isAlreadyLeaveTaken(alreadyleave, leave);

        leave.empId = req.employee.empId;
        leave.empName = req.employee.empName;
        leave.leave_id = mongoose.Types.ObjectId();
        await leave.save();
        const teamOwners = await Team.find({
            members: {
                $elemMatch: {
                    empId: req.employee.empId,
                },
            },
            ownerId: { $ne: req.employee.empId },
        }).select('ownerId -_id');

        const teamOwnersIsUnique = [];

        res.send({
            status: 201,
            message: 'Leave successfully added.',
            leave_id: leave.leave_id,
        });
        await sendingMail(teamOwners, teamOwnersIsUnique, req, leave);
    } catch (err) {
        next(err);
    }
};

module.exports.updateLeave = async (req, res, next) => {
    try {
        const isInvalidRequest = utilsFile.validateRequest(
            req.query,
            ['leave_id'],
            false
        );
        if (isInvalidRequest) {
            throw new ErrorClass('Invalid parameters', 400);
        }
        const leaveInfo = await Leave.findOne({
            leave_id: req.query.leave_id,
            empId: req.employee.empId,
        });
        if (!leaveInfo) {
            throw new ErrorClass(
                'No Leave Information present with the given leave_id',
                400
            );
        }

        const fromDate = req.body.from;
        const toDate = req.body.to;
        if (!fromDate || !toDate) {
            throw new ErrorClass('from and to are mandatory fields', 400);
        }

        const isInvalidRequest2 = utilsFile.validateRequest(
            req.body,
            ['from', 'to', 'reason', 'type'],
            true
        );
        if (isInvalidRequest2) {
            throw new ErrorClass('Invalid parameters', 400);
        }
        await validationsInUpdateLeave(fromDate, toDate, leaveInfo);
        await overlapValidation(req, leaveInfo, fromDate, toDate);
        await leaveInfo.save();
        res.status(200).send({
            status: 200,
            message: 'Leave updated successfully',
        });
        try {
            const teamOwners = await Team.find({
                members: {
                    $elemMatch: {
                        empId: req.employee.empId,
                    },
                },
                ownerId: { $ne: req.employee.empId },
            }).select('ownerId -_id');

            if (teamOwners[0]) {
                const ownerMail = [];

                await Promise.all(
                    teamOwners.map(async owner => {
                        const ownerData = await utilsFile.getEmpDetails(
                            owner.ownerId
                        );
                        ownerMail.push(ownerData.mail);
                    })
                );
                if (ownerMail.length) {
                    const mailMessage = `<h3 style="color:green;">${req.employee.empName}(${req.employee.empId}) has updated his leave in which leave_id is "${req.query.leave_id}"</h3>`;
                    await sendMail(
                        ownerMail,
                        'Employee updated his leave',
                        mailMessage
                    );
                }
            }
        } catch (er) {
            console.log(er.message);
        }
    } catch (error) {
        next(error);
    }
};

module.exports.deleteLeave = async (req, res, next) => {
    try {
        const isInvalidRequest = utilsFile.validateRequest(
            req.query,
            ['leave_id'],
            false
        );
        if (isInvalidRequest) {
            throw new ErrorClass('Invalid parameters', 400);
        }
        if (!req.query.leave_id) {
            throw new ErrorClass('LeaveId is mandatory', 400);
        }
        const leave = await Leave.findOne({ leave_id: req.query.leave_id });
        if (!leave) {
            throw new ErrorClass('No leave found with the given leave Id', 400);
        }
        const employee = await Leave.deleteOne({
            leave_id: req.query.leave_id,
        });
        if (employee.deletedCount === 0) {
            throw new ErrorClass('Employee does not have any Leaves', 400);
        }
        res.send({ status: 200, message: 'Leave successfully deleted' });
        try {
            const teamOwners = await Team.find({
                members: {
                    $elemMatch: {
                        empId: req.employee.empId,
                    },
                },
                ownerId: { $ne: req.employee.empId },
            }).select('ownerId -_id');

            if (teamOwners[0]) {
                const ownerMail = [];

                await Promise.all(
                    teamOwners.map(async owner => {
                        const ownerData = await utilsFile.getEmpDetails(
                            owner.ownerId
                        );
                        ownerMail.push(ownerData.mail);
                    })
                );
                if (ownerMail.length) {
                    const mailMessage = `<h3 style="color:red;">${
                        req.employee.empName
                    }(${
                        req.employee.empId
                    }) has deleted his leave from "${moment(leave.from).format(
                        'LL'
                    )}" to "${moment(leave.to).format('LL')}".</h3>`;
                    await sendMail(
                        ownerMail,
                        'Employee deleted his leave',
                        mailMessage
                    );
                }
            }
        } catch (er) {
            console.log(er.message);
        }
    } catch (err) {
        next(err);
    }
};

module.exports.getLeaves = async (req, res, next) => {
    try {
        const leaveData = await Leave.find({
            empId: req.employee.empId,
        }).select('empId from to type reason -_id leave_id');
        const empData = await Emp.findOne({ empId: req.employee.empId });
        const empTeams = await Team.find({
            members: {
                $in: [
                    {
                        name: empData.empName,
                        empId: empData.empId,
                    },
                ],
            },
        }).select('name -_id');
        let message = '';
        if (!leaveData[0]) message = 'No leaves exits';
        res.send({
            status: 200,
            leaves: leaveData,
            teams: empTeams,
            message,
        });
    } catch (err) {
        next(err);
    }
};
async function overlapValidation(req, leaveInfo, fromDate, toDate) {
    Object.keys(req.body).forEach(element => {
        if (element === 'from' || element === 'to') {
            leaveInfo[element] = new Date(req.body[element]);
        } else {
            leaveInfo[element] = req.body[element];
        }
    });
    const alreadyLeave = await Leave.find({
        empId: req.employee.empId,
        leave_id: { $ne: req.query.leave_id },
    });
    alreadyLeave.forEach(element => {
        if (
            moment(fromDate, 'MM/DD/YYYY').isBetween(
                moment(element.from, 'MM/DD/YYYY'),
                moment(element.to, 'MM/DD/YYYY'),
                undefined,
                []
            ) ||
            moment(toDate, 'MM/DD/YYYY').isBetween(
                moment(element.from, 'MM/DD/YYYY'),
                moment(element.to, 'MM/DD/YYYY'),
                undefined,
                []
            )
        ) {
            throw new ErrorClass(
                'There is a leave which overlaps with the given period',
                400
            );
        }
    });
}

async function validationsInUpdateLeave(fromDate, toDate, leaveInfo) {
    if (
        !moment(fromDate, 'MM/DD/YYYY', true).isValid() ||
        !moment(toDate, 'MM/DD/YYYY', true).isValid()
    ) {
        throw new ErrorClass('Invalid date entered', 400);
    }

    if (new Date(fromDate) > new Date(toDate)) {
        throw new ErrorClass('from date should be less than to date', 400);
    }

    if (new Date(leaveInfo.to) < Date.now()) {
        throw new ErrorClass(
            'Cannot update leaves that are already completed',
            400
        );
    }
    if (
        new Date(leaveInfo.from) < Date.now() &&
        new Date(leaveInfo.to) > Date.now()
    ) {
        throw new ErrorClass(
            'Cannot update leaves that are currently running',
            400
        );
    }
    if (new Date(fromDate) < Date.now()) {
        throw new ErrorClass('Cannot update leave as backdated', 400);
    }
    if (
        weekends.includes(moment(fromDate, moment.ISO_8601).format('dddd')) ||
        weekends.includes(moment(toDate, moment.ISO_8601).format('dddd'))
    ) {
        throw new ErrorClass('Leave cannot be updated to weekends', 400);
    }

    const publicHolidays = await Holidays.findOne({
        year: [
            moment(fromDate, 'MM/DD/YYYY').format('YYYY'),
            moment(toDate, 'MM/DD/YYYY').format('YYYY'),
        ],
        holidaysList: {
            $elemMatch: {
                date: [
                    moment(fromDate, 'MM/DD/YYYY').format('MM/DD/YYYY'),
                    moment(toDate, 'MM/DD/YYYY').format('MM/DD/YYYY'),
                ],
            },
        },
    });
    if (publicHolidays) {
        throw new ErrorClass('Leave Cannot be updated to public holidays', 400);
    }
    if (
        !moment(toDate, 'MM/DD/YYYY').isSameOrBefore(moment().add(3, 'months'))
    ) {
        throw new ErrorClass(
            'Cannot update leave for date which is  greater than 3 months from curdate',
            400
        );
    }
}
async function sendingMail(teamOwners, teamOwnersIsUnique, req, leave) {
    if (teamOwners[0]) {
        const ownerMail = new Set();
        await Promise.all(
            teamOwners.map(async owner => {
                if (!teamOwnersIsUnique.includes(owner.ownerId)) {
                    teamOwnersIsUnique.push(owner.ownerId);
                    const ownerDeatails = await utilsFile.getEmpDetails(
                        owner.ownerId
                    );
                    if (ownerDeatails.mail) {
                        ownerMail.add(ownerDeatails.mail);
                    }
                }
            })
        );
        const mailMessage = `<h3 style="color:green;">${req.employee.empName}(${
            req.employee.empId
        }) has been declared leave from "${moment(leave.from).format(
            'LL'
        )}" to "${moment(leave.to).format('LL')}".</h3>`;

        if ([...ownerMail].length) {
            await sendMail(
                [...ownerMail],
                'Employee has declared leave from your team',
                mailMessage
            );
        }
    }
}

function isBackdatedLeave(leave, req) {
    if (moment(leave.from, moment.ISO_8601).isSameOrBefore(moment())) {
        if (
            moment(leave.from, moment.ISO_8601).isBetween(
                moment().subtract(1, 'months'),
                moment()
            )
        ) {
            leave.type = leaveType.UNPLANNED_LEAVE;
        } else {
            throw new ErrorClass(
                'Unplanned Leave cannot apply for date which lesser than 1 month from current date',
                400
            );
        }
    } else if (!Object.values(leaveType).includes(req.body.type)) {
        throw new ErrorClass('Incorrect leave type', 400);
    } else {
        leave.type = req.body.type;
    }
}

function isAlreadyLeaveTaken(alreadyleave, leave) {
    alreadyleave.forEach(element => {
        if (
            moment(leave.from, moment.ISO_8601).isBetween(
                moment(element.from, moment.ISO_8601),
                moment(element.to, moment.ISO_8601)
            ) ||
            moment(leave.to, moment.ISO_8601).isBetween(
                moment(element.from, moment.ISO_8601),
                moment(element.to, moment.ISO_8601)
            ) ||
            moment(element.from, moment.ISO_8601).isSame(leave.from) ||
            moment(element.to, moment.ISO_8601).isSame(leave.from) ||
            moment(element.from, moment.ISO_8601).isSame(leave.to) ||
            moment(element.to, moment.ISO_8601).isSame(leave.to) ||
            (moment(element.from, moment.ISO_8601).isAfter(leave.from) &&
                moment(element.to, moment.ISO_8601).isBefore(leave.to))
        ) {
            throw new ErrorClass(
                `Already leave declared within this period;leave from  '${moment(
                    element.from
                ).format('LL')}' to '${moment(element.to).format(
                    'LL'
                )}' has been declared.`,
                400
            );
        }
    });
}

function isLeaveOnWeekendOrPH(leave, publicHolidays) {
    if (
        weekends.includes(moment(leave.from, moment.ISO_8601).format('dddd')) ||
        weekends.includes(moment(leave.to, moment.ISO_8601).format('dddd'))
    ) {
        throw new ErrorClass('Leave can not declare at weekends', 400);
    } else if (publicHolidays) {
        throw new ErrorClass('Leave can not declare on public holidays', 400);
    }
}

function isDateValid(from, to, req) {
    if (
        !moment(from, 'MM/DD/YYYY', true).isValid() ||
        !moment(to, 'MM/DD/YYYY', true).isValid()
    ) {
        throw new ErrorClass(
            "Date should be valid in this form 'MM/DD/YYYY' format",
            400
        );
    } else if (new Date(req.body.from) > new Date(req.body.to)) {
        throw new ErrorClass('from date should be less than to date', 400);
    }
}
