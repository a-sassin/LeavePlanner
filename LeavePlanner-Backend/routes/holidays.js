const express = require('express');

const adminRouter = express.Router();
const authenticateToken = require('../middlewares/authorization');
const adminController = require('../controllers/holidays');

adminRouter.put('/holidays', authenticateToken, adminController.addHolidays);

adminRouter.get('/holidays', authenticateToken, adminController.listHolidays);

module.exports = adminRouter;
