const environment = process.env.ENVIRONMENT;
let envPath = './environments/.env.dev';
if (environment === 'production') {
    envPath = './environments/.env.prod';
}
const setEnvVariables = () =>
    require('dotenv').config({
        path: envPath,
    });

module.exports = setEnvVariables;
