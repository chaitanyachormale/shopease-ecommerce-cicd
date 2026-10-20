pipeline {
    agent any

    environment {
        // Local deployment directory for Windows Jenkins agent
        DEPLOY_DIR = 'C:\\ShopEase_Deploy'
        APP_NAME   = 'ShopEase'
    }

    options {
        // Stop execution if any stage fails and maintain clean timestamps
        timeout(time: 15, unit: 'MINUTES')
        timestamps()
        ansiColor('xterm')
    }

    stages {
        // Stage 1: GitHub Source Code Checkout
        stage('GitHub Checkout') {
            steps {
                echo "=========================================================="
                echo " [Stage 1/5] Checking out source repository from GitHub..."
                echo "=========================================================="
                // Retrieves current repository commit from SCM
                checkout scm
                script {
                    echo "SCM Checkout completed successfully."
                }
            }
        }

        // Stage 2: Application Build & Asset Packaging
        stage('Build') {
            steps {
                echo "=========================================================="
                echo " [Stage 2/5] Building application & packaging dist/ assets..."
                echo "=========================================================="
                script {
                    if (isUnix()) {
                        sh 'npm run build'
                    } else {
                        bat 'npm run build'
                    }
                }
            }
        }

        // Stage 3: Automated Unit & Business Logic Testing
        stage('Automated Testing') {
            steps {
                echo "=========================================================="
                echo " [Stage 3/5] Running automated tests with Node.js runner..."
                echo "=========================================================="
                script {
                    if (isUnix()) {
                        sh 'npm test'
                    } else {
                        bat 'npm test'
                    }
                }
            }
        }

        // Stage 4: Code Quality & Static Integrity Verification
        stage('Code Quality Check') {
            steps {
                echo "=========================================================="
                echo " [Stage 4/5] Executing static code quality verification..."
                echo "=========================================================="
                script {
                    if (isUnix()) {
                        sh 'npm run quality'
                    } else {
                        bat 'npm run quality'
                    }
                }
            }
        }

        // Stage 5: Deployment to Target Environment
        stage('Deployment') {
            steps {
                echo "=========================================================="
                echo " [Stage 5/5] Deploying packaged application to target host..."
                echo "=========================================================="
                script {
                    if (isUnix()) {
                        // Linux / macOS deployment fallback
                        sh '''
                            mkdir -p ./deploy
                            cp -R dist/* ./deploy/
                            echo "Deployed successfully to ./deploy/"
                            ls -la ./deploy/
                        '''
                    } else {
                        // Windows native deployment step
                        bat """
                            echo Deploying to target directory: %DEPLOY_DIR%
                            if not exist "%DEPLOY_DIR%" mkdir "%DEPLOY_DIR%"
                            xcopy /E /I /Y dist\\* "%DEPLOY_DIR%\\"
                            if %ERRORLEVEL% NEQ 0 (
                                echo Deployment failed during xcopy!
                                exit /b 1
                            )
                            echo Deployment verified successfully.
                            dir "%DEPLOY_DIR%"
                        """
                    }
                }
            }
        }
    }

    post {
        always {
            echo "=========================================================="
            echo " Pipeline finished execution for ${APP_NAME}."
            echo "=========================================================="
        }
        success {
            echo " SUCCESS: All stages passed (Checkout -> Build -> Test -> Quality -> Deploy)!"
            echo " Deployed application is ready for demonstration at: ${DEPLOY_DIR}"
        }
        failure {
            echo " FAILURE: One or more pipeline stages failed. Inspect the console logs above."
        }
    }
}
