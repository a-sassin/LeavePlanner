const express = require('express');

const leaveRouter = express.Router();

const authenticateToken = require('../middlewares/authorization');

const leaveController = require('../controllers/leave');

leaveRouter.patch('/leave', authenticateToken, leaveController.updateLeave);

leaveRouter.post('/leave', authenticateToken, leaveController.declareLeave);

leaveRouter.delete('/leave', authenticateToken, leaveController.deleteLeave);

leaveRouter.get('/leave', authenticateToken, leaveController.getLeaves);

module.exports = leaveRouter;
