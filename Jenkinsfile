pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
    timeout(time: 30, unit: 'MINUTES')
    buildDiscarder(logRotator(numToKeepStr: '10'))
  }

  tools {
    nodejs 'NodeJS 22'
  }

  environment {
    NODE_ENV = 'test'
    JWT_SECRET = 'ci-dummy-jwt-secret-not-used-for-real-auth'
    GOOGLE_MAPS_API_KEY = 'ci-dummy-google-maps-key'
    DATABASE_URL = 'postgresql://dummy:dummy@localhost:5432/dummy'
    SONAR_PROJECT_KEY = 'AthletiaBackend'
    SONAR_PROJECT_NAME = 'AthletiaBackend'
    IMAGE_NAME = 'athletia-backend'
    CONTAINER_NAME = 'athletia-backend-container'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Verify Environment') {
      steps {
        sh '''
          set -e
          node --version
          npm --version
          docker --version
          java -version
        '''
      }
    }

    stage('Install dependencies') {
      steps {
        sh 'npm ci'
      }
    }

    stage('Build') {
      steps {
        sh 'npm run build'
      }
    }

    stage('Run tests with coverage') {
      steps {
        sh 'npm run test:coverage -- --run'
      }
    }

    stage('SonarQube Analysis') {
      steps {
        script {
          def scannerHome = tool(
            name: 'SonarScanner',
            type: 'hudson.plugins.sonar.SonarRunnerInstallation'
          )

          withSonarQubeEnv('SonarQube') {
            sh """
              set -e
              "${scannerHome}/bin/sonar-scanner" \
                -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
                -Dsonar.projectName=${SONAR_PROJECT_NAME} \
                -Dsonar.sources=src \
                -Dsonar.tests=src/__tests__ \
                -Dsonar.exclusions=node_modules/**,dist/**,coverage/**,src/__tests__/**,**/*.test.ts,**/*.spec.ts \
                -Dsonar.coverage.exclusions=src/__tests__/**,**/*.test.ts,**/*.spec.ts \
                -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info \
                -Dsonar.sourceEncoding=UTF-8
            """
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

    stage('Build Docker Image') {
      steps {
        sh '''
          set -e
          docker build \
            --pull \
            -t "$IMAGE_NAME:$BUILD_NUMBER" \
            -t "$IMAGE_NAME:latest" \
            .
        '''
      }
    }

    stage('Deploy Application') {
      steps {
        sh '''
          set -e
          docker rm -f "$CONTAINER_NAME" 2>/dev/null || true
          docker run -d \
            --name "$CONTAINER_NAME" \
            --restart unless-stopped \
            -p 3000:3000 \
            "$IMAGE_NAME:$BUILD_NUMBER"
        '''
      }
    }

    stage('Verify Deployment') {
      steps {
        sh '''
          set -e
          for attempt in $(seq 1 20); do
            STATUS=$(curl -s -o /tmp/athletia-health.json -w '%{http_code}' http://localhost:3000/health || true)
            echo "HTTP status: $STATUS"

            if [ "$STATUS" = "200" ]; then
              exit 0
            fi

            sleep 5
          done

          docker logs "$CONTAINER_NAME"
          echo "El contenedor no alcanzó el estado saludable."
          exit 1
        '''
      }
    }
  }

  post {
    always {
      junit allowEmptyResults: true, testResults: 'coverage/**/junit*.xml'
      archiveArtifacts(
        artifacts: 'coverage/lcov.info',
        fingerprint: true,
        allowEmptyArchive: true
      )
    }

    failure {
      sh '''
        docker logs "$CONTAINER_NAME" 2>/dev/null || true
      '''
    }

    success {
      echo 'Backend pipeline finished successfully.'
    }
  }
}
