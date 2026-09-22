pipeline {
  agent any

  tools {
    nodejs 'NodeJS 22'
  }

  environment {
    NODE_ENV = 'test'
    JWT_SECRET = 'ci-dummy-jwt-secret-not-used-for-real-auth'
    GOOGLE_MAPS_API_KEY = 'ci-dummy-google-maps-key'
    DATABASE_URL = 'postgresql://dummy:dummy@localhost:5432/dummy'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install dependencies') {
      steps {
        script {
          if (isUnix()) {
            sh 'npm ci'
          } else {
            bat 'npm ci'
          }
        }
      }
    }

    stage('Build') {
      steps {
        script {
          if (isUnix()) {
            sh 'npm run build'
          } else {
            bat 'npm run build'
          }
        }
      }
    }

    stage('Run tests with coverage') {
      steps {
        script {
          if (isUnix()) {
            sh 'npm run test:coverage -- --run'
          } else {
            bat 'npm run test:coverage -- --run'
          }
        }
      }
    }

    stage('SonarQube analysis') {
      steps {
        withSonarQubeEnv('AthletiaBackend') {
          script {
            if (isUnix()) {
              sh '''
                sonar-scanner \
                  -Dsonar.projectKey=AthletiaBackend \
                  -Dsonar.projectName=AthletiaBackend \
                  -Dsonar.sources=src \
                  -Dsonar.tests=src/__tests__ \
                  -Dsonar.exclusions=node_modules/**,dist/**,coverage/**,src/__tests__/**,**/*.test.ts,**/*.spec.ts \
                  -Dsonar.coverage.exclusions=src/__tests__/**,**/*.test.ts,**/*.spec.ts \
                  -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info \
                  -Dsonar.sourceEncoding=UTF-8
              '''
            } else {
              bat '''
                sonar-scanner \
                  -Dsonar.projectKey=AthletiaBackend \
                  -Dsonar.projectName=AthletiaBackend \
                  -Dsonar.sources=src \
                  -Dsonar.tests=src/__tests__ \
                  -Dsonar.exclusions=node_modules/**,dist/**,coverage/**,src/__tests__/**,**/*.test.ts,**/*.spec.ts \
                  -Dsonar.coverage.exclusions=src/__tests__/**,**/*.test.ts,**/*.spec.ts \
                  -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info \
                  -Dsonar.sourceEncoding=UTF-8
              '''
            }
          }
        }
      }
    }

    stage('Quality Gate') {
      steps {
        timeout(time: 10, unit: 'MINUTES') {
          waitForQualityGate abortPipeline: true
        }
      }
    }
  }

  post {
    always {
      junit allowEmptyResults: true, testResults: 'coverage/**/junit*.xml'
    }
    failure {
      echo 'Pipeline failed. Review the test logs or SonarQube Quality Gate.'
    }
    success {
      echo 'Backend pipeline finished successfully.'
    }
  }
}
