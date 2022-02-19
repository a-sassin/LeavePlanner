const leaveType = Object.freeze({
    FNE_LEAVE: 'Family and Emergency Leave',
    PATERNITY_LEAVE: 'Paternity Leave',
    MATERNITY_LEAVE: 'Maternity Leave',
    PRIVILEGE_LEAVE: 'Privilege Leave',
    FLOATING_HOLIDAY: 'Floating Holiday',
    UNPAID_LEAVE: 'Unpaid Leave',
    ADOPTION_LEAVE: 'Adoption Leave',
    UNPLANNED_LEAVE: 'Unplanned Leave',
    ABSENT: 'Absent',
});

const ADMIN = ['GS-LFA01', 'GS-ATM-01', 'GSC-30665'];

const weekends = ['Sunday', 'Saturday'];

const STATUS = Object.freeze({
    ACCEPTED: 'Accepted',
    DECLINED: 'Declined',
    PENDING: 'Pending',
});

module.exports = {
    leaveType,
    ADMIN,
    weekends,
    STATUS,
};
