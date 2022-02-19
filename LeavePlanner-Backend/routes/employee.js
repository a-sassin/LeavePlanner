const express = require('express');

const empRouter = express.Router();

const authenticateToken = require('../middlewares/authorization');

const empController = require('../controllers/emp');

empRouter.post('/login', empController.login);

empRouter.post('/refreshToken', authenticateToken, empController.refreshToken);

empRouter.get(
    '/pendingRequests',
    authenticateToken,
    empController.pendingRequests
);

empRouter.post('/logout', authenticateToken, empController.logout);

empRouter.post('/logoutall', authenticateToken, empController.logoutAll);

empRouter.get('/listEmployees', authenticateToken, empController.listEmployees);

empRouter.get('/getEmployees', authenticateToken, empController.getEmployees);

empRouter.post('/markAbsent', authenticateToken, empController.markAbsent);

empRouter.delete(
    '/unMarkAbsent',
    authenticateToken,
    empController.unMarkAbsent
);

empRouter.get(
    '/unplannedLeave',
    authenticateToken,
    empController.unplannedLeave
);

module.exports = empRouter;
