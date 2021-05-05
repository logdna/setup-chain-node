library 'magic-butler-catalogue'

def PROJECT_NAME = 'setup-chain'
def CURRENT_BRANCH = [env.CHANGE_BRANCH, env.BRANCH_NAME]?.find{branch -> branch != null}
def DEFAULT_BRANCH = 'main'
def TRIGGER_PATTERN = ".*@logdnabot.*"
def DRY_RUN = CURRENT_BRANCH != DEFAULT_BRANCH
def CHANGE_ID = env.CHANGE_ID == null ? '' : env.CHANGE_ID

pipeline {
  agent none

  options {
    timestamps()
    ansiColor 'xterm'
  }

  triggers {
    issueCommentTrigger(TRIGGER_PATTERN)
  }

  environment {
    GITHUB_TOKEN = credentials('github-api-token')
    NPM_TOKEN = credentials('npm-publish-token')
    NPM_CONFIG_CACHE = '.npm'
    NPM_CONFIG_USERCONFIG = '.npmrc'
    SPAWN_WRAP_SHIM_ROOT = '.npm'
  }

  stages {
    stage('Test Suite') {
      matrix {
        axes {
          axis {
            name 'NODE_VERSION'
            values '12', '14', '16'
          }
        }

        when {
          not {
            changelog '\\[skip ci\\]'
          }
        }


        agent {
          docker {
            image "us.gcr.io/logdna-k8s/node:${NODE_VERSION}-ci"
          }
        }

        stages {
          stage('Install') {
            steps {
              sh "mkdir -p ${NPM_CONFIG_CACHE} coverage"
              sh 'npm install'
            }
          }

          stage('Test') {
            steps {
              sh 'npm test'
            }

            post {
              always {
                junit checksName: 'Test Results', testResults: 'coverage/*.xml'
                publishHTML target: [
                  allowMissing: false,
                  alwaysLinkToLastBuild: false,
                  keepAll: true,
                  reportDir: 'coverage/lcov-report',
                  reportFiles: 'index.html',
                  reportName: "coverage-node-v${NODE_VERSION}"
                ]
              }
            }
          }
        }
      }
    }

    stage('Test Release') {
      when {
        beforeAgent true
        not {
          branch DEFAULT_BRANCH
        }
      }

      agent {
        docker {
          image "us.gcr.io/logdna-k8s/node:12-ci"
          customWorkspace "${PROJECT_NAME}-${BUILD_NUMBER}"
        }
      }

      environment {
        GIT_BRANCH = "${CURRENT_BRANCH}"
        BRANCH_NAME = "${CURRENT_BRANCH}"
        CHANGE_ID = ""
      }

      steps {
        sh 'npm install'
        sh 'npm run release:dry'
      }
    }

    stage ('Release') {
      agent {
        docker {
          image "us.gcr.io/logdna-k8s/node:12-ci"
          customWorkspace "${PROJECT_NAME}-${BUILD_NUMBER}"
        }
      }

      when {
        beforeAgent true
        branch DEFAULT_BRANCH
        not {
          changelog '\\[skip ci\\]'
        }
      }

      steps {
        sh "mkdir -p ${NPM_CONFIG_CACHE}"
        sh 'npm install'
        sh 'npm run release'
      }
    }
  }
}
