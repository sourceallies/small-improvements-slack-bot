# Small Improvements Slack Bot

Periodically keeps track of and writes notifications to Slack of Achieved goals from Small Improvements

See the [Slack App page](https://api.slack.com/apps/A03K9PBLSTE/general?) for more information on the bot and its permissions.

Request access from a slack admin (`@slack-admin` in `#slack-support`) to gain access.

## Architecture

### Architecture Diagram

![Serverless Program Structure](https://github.com/sourceallies/small-improvements-slack-bot/blob/main/graphics/InfrastructureLayout.svg?raw=true)

## Development

### Credentials

There are four sets of credentials used in this project as GitHub Secrets:
| Secret Name       | Secret Description                                |
| ----------------- |:-------------------------------------------------:|
| **SITOKEN**       | A personal access token from Small Improvements   | 
| **SLACKTOKEN**    | The Slack Bot's OAuth token                       |
| **DEV_ROLE_ARN**  | The ARN of the IAM role used in deploying to Dev  |
| **PROD_ROLE_ARN** | The ARN of the IAM role used in deploying to Prod |

Credentials are stored in GitHub Secrets. These secrets are injected into SAM as parameter overrides in such a way that they make it to the final lambda function as environment variables without being echoed anywhere in the codebase, AWS logs, or Actions logs. If either token becomes invalid, review the links below to get new tokens. Then using the AWS console, put the new secret value. You will need to send both values.

#### AWS IAM ROLES

DEV_ROLE_ARN and PROD_ROLE_ARN are roles in Dev and Prod respectively. They must have all permissions required to deploy the application in their respective environments.

Note: Utilizing a role with the *AdministratorAccess* policy is not advised, but *will* work 

#### Small Improvements

Anyone's Small Improvement's personal access token may be used.
[Generate personal access token](https://resources.small-improvements.com/knowledge-base/small-improvements-rest-api/)

#### Slack

Copy from [this Slack App's OAuth page](https://api.slack.com/apps/A03K9PBLSTE/oauth?)

### Secrets Manager

When putting the new secret, the value must follow this structure.

```
{
  "SIToken": "***",
  "SlackToken": "***"
}
```

### Workflow

#### Deployment

Deployment should be automatic with each new commit, but otherwise deployment can be triggered manually with a new deployment workflow on the repo's "actions" tab.

The *deployment* workflow has 3 jobs, each occuring only if the previous completed without error.
1. Build: Ensures that all code is linted and buildable
2. Deploy-dev: Deploys to the prod environment
3. Deploy-prod: Deploys to the prod environment

#### Pull Requests

The *PR Check* workflow has a singular job, which ensures that the code is linted and unit tested without error before being able to merge to main

### Running Locally

**Warning:** this can still have effects on both the dev database and Slack under the right conditions

Navigate to the local directory of this repository and install all dependencies

```console
npm install
```

Make sure you are on the dev environment with all dev credentials

```console
dev
```

Finally, run the integration test to use the function locally

```console
npm run integration
```

## Useful links

- [AWS SAM](https://aws.amazon.com/serverless/sam/#:~:text=The%20AWS%20Serverless%20Application%20Model,and%20model%20it%20using%20YAML.)
- [Posting Messages through the Slack API](https://api.slack.com/methods/chat.postMessage)
- [Small Improvements (lack of) API Documentation](https://storage.googleapis.com/si-rest-api-docs/dist/index.html)
- [DynamoDB Docs](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html)
- [mrkdwn formatting with Slack](https://api.slack.com/reference/surfaces/formatting)

### Endpoints Utilized

- Small Improvements
  - /api/v2/users/${USER_ID}
  - /api/v2/activities?modules=OBJECTIVE
- Slack
  - /api/chat.postMessage
  - /api/users.lookupByEmail?email=${USER_EMAIL}