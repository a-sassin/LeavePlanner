const mongoose = require('mongoose');
const TeamModel = require('../models/team');
const EmpModel = require('../models/employee');
const Ownership = require('../models/ownership');
const ErrorClass = require('../services/errorClass');
const utilsFile = require('../services/utils');
const { sendMail } = require('../services/mail');
const { STATUS } = require('../constant');

let membersToAddMail = [];
let membersToDeleteMail = [];

module.exports.createTeam = async (req, res, next) => {
    try {
        const isInvalidRequest = utilsFile.validateRequest(
            req.body,
            ['name', 'members'],
            false
        );
        if (isInvalidRequest) {
            throw new ErrorClass('Invalid parameters', 400);
        }
        const teamMemAddInTeam = req.body.members;
        const Team = new TeamModel();
        Team.name = req.body.name;
        Team.owner = req.employee.empName;
        Team.ownerId = req.employee.empId;
        const checkdupid = [];
        Team.teamId = new mongoose.Types.ObjectId();
        const ownerData = await TeamModel.find({ ownerId: req.employee.empId });
        ownerData.forEach(element => {
            if (element.name.toLowerCase() === req.body.name.toLowerCase()) {
                throw new ErrorClass(
                    'A team already exists with the name entered; please enter a different team name.',
                    400
                );
            }
        });
        const alreadyInAddMemberList = new Set();

        teamMemAddInTeam.forEach(element => {
            if (checkdupid.includes(element.empId))
                alreadyInAddMemberList.add(element);
            else checkdupid.push(element.empId);
        });

        if (alreadyInAddMemberList.size === 1) {
            throw new ErrorClass(
                `A Team member with employee name ${
                    [...alreadyInAddMemberList][0].name
                }(${
                    [...alreadyInAddMemberList][0].empId
                }) already exists in member list.`,
                400
            );
        } else if (alreadyInAddMemberList.size > 1)
            throw new ErrorClass(
                'There are multiple duplicate team members in list.',
                400
            );

        const teamOwner = await EmpModel.findOne({
            empId: req.employee.empId,
        });
        const teamOwnerDeatails = {
            name: teamOwner.empName,
            empId: teamOwner.empId,
        };
        if (!checkdupid.includes(req.employee.empId)) {
            teamMemAddInTeam.push(teamOwnerDeatails);
        }

        Team.members = teamMemAddInTeam;
        const membersMail = [];
        if (teamMemAddInTeam.length > 0) {
            await Promise.all(
                teamMemAddInTeam.map(async member => {
                    const memberDatails = await utilsFile.getEmpDetails(
                        member.empId
                    );
                    if (memberDatails.mail) {
                        membersMail.push(memberDatails.mail);
                    }
                })
            );
        }

        await Team.save();
        res.send({
            status: 200,
            message: 'The team has been successfully created.',
            team: Team,
        }).status(200);

        if (membersMail.length) {
            const mailMessage = `<h3 style="color:green;">${req.employee.empName}(${req.employee.empId}) has created the team name - "${req.body.name}" and you are the member of the team</h3>`;
            await sendMail(
                membersMail,
                `Created a team name - "${req.body.name}"`,
                mailMessage
            );
        }
    } catch (err) {
        next(err);
    }
};

module.exports.getTeamlist = async (req, res, next) => {
    try {
        let teamData = '';
        if (req.query.search) {
            teamData = await TeamModel.find({
                ownerId: req.employee.empId,
                name: { $regex: req.query.search, $options: 'i' },
            }).select('name owner teamId -_id');
        } else {
            teamData = await TeamModel.find({
                ownerId: req.employee.empId,
            }).select('name owner teamId -_id');
        }

        if (!teamData[0]) {
            res.send({ status: 200, teams: [], message: 'No teams exits' });
        } else {
            res.send({ status: 200, teams: teamData });
        }
    } catch (err) {
        next(err);
    }
};

function validateMembers(reqArray, teamInfo) {
    reqArray.forEach(everyMember => {
        const isEmployeeExists = teamInfo.members.find(
            eachMember =>
                eachMember.empId === everyMember.empId &&
                eachMember.name === everyMember.name
        );
        if (!isEmployeeExists) {
            throw new ErrorClass(
                'One or more employees in the given data are not members of the team',
                400
            );
        }
    });
}

module.exports.updateTeam = async (req, res, next) => {
    try {
        const isInvalidRequest = utilsFile.validateRequest(
            req.body,
            ['teamName', 'membersToAdd', 'membersToDelete'],
            true
        );
        if (isInvalidRequest) {
            throw new ErrorClass('Invalid parameters', 400);
        }
        const isInvalidParams = utilsFile.validateRequest(
            req.query,
            ['teamId'],
            true
        );
        if (isInvalidParams) {
            throw new ErrorClass('Invalid parameters', 400);
        }
        const teamInfo = await TeamModel.findOne({ teamId: req.query.teamId });

        if (!teamInfo) {
            throw new ErrorClass(
                'No team Information present with the given teamId',
                400
            );
        }

        if (teamInfo.ownerId !== req.employee.empId) {
            throw new ErrorClass(
                'You are not the authorized to update the team',
                400
            );
        }

        const update = {};
        if (req.body.teamName) {
            const teamExists = await TeamModel.findOne({
                teamId: { $nin: req.query.teamId },
                name: req.body.teamName,
                ownerId: teamInfo.ownerId,
            });
            if (teamExists) {
                throw new ErrorClass(
                    'A team already exists with the name entered; please enter a different team name.',
                    400
                );
            }
            update.$set = { name: req.body.teamName };
        }

        await addMembers(req, teamInfo, update);

        await deleteMembers(req, teamInfo);

        const updatedTeam = await TeamModel.findOne({
            teamId: req.query.teamId,
        }).select(['name', 'owner', 'ownerId', 'members', 'teamId', '-_id']);
        res.send({
            status: 200,
            message: 'Team successfully updated',
            team: updatedTeam,
        }).status(200);

        try {
            await sendMails(req, teamInfo);
        } catch (err) {
            console.log(err);
        }
    } catch (err) {
        next(err);
    }
};

module.exports.requestOwnership = async (req, res, next) => {
    try {
        const isInvalidRequest = utilsFile.validateRequest(
            req.body,
            ['newOwnerId'],
            false
        );
        if (isInvalidRequest) {
            throw new ErrorClass('Invalid parameters', 400);
        }
        const isInvalidParams = utilsFile.validateRequest(
            req.query,
            ['teamId'],
            true
        );
        if (isInvalidParams) {
            throw new ErrorClass('Invalid parameters', 400);
        }
        const teamInfo = await TeamModel.findOne({ teamId: req.query.teamId });

        if (!teamInfo) {
            throw new ErrorClass(
                'No team Information present with the given teamId',
                400
            );
        }
        if (req.employee.empId !== teamInfo.ownerId) {
            throw new ErrorClass(
                'You are not authorized for requesting to change the owner',
                400
            );
        }
        const teamExists = await TeamModel.findOne({
            teamId: { $nin: req.query.teamId },
            name: teamInfo.name,
            ownerId: req.body.newOwnerId,
        });
        if (teamExists) {
            throw new ErrorClass(
                'The requested owner has already a team with the same team name; please change your team name.',
                400
            );
        }
        const update = {};
        if (req.body.newOwnerId) {
            update.$set = { teamName: teamInfo.name };
            update.$set.currentOwnerId = teamInfo.ownerId;
            update.$set.currentOwner = teamInfo.owner;
            update.$set.newOwnerId = req.body.newOwnerId;
            update.$set.status = STATUS.PENDING;
        }

        await Ownership.updateOne(
            {
                teamId: teamInfo.teamId,
            },
            update,
            {
                upsert: true,
            }
        );
        res.send({
            status: 201,
            message:
                'Request for transferring of ownership has been raised successfully',
        }).status(201);

        const newOwner = await utilsFile.getEmpDetails(req.body.newOwnerId);
        if (newOwner.mail) {
            const mailMessage = `<h3 style="color:green;">${teamInfo.owner} wants to make you the owner of ${teamInfo.name} team</h3> <p><a href="${process.env.REDIRECT_URL}">Click Here</a> to accept or decline the proposal through the Leave Planner app.</p>`;

            await sendMail(
                `${newOwner.mail}`,
                'Regarding new team ownership',
                mailMessage
            );
        }
    } catch (err) {
        next(err);
    }
};

module.exports.deleteTeam = async (req, res, next) => {
    try {
        const isInvalidRequest = utilsFile.validateRequest(
            req.params,
            ['teamId'],
            false
        );
        if (isInvalidRequest) {
            throw new ErrorClass('Invalid parameters', 400);
        }
        const team = await TeamModel.findOne({ teamId: req.params.teamId });
        if (!team) {
            throw new ErrorClass('No team found with given teamId', 400);
        }
        if (team.ownerId !== req.employee.empId) {
            throw new ErrorClass(
                'You are not authorized to delete this team',
                400
            );
        }
        await TeamModel.deleteOne({ teamId: req.params.teamId });
        res.status(200).send({
            status: 200,
            message: 'Team successfully deleted',
        });
        try {
            const teamMembers = team.members;
            if (teamMembers[0]) {
                const membersMail = [];

                await Promise.all(
                    teamMembers.map(async member => {
                        const membersData = await utilsFile.getEmpDetails(
                            member.empId
                        );
                        membersMail.push(membersData.mail);
                    })
                );
                if (membersMail.length) {
                    const mailMessage = `<h3 style="color:green;">${req.employee.empName}(${req.employee.empId}) has deleted team "${team.name}"</h3>`;
                    await sendMail(
                        membersMail,
                        'One of your team got removed',
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

module.exports.transferOwnership = async (req, res, next) => {
    try {
        const isInvalidRequest = utilsFile.validateRequest(
            req.body,
            ['decision', 'teamId'],
            false
        );
        if (isInvalidRequest) {
            throw new ErrorClass('Invalid parameters', 400);
        }
        const ownershipRequest = await Ownership.findOne({
            teamId: req.body.teamId,
            newOwnerId: req.employee.empId,
        });
        if (!ownershipRequest) {
            throw new ErrorClass('No request found for the ownership', 400);
        }
        if (!Object.values(STATUS).includes(req.body.decision)) {
            throw new ErrorClass('Not a valid decision', 400);
        }
        if (
            [STATUS.ACCEPTED, STATUS.DECLINED].includes(ownershipRequest.status)
        ) {
            throw new ErrorClass('Change of decision is prohibited', 403);
        }
        const subject = 'Status updated for your transfer ownership request';
        const currentOwnerData = await utilsFile.getEmpDetails(
            ownershipRequest.currentOwnerId
        );
        if (req.body.decision === STATUS.DECLINED) {
            res.status(201).send({
                status: 201,
                message: 'You declined to become the owner',
            });
            try {
                await sendMail(
                    currentOwnerData.mail,
                    subject,
                    `<h3 style="color:green;">${req.employee.empName} has declined to become the owner for the team ${ownershipRequest.teamName}</h3>`
                );
            } catch (er) {
                console.log(er.message);
            }
        } else if (req.body.decision === STATUS.ACCEPTED) {
            const team = await TeamModel.findOne({ teamId: req.body.teamId });
            if (!team) {
                throw new ErrorClass('No team found with given teamId', 400);
            }

            const isNewOwnerExists = team.members.find(
                eachMember => eachMember.empId === req.employee.empId
            );
            const newOwner = {
                name: req.employee.empName,
                empId: req.employee.empId,
            };
            if (!isNewOwnerExists) {
                await TeamModel.updateOne(
                    { teamId: req.body.teamId },
                    { $push: { members: newOwner } }
                );
            }
            await TeamModel.updateOne(
                { teamId: req.body.teamId },
                {
                    owner: req.employee.empName,
                    ownerId: req.employee.empId,
                    name: ownershipRequest.teamName,
                }
            );
            res.status(200).send({
                status: 200,
                message: `You are the new owner for the team ${team.name}`,
            });
            try {
                await sendMail(
                    currentOwnerData.mail,
                    subject,
                    `<h3 style="color:green;">${req.employee.empName} has accepted to become the owner for the team ${ownershipRequest.teamName}</h3>`
                );
            } catch (er) {
                console.log(er.message);
            }
        }
        await Ownership.updateOne(
            { teamId: req.body.teamId },
            {
                status: req.body.decision,
            }
        );
    } catch (err) {
        next(err);
    }
};

async function sendMails(req, teamInfo) {
    if (teamInfo.name !== req.body.teamName) {
        const ownerMailId = await utilsFile.getEmpDetails(req.employee.empId);
        if (ownerMailId.mail) {
            const mailMessage = `<h1 style="color:green;">You changed the name of the team from ${teamInfo.name} to ${req.body.teamName}</h1>`;

            await sendMail(
                `${ownerMailId.mail}`,
                'Regarding change of your team name',
                mailMessage
            );
        }
    }

    if (req.body.membersToAdd) {
        if (membersToAddMail.length) {
            const mailMessage = `<h3 style="color:green;">You have been added to a new team ${teamInfo.name} by ${req.employee.empName}</h3>`;
            await sendMail(
                membersToAddMail,
                'Regarding joining a new team',
                mailMessage
            );
        }
    }

    if (req.body.membersToDelete) {
        if (membersToDeleteMail.length) {
            const mailMessage = `<h3 style="color:red;">You have been removed from the team ${teamInfo.name} by ${req.employee.empName}</h3>`;
            await sendMail(
                membersToDeleteMail,
                'Regarding leaving a team',
                mailMessage
            );
        }
    }
}

async function deleteMembers(req, teamInfo) {
    if (req.body.membersToDelete) {
        membersToDeleteMail = [];

        await Promise.all(
            req.body.membersToDelete.map(async member => {
                const membersData = await utilsFile.getEmpDetails(member.empId);
                membersToDeleteMail.push(membersData.mail);
            })
        );

        validateMembers(req.body.membersToDelete, teamInfo);
        const ownerData = {
            name: teamInfo.owner,
            empId: teamInfo.ownerId,
        };
        if (
            req.body.membersToDelete.some(
                memberData =>
                    memberData.name === ownerData.name &&
                    memberData.empId === ownerData.empId
            ) &&
            teamInfo.members.length !== req.body.membersToDelete.length
        ) {
            throw new ErrorClass(
                'Owner cannot be deleted now, Either transfer ownership or delete the team',
                400
            );
        }
        await TeamModel.updateOne(
            {
                teamId: teamInfo.teamId,
            },
            {
                $pull: {
                    members: { $in: req.body.membersToDelete },
                },
            }
        );
    }
    const newTeamInfo = await TeamModel.findOne({
        teamId: req.query.teamId,
    });
    if (newTeamInfo.members.length === 0) {
        await TeamModel.deleteOne({ teamId: req.query.teamId });
    }
}

async function addMembers(req, teamInfo, update) {
    if (req.body.membersToAdd) {
        membersToAddMail = [];
        await Promise.all(
            req.body.membersToAdd.map(async member => {
                const membersData = await utilsFile.getEmpDetails(member.empId);
                membersToAddMail.push(membersData.mail);
            })
        );

        teamInfo.members.forEach(element => {
            req.body.membersToAdd.forEach(elem => {
                if (element.empId === elem.empId) {
                    throw new ErrorClass(
                        `Employee ${element.empId} already exists`,
                        400
                    );
                }
            });
        });
        update.$addToSet = { members: req.body.membersToAdd };
    }

    await TeamModel.updateOne(
        {
            teamId: teamInfo.teamId,
        },
        update
    );
}
