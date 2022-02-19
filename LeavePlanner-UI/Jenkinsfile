pipeline {
    agent any
     
    stages {
        stage('Building Docker Image') {
             
            steps {
               sh 'docker image build --tag leaveplanner-ui:latest .'
            }
        }
        stage('Delete Previous running Containers') {
             
            steps {
               sh 'docker container rm -f leaveplanner-ui-container | echo true'
               sh 'docker system prune -f'
            }
        }
        stage('Running Docker Build on Port 5000') {
             
            steps {
                sh 'docker container run --name leaveplanner-ui-container -d -p 5000:80 leaveplanner-ui:latest'
            }
        }
    }
}
