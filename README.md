# maxwell-dt-stream

## Usage

```.js
docker compose up -d && cd ./consumer && npm i

npx nodemon ./app.js localhost 8080
```

## AWS CLI

- obs: Needs to be authenticated to AWS CLI

```bash
export AWS_PROFILE=my-profile && aws sso login
```
