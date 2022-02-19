const ActiveDirectory = require('activedirectory');

const config = {
    url: process.env.AD_URL,
    baseDN: process.env.BASE_DN,
    username: process.env.USER_NAME,
    password: process.env.PASSWORD,
    attributes: {
        user: [
            'sAMAccountName',
            'cn',
            'name',
            'displayName',
            'mail',
            'title',
            'manager',
            'gs-Project',
            'department',
            'ou',
            'directReports',
        ],
    },
};
const ad = new ActiveDirectory(config);
module.exports.ad = ad;

module.exports.validateRequest = (req, paramsList, flg) => {
    let isInvalidRequest = false;
    const params = Object.keys(req);
    if (flg) {
        const isValidOperation = params.every(param =>
            paramsList.includes(param)
        );

        if (!isValidOperation) {
            isInvalidRequest = true;
        }
    } else {
        const isValidOperation1 = params.every(key => paramsList.includes(key));
        const isValidOperation2 = paramsList.every(key => params.includes(key));

        if (!isValidOperation1 || !isValidOperation2) {
            isInvalidRequest = true;
        }
    }
    const paramsValues = Object.values(req);
    paramsValues.forEach(element => {
        if ([null, undefined, 'null', 'undefined', ''].includes(element)) {
            isInvalidRequest = true;
        }
    });
    return isInvalidRequest;
};

module.exports.getEmpDetails = filter => {
    return new Promise((resolve, reject) =>
        ad.findUser(filter, (err, user) => {
            if (err) {
                reject(new Error(`${JSON.stringify(err.message)}`));
            }
            if (!user) {
                reject(new Error('User not found'));
            }
            resolve(user);
        })
    );
};
