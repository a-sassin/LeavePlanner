const express = require('express');

const teamRouter = express.Router();
const authenticateToken = require('../middlewares/authorization');

const teamController = require('../controllers/team');

teamRouter.post('/create', authenticateToken, teamController.createTeam);

teamRouter.get('/list', authenticateToken, teamController.getTeamlist);

teamRouter.patch('/updateteam', authenticateToken, teamController.updateTeam);

teamRouter.put(
    '/requestOwnership',
    authenticateToken,
    teamController.requestOwnership
);

teamRouter.delete('/:teamId', authenticateToken, teamController.deleteTeam);

teamRouter.patch(
    '/transferOwnership',
    authenticateToken,
    teamController.transferOwnership
);

module.exports = teamRouter;
