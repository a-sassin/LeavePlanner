require('./environments/env')();

const sonarqubeScanner = require('sonarqube-scanner');

sonarqubeScanner(
    {
        serverUrl: process.env.SONAR_SERVER_URL,
        options: {
            'sonar.login': process.env.SONAR_LOGIN,
            'sonar.password': process.env.SONAR_PASSWORD,
            'sonar.inclusions': '**/*.js,*.js',
            'sonar.exclusions': 'node_modules/**,**/*.json',
        },
    },
    () => {
        console.info('Sonar scanner is running');
    }
);
