const jwt = require('jsonwebtoken');
const moment = require('moment');
const CryptoJS = require('crypto-js');
const mongoose = require('mongoose');
const utilsFile = require('../services/utils');
const ErrorClass = require('../services/errorClass');
const Emp = require('../models/employee');
const Team = require('../models/team');
const Leave = require('../models/leave');
const Ownership = require('../models/ownership');
const { ADMIN, leaveType, weekends, STATUS } = require('../constant');
const Holidays = require('../models/publicholidays');
const { sendMail } = require('../services/mail');

module.exports.login = (req, res, next) => {
    try {
        const isInvalidRequest = utilsFile.validateRequest(
            req.body,
            ['username', 'password', 'rememberme'],
            false
        );
        if (isInvalidRequest) {
            throw new ErrorClass('Invalid parameters', 400);
        }
        const { username, rememberme } = req.body;
        if (typeof rememberme !== 'boolean') {
            throw new ErrorClass(
                'Remember me field can either be true or false',
                400
            );
        }

        const password = CryptoJS.AES.decrypt(
            req.body.password,
            process.env.encryptSecretKey
        ).toString(CryptoJS.enc.Utf8);
        utilsFile.ad.authenticate(
            username.concat('@gslab.com'),
            password,
            async (err, auth) => {
                try {
                    if (err) {
                        throw new Error('Authentication failed');
                    }
                    if (auth) {
                        const empInfo = await getEmpLoginInfo(
                            username,
                            password,
                            req
                        );
                        res.status(200).json(empInfo);
                    }
                } catch (er) {
                    res.status(401).send({
                        status: 401,
                        message: er.message,
                    });
                }
            }
        );
    } catch (error) {
        next(error);
    }
};

module.exports.refreshToken = async (req, res, next) => {
    try {
        const user = {
            empName: req.decoded.empName,
            empPassword: req.decoded.empPassword,
        };
        await Emp.updateOne(
            { empName: user.empName },
            { $pull: { tokens: { $in: req.token } } }
        );

        const newtoken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: '50m',
        });
        await Emp.updateOne(
            { empName: user.empName },
            { $push: { tokens: newtoken } }
        );
        res.status(200).send({
            status: 200,
            newtoken,
        });
    } catch (err) {
        next(err);
    }
};

module.exports.logout = async (req, res, next) => {
    try {
        await Emp.updateOne(
            { empId: req.employee.empId },
            { $pull: { tokens: req.token } }
        );
        res.status(200).send({
            status: 200,
            message: 'LoggedOut successfully',
        });
    } catch (err) {
        next(err);
    }
};

module.exports.logoutAll = async (req, res, next) => {
    try {
        await Emp.updateOne(
            { empId: req.employee.empId },
            { $set: { tokens: [] } }
        );
        res.send({ message: 'Logged out from all devices' }).status(200);
    } catch (err) {
        next(err);
    }
};

module.exports.listEmployees = (req, res, next) => {
    try {
        const isInvalidRequest = utilsFile.validateRequest(
            req.query,
            ['search'],
            true
        );
        if (isInvalidRequest) {
            throw new ErrorClass('Invalid parameters', 400);
        }
        let query = 'name=*';
        if (req.query.search) query = `name=${req.query.search.trim()}*`;

        utilsFile.ad.findUsers(query, (err, users) => {
            if (err) {
                throw new ErrorClass(`${JSON.stringify(err.message)}`, 400);
            }
            if (!users || users.length === 0)
                res.send({
                    result: 'There is no user',
                    staus: 200,
                }).status(200);
            else {
                const usersData = users.map(user => {
                    if (!user.mail) {
                        user.mail = `${user.sAMAccountName}@gslab.com`;
                    }
                    return {
                        empId: user.sAMAccountName,
                        name: user.name,
                        email: user.mail,
                    };
                });
                const empList = usersData.slice(0, 100);
                res.send({
                    status: 200,
                    data: empList,
                }).status(200);
            }
        });
    } catch (err) {
        next(err);
    }
};

async function getEmpLoginInfo(username, password, req) {
    const user = await utilsFile.getEmpDetails(username);
    const loggedinUser = {
        empName: user.cn,
        empPassword: password,
    };
    const tokenexpTime = req.body.rememberme ? '7d' : '50m';
    const token = jwt.sign(loggedinUser, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: tokenexpTime,
    });

    const fetchedUser = await Emp.findOne({
        empId: user.sAMAccountName,
    });
    const isAdmin = ADMIN.includes(user.sAMAccountName.toUpperCase());
    if (!fetchedUser) {
        const newUser = new Emp();
        newUser.empId = user.sAMAccountName;
        newUser.empName = loggedinUser.empName;
        newUser.tokens = [token];
        newUser.isAdmin = true;
        newUser.save();
    } else {
        await Emp.updateOne(
            { empName: loggedinUser.empName },
            { $push: { tokens: token } }
        );
    }

    let empManager = '';
    if (user.manager) {
        empManager = user.manager.split(',')[0].split('=')[1];
    }

    const pendingRequests = await Ownership.find({
        newOwnerId: user.sAMAccountName,
        status: STATUS.PENDING,
    }).select('-_id -__v -createdAt -newOwnerId');

    return {
        empID: user.sAMAccountName,
        name: user.cn,
        title: user.title,
        manager: empManager,
        practice: user.ou,
        token,
        pendingRequests,
        isAdmin,
    };
}

module.exports.pendingRequests = async (req, res, next) => {
    try {
        const pendingRequests = await Ownership.find({
            newOwnerId: req.employee.empId,
            status: STATUS.PENDING,
        }).select('-_id -__v -createdAt -newOwnerId');
        res.status(200).send({ pendingRequests });
    } catch (err) {
        next(err);
    }
};

function fetchLeaves(eachLeave) {
    const dates = [];
    const fromDate = moment(eachLeave.from);
    const toDate = moment(eachLeave.to);
    for (
        let m = moment(fromDate);
        m.diff(toDate, 'days') <= 0;
        m.add(1, 'days')
    ) {
        dates.push(m.format('YYYY-MM-DD'));
    }
    return {
        reason: eachLeave.reason,
        type: eachLeave.type,
        leave_id: eachLeave.leave_id,
        dates,
    };
}

module.exports.getEmployees = async (req, res, next) => {
    try {
        const isInvalidRequest = utilsFile.validateRequest(
            req.query,
            ['teamId', 'page', 'limit', 'month', 'year'],
            true
        );

        if (isInvalidRequest) {
            throw new ErrorClass('Invalid parameters', 400);
        }
        const team = await Team.findOne({ teamId: req.query.teamId });
        if (!team) {
            throw new ErrorClass('No team found with given teamId', 400);
        }
        const members = [];
        const teamMembers = team.members;
        const membersData = await getMembersData(
            teamMembers,
            req,
            members,
            res
        );
        res.status(200).send({
            data: membersData,
        });
    } catch (error) {
        next(error);
    }
};

module.exports.markAbsent = async (req, res, next) => {
    try {
        const isInvalidRequest = utilsFile.validateRequest(
            req.body,
            ['date', 'empId', 'empName', 'teamId'],
            false
        );
        if (isInvalidRequest) {
            throw new ErrorClass('Invalid parameters', 400);
        }
        const team = await Team.findOne({ teamId: req.body.teamId });

        if (!team) {
            throw new ErrorClass('No team found with given teamId', 400);
        }
        if (req.employee.empId !== team.ownerId) {
            throw new ErrorClass('You are not authorized to mark absent', 403);
        }
        const checkLeave = await Leave.findOne({
            from: req.body.date,
            reason: leaveType.ABSENT,
            empId: req.body.empId,
            markedAbsentBy: req.employee.empId,
        });
        if (checkLeave) {
            throw new ErrorClass('Already marked absent', 400);
        }
        if (new Date(req.body.date).getTime() > new Date().getTime()) {
            throw new ErrorClass('Cannot mark absent for future days', 400);
        }
        const publicHolidays = await Holidays.find({
            year: [moment(req.body.date, 'MM/DD/YYYY').format('YYYY')],
        });
        publicHolidays.forEach(element => {
            element.holidaysList.forEach(everydate => {
                if (
                    new Date(req.body.date).getTime() ===
                    new Date(everydate.date).getTime()
                )
                    throw new ErrorClass(
                        'Cannot mark absent for public holidays',
                        400
                    );
            });
        });
        if (
            weekends.includes(
                moment(req.body.date, 'MM/DD/YYYY').format('dddd')
            )
        ) {
            throw new ErrorClass('Cannot mark absent for weekends', 400);
        }
        const appliedLeaves = await Leave.find({
            empId: req.body.empId,
            type: { $ne: 'Absent' },
        });
        appliedLeaves.forEach(eachLeave => {
            if (
                eachLeave.from <= new Date(req.body.date) &&
                eachLeave.to >= new Date(req.body.date)
            ) {
                throw new ErrorClass(
                    'Employee already declared leave for the given date',
                    400
                );
            }
        });
        const teamMembers = team.members;
        let flag = false;
        flag = teamMembers.find(
            eachMember => eachMember.empId === req.body.empId
        );
        if (!flag) {
            throw new ErrorClass(
                'No employee found with given empId in the team',
                400
            );
        }
        const leave = new Leave();
        leave.from = moment(new Date(req.body.date), 'MM-DD-YYYY');
        leave.to = moment(new Date(req.body.date), 'MM-DD-YYYY');
        leave.reason = leaveType.ABSENT;
        leave.type = leaveType.ABSENT;
        leave.empId = req.body.empId;
        leave.empName = req.body.empName;
        leave.markedAbsentBy = req.employee.empId;
        leave.leave_id = mongoose.Types.ObjectId();
        await leave.save();
        const empDetails = await utilsFile.getEmpDetails(req.body.empId);

        const mailMessage = `<h3 style="color:green;">You have been marked absent by ${
            req.employee.empName
        }"(${req.employee.empId})" for the date "${moment(leave.from).format(
            'LL'
        )}"</h3>`;

        res.send({
            status: 201,
            message: 'Absent marked successfully',
        });
        try {
            await sendMail(
                empDetails.mail,
                'You are marked absent',
                mailMessage
            );
        } catch (er) {
            console.log(er.message);
        }
    } catch (err) {
        next(err);
    }
};

module.exports.unMarkAbsent = async (req, res, next) => {
    try {
        const isInvalidRequest = utilsFile.validateRequest(
            req.query,
            ['leave_id'],
            false
        );
        if (isInvalidRequest) {
            throw new ErrorClass('Invalid parameters', 400);
        }
        const fetchLeave = await Leave.findOne({
            leave_id: req.query.leave_id,
            markedAbsentBy: req.employee.empId,
        });
        if (!fetchLeave) {
            throw new ErrorClass('Cannot unmark absent', 400);
        }
        await Leave.deleteOne({
            leave_id: req.query.leave_id,
            markedAbsentBy: req.employee.empId,
        });

        const empDetails = await utilsFile.getEmpDetails(fetchLeave.empId);

        const mailMessage = `<h3 style="color:green;">You have been unmarked absent by ${
            req.employee.empName
        }"(${req.employee.empId})" for the date "${moment(
            fetchLeave.from
        ).format('LL')}"</h3>`;

        res.status(200).send({
            status: 200,
            message: 'Unmarked absent successfully',
        });
        try {
            await sendMail(
                empDetails.mail,
                'You are unmarked absent',
                mailMessage
            );
        } catch (er) {
            console.log(er.message);
        }
    } catch (err) {
        next(err);
    }
};

module.exports.unplannedLeave = async (req, res, next) => {
    try {
        const isInvalidRequest = utilsFile.validateRequest(
            req.query,
            [''],
            true
        );
        if (isInvalidRequest) {
            throw new ErrorClass('Invalid parameters', 400);
        }
        const teams = await Team.find({ ownerId: req.employee.empId });
        let teamMembers = [];
        if (teams[0]) {
            teams.forEach(team => {
                team.members.forEach(empData => {
                    teamMembers.push(empData.empId);
                });
            });
        } else {
            throw new ErrorClass('No team exits', 400);
        }
        teamMembers = [...new Set(teamMembers)];
        const leaveData = await Leave.aggregate([
            {
                $match: {
                    type: 'Unplanned Leave',
                    empId: { $in: teamMembers },
                },
            },
            {
                $group: {
                    _id: {
                        empId: '$empId',
                        empName: '$empName',
                    },
                    count: { $sum: 1 },
                },
            },
            { $sort: { count: -1 } },
            {
                $project: {
                    _id: false,
                    empId: '$_id.empId',
                    name: '$_id.empName',
                    count: true,
                },
            },
        ]);

        let message = '';
        if (!leaveData[0]) message = 'No employee with unplanned leave';
        res.send({
            status: 200,
            leaves: leaveData,
            message,
        });
    } catch (err) {
        next(err);
    }
};
async function getMembersData(teamMembers, req, members, res) {
    await Promise.all(
        teamMembers.map(async tMember => {
            const memberLeaves = await Leave.find({
                empId: tMember.empId,
            }).select('from to reason type leave_id -_id');
            const leaves = [];
            if (req.query.month && req.query.year) {
                memberLeaves.forEach(everyLeave => {
                    const fromYear = moment(everyLeave.from).format('YYYY');
                    const toYear = moment(everyLeave.to).format('YYYY');
                    const fromMonth = moment(everyLeave.from).format('MM');
                    const toMonth = moment(everyLeave.to).format('MM');
                    if (fromYear !== toYear) {
                        if (
                            (req.query.month >= fromMonth &&
                                req.query.year === fromYear) ||
                            (req.query.month <= toMonth &&
                                req.query.year === toYear)
                        ) {
                            leaves.push(fetchLeaves(everyLeave));
                        }
                    } else if (
                        req.query.month >= fromMonth &&
                        req.query.month <= toMonth &&
                        req.query.year === fromYear
                    ) {
                        leaves.push(fetchLeaves(everyLeave));
                    }
                });
            } else {
                memberLeaves.forEach(everyLeave => {
                    leaves.push(fetchLeaves(everyLeave));
                });
            }
            const member = {
                name: tMember.name,
                empId: tMember.empId,
                leaves,
            };
            members.push(member);
        })
    );
    if (req.query.limit) {
        const page = req.query.page || 1;
        const { limit } = req.query;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const membersData = members.slice(startIndex, endIndex);
        res.status(200).send({ data: membersData });
    }
    return members;
}
