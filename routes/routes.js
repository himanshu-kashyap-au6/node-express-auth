const Router = require('express').Router();
const common = require('./commonRoutes/commonRoutes');
const { handleAuthError } = require('../Middleware/custom');

Router.use('/', common);
Router.use([handleAuthError]);

module.exports = Router;
