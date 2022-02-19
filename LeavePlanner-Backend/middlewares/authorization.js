const jwt = require('jsonwebtoken');
const empData = require('../models/employee');
const ErrorClass = require('../services/errorClass');

async function authtoken(req, res, next) {
    try {
        const authheader = req.headers.authorization;
        if (!authheader) {
            throw new ErrorClass('Not Authenticated', 401);
        }
        const token = authheader && authheader.split(' ')[1];
        if (!token) {
            throw new ErrorClass('Not Authenticated', 401);
        }

        jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET,
            async (err, decoded) => {
                try {
                    if (err) {
                        if (err.message === 'jwt expired') {
                            throw new ErrorClass(
                                'Token expired.Please login again'
                            );
                        }
                        throw new ErrorClass(err.message);
                    }

                    const employee = await empData.findOne({
                        empName: decoded.empName,
                        tokens: { $in: token },
                    });

                    if (!employee) {
                        throw new ErrorClass(
                            'Employee successfully logout or Employee details not found'
                        );
                    }
                    req.employee = employee;
                    req.token = token;
                    if (req.originalUrl.includes('refreshToken')) {
                        req.decoded = decoded;
                    }
                    next();
                } catch (error) {
                    next(error);
                }
            }
        );
    } catch (error) {
        next(error);
    }
}
module.exports = authtoken;
