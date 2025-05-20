install_vsce: 
    npm install -g vsce

package:
    vsce package
    mv *.vsix ./vsix/

build:
    vsce package
    mv *.vsix ./vsix/

publish:
    vsce publish

npm_outdated:
    npm outdated

npm_upgrade:
    brew upgrade # upgrade homebrew
    brew install node # install the latest node version
    npm install -g npm@latest # upgrade to the latest version
    nvm alias default node # set the default node version
    nvm install node # install the latest node version

    npm upgrade # upgrade all packages used in the project

npm_doctor:
    node -v
    npm -v
    tsc -v
    npm doctor
    npm prune # remove unused dependencies
    npx depcheck # check dependencies
    npm-check # check dependencies
    
npm-install:
    rm -rf node_modules package-lock.json
    npm install
    npx tsc --noEmit

npm_rebuild:
    rm -rf node_modules
    npm install

localstack_start:
    localstack start

localstack_stop:
    localstack stop

localstack_status:
    localstack status

localstack_logs:
    localstack logs

localstack_help:
    localstack --help 

localstack_update:
    localstack update

create_loggroup:
    aws --endpoint-url=http://localhost:4566 logs create-log-group --log-group-name "my-log-group"
    aws --endpoint-url=http://localhost:4566 logs create-log-stream --log-group-name "my-log-group" --log-stream-name "my-log-stream"
    aws --endpoint-url=http://localhost:4566 logs create-log-stream --log-group-name "my-log-group" --log-stream-name "empty-log-stream"
    
add_logs:
    aws --endpoint-url=http://localhost:4566 logs put-log-events \
    --log-group-name my-log-group \
    --log-stream-name my-log-stream \
    --log-events '[{"timestamp": 1747746788001, "message": "Your log message here"}]'

