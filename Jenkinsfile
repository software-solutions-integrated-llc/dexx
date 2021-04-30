#!/usr/bin/env groovy

void printStackTrace(Throwable t) {
  def sw = new StringWriter()
  def pw = new PrintWriter(sw)

  t.printStackTrace(pw)

  echo sw.toString()
}

void die(String message, Throwable t = null) {
  if (t) getStackTrace(t)

  error message
}

pipeline {
  agent {
    node {
      label 'linux && npm'
    }
  }

  options {
    buildDiscarder(logRotator(numToKeepStr: '5'))
    disableConcurrentBuilds()
    timeout(time: 10, unit: 'MINUTES')
    timestamps()
  }

  stages {
    stage('Initialize') {
      steps {
        script {
          // Determine whether build should be deployed
          def rx = /^release\/\d+\.\d+\.\d+(-.+)?$/
          if (env.BRANCH_NAME ==~ rx) env.DEPLOYABLE = true

          if (env.DEPLOYABLE) echo 'INFO: Deployable branch detected.'

          // Clean the workspace
          sh 'git clean -d --force -x'
        }
      }
    }

    stage('Install') {
      steps {
        // Restore dependencies
        echo 'INFO: Restoring NPM dependencies'

        sh 'npm install'
      }
    }

    stage('Lint') {
      steps {
        script {
          def b = './node_modules/.bin/tslint'
          def o = '--project tsconfig.json'

          def cmd = "$b ${-> o}"

          if (findFiles(glob: './tslint.json')) o += '--config ./tslint.json '

          // Lint TypeScript files
          echo 'INFO: Executing TypeScript linter'

          sh cmd
        }
      }
    }

    stage('Build') {
      steps {
        script {
          def b = './node_modules/.bin/tsc'
          def d = './deploy'
          def o = "--outDir $d"

          def cmd = "$b $o"

          // Build NPM library
          echo 'INFO: Beginning build of NPM library'

          sh cmd
        }
      }
    }

    stage('Test') {
      failFast false

      parallel {
        stage('Unit Tests') {
          steps {
            script {
              def b = './node_modules/.bin/jest'
              def c = 'test'
              def o = '--config jest.config.json'

              def cmd = "$b $c ${-> o}"

              // Execute unit tests
              echo'INFO: Executing unit tests with Jest test runner'

              sh cmd
            }
          }
        }

        stage('Vulnerability Tests') {
          steps {
            script {
              def c = 'snyk test'
              def e1 = 'Vulnerability test failed.' +
                ' Run "snyk wizard" to remediate potential vulnerabilities.'
              def e2 = 'An exception was caught during vulnerability testing.'

              // Execute Snyk vulnerability tests
              echo 'INFO: Executing vulnerability tests'

              try {
                sh 'snyk test'
              }
              catch(hudson.AbortException ex) {
                printStackTrace ex as Throwable

                echo "ERROR: $e1"

                currentBuild.result = 'UNSTABLE'
              }
              catch(Exception ex) {
                printStackTrace ex

                error e2
              }
            }
          }
        }
      }
    }

    stage('Pack') {
      steps {
        script {
          def c = 'npm pack'

          // Pack NPM library
          echo 'INFO: Archiving NPM library'

          sh 'cp {,deploy/}package.json'
          sh 'cp {,deploy/}readme.md'

          dir('deploy') { sh 'npm pack' }
          sh 'mv ./deploy/{*,lib}.tgz'
        }
      }
    }

    stage('Deploy') {
      when {
        expression {
          currentBuild.result != 'UNSTABLE'
        }
      }
      steps {
        script {
          def r = 'https://registry.npmjs.org'
          def cmd = "npm publish lib.tgz --access public"

          if (!env.DEPLOYABLE) cmd += ' --dry-run'

          // Publish to NPM registry
          echo "INFO: Publishing NPM library to $r."

          try {
            dir('deploy') { sh cmd }
          }
          catch(Exception ex) {
            echo 'FATAL: Failed to publish to NPM registry.' +
              ' Verify registry is properly configured and that package version has not already been deployed.'

            die ex
          }
        }
      }
    }
  }
}
