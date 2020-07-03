library 'magic-butler-catalogue'

def PROJECT_NAME = "logdna-test-setup-chain"
def repo = "answerbook/${PROJECT_NAME}"

pipeline {
  agent none

  options {
    timestamps()
    ansiColor 'xterm'
  }

  stages {
    stage('Test Suite') {
      matrix {
        axes {
          axis {
            name 'NODE_VERSION'
            values '10', '12', '14'
          }
        }

        agent {
          docker {
            image "us.gcr.io/logdna-k8s/node:${NODE_VERSION}-ci"
          }
        }

        environment {
          GITHUB_PACKAGES_TOKEN = credentials('github-api-token')
          NPM_CONFIG_CACHE = '.npm'
          NPM_CONFIG_USERCONFIG = '.npm/rc'
          SPAWN_WRAP_SHIM_ROOT = '.npm'
        }

        stages {
          stage('Install') {
            steps {
              sh 'mkdir -p .npm'
              script {
                npm.auth token: "${GITHUB_PACKAGES_TOKEN}"
              }
              sh 'npm install'
            }
          }

          stage('Test') {
            steps {
              sh 'node -v'
              sh 'npm -v'
              sh 'npm test'
            }

            post {
              always {
                junit 'coverage/test.xml'
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
          branch 'master'
        }
      }

      agent {
        docker {
          image "us.gcr.io/logdna-k8s/node:12-ci"
          customWorkspace "${PROJECT_NAME}-${BUILD_NUMBER}"
        }
      }

      environment {
        GITHUB_PACKAGES_TOKEN = credentials('github-api-token')
        NPM_CONFIG_CACHE = '.npm'
        NPM_CONFIG_USERCONFIG = '.npm/rc'
        SPAWN_WRAP_SHIM_ROOT = '.npm'
      }

      steps {
        sh 'mkdir -p .npm'
        versioner(
          token: "${GITHUB_PACKAGES_TOKEN}"
        , dry: true
        , repo: repo
        )
      }
    }

    stage('Release') {
      when {
        beforeAgent true
        branch 'master'
      }

      agent {
        docker {
          image "us.gcr.io/logdna-k8s/node:12-ci"
          customWorkspace "${PROJECT_NAME}-${BUILD_NUMBER}"
        }
      }

      environment {
        GITHUB_PACKAGES_TOKEN = credentials('github-api-token')
        NPM_CONFIG_CACHE = '.npm'
        NPM_CONFIG_USERCONFIG = '.npm/rc'
        SPAWN_WRAP_SHIM_ROOT = '.npm'
      }

      steps {
        sh 'mkdir -p .npm'
        sh "git checkout -b ${GIT_BRANCH} origin/${GIT_BRANCH}"
        versioner(
          token: "${GITHUB_PACKAGES_TOKEN}"
        , dry: false
        , repo: repo
        )
      }
    }
  }
}
