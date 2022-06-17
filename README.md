![Coverage Badge](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/ci-sourceallies/a75d8e3e0b2e93d28de4074882dade90/raw/small-improvements-slack-bot__heads_main.json)

# Small Improvements Slack Bot

Periodically keeps track of and writes notifications to Slack of Achieved goals from Small Improvements.

See the [Slack App page](https://api.slack.com/apps/A03K9PBLSTE/general?) for more information on the bot and its permissions.

Request access from a slack admin (`@slack-admin` in `#slack-support`) to gain access.

## Architecture

### Serverless Architecture Diagram

This Diagram below is useful if you would like to understand the [inner workings of the lambda function](#lambda-function).

![Serverless Program Structure](https://github.com/sourceallies/small-improvements-slack-bot/blob/main/graphics/InfrastructureLayout.png?raw=true)

### SAM

The backbone of this project's CI/CD pipeline, configures and deploys all resources needed through CloudFormation. More information about SAM can be found in [AWS's SAM Documentation](https://aws.amazon.com/serverless/sam/#:~:text=The%20AWS%20Serverless%20Application%20Model,and%20model%20it%20using%20YAML.).

### Cloudwatch

An Event that is triggered by a rule deployed and updated automatically by [SAM](#sam). The rule specifies the times at which the lambda function will be triggered by an event.

### Lambda Function

Serves as the main hub of this stack, deployed and updated automatically by [SAM](#sam). 

- Triggered by a CloudWatch Event, which is passed into its main function.
- Assigns its Slack Channel name via Environment variables passed in by SAM.
- Uses the SecretsManager to get both the Slack and Small Improvements tokens.
- Gets all objectives using the Small Improvements API token.
- Filters the objectives such that only those of a specific type, status, visibility, and time are left.
- Log the number of objectives found.
- For each of those objectives,the database is checked to see if it has an object with the same ID (returns a promise).
  - If the objective was in the database, return undefined, there is nothing left to do for this objective.
  - If the objective was not in the database, it will try to post to Slack, which requires the following:
    - Try to get SlackID via the email address in the Small Improvements Objective.
    - Format the slack message using the objective, its status, and the SlackID.
    - Try to send the message (if successful, resolves to the body of the HTTP response).
    - Try to insert the record of the objective into the database.
- Finally, after all of the promises created from those objectives resolve, the data on number of successful and unsuccessful posts is logged and returned.

### DynamoDB

Stores data on objective IDs, objective achieved times, and sheds old data via TTL. Is ensured to be live/updated automatically by [SAM](#sam).

## Development

### Credentials

This project utilizes credentials stored in GitHub Secrets. The deployment workflow uses IAM Role ARNs with the AWS CLI to Configure Credentials, and API tokens are injected into SAM as parameter overrides. The aformentioned tokens are utilized in such a way that they make it to the final lambda function as environment variables without being echoed anywhere in the codebase, AWS logs, or Actions logs. If either API token becomes invalid, review the links [below](#small-improvements) to get new tokens. Then using the AWS console, put the new secret value. You will need to send both values.

There are four sets of credentials used in this project as GitHub Secrets:
| Secret Name       | Secret Description                                |
| ----------------- |:-------------------------------------------------:|
| **SITOKEN**       | A personal access token from Small Improvements   | 
| **SLACKTOKEN**    | The Slack Bot's OAuth token                       |
| **DEV_ROLE_ARN**  | The ARN of the IAM role used in deploying to Dev  |
| **PROD_ROLE_ARN** | The ARN of the IAM role used in deploying to Prod |



#### AWS IAM ROLES

Roles in Dev and Prod respectively, DEV_ROLE_ARN and PROD_ROLE_ARN must have all the permissions required to deploy the application in their respective environments.

Note: Utilizing a role with the *AdministratorAccess* policy is not advised, but *will* work.

#### Small Improvements

Using Matt Vincent's personal access token.
[Generate personal access token](https://resources.small-improvements.com/knowledge-base/small-improvements-rest-api/)

#### Slack

Copy from [this Slack App's OAuth page](https://api.slack.com/apps/A03K9PBLSTE/oauth?).

### Secrets Manager

The secrets structure is as follows.

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
1. Build: Ensures that all code is linted and buildable.
2. Deploy-dev: Deploys to the dev environment via SAM.
3. Deploy-prod: Deploys to the prod environment via SAM.

#### Pull Requests

The *PR Check* workflow has a singular job, which ensures that the code is linted and unit tested without error before being able to merge to main.

#### Badge Generation

The *badge-generation* workflow runs all unit tests in order to create the coverage badge seen [at the top of this README](#small-improvements-slack-bot).

### Running Locally

**Warning:** this can still have effects on both the dev database and Slack under the right conditions.

Navigate to the local directory of this repository and install all dependencies.

```console
npm install
```

Make sure you are on the dev environment with all dev credentials. More information on this can be found in the [sai-aws-auth repo](https://github.com/sourceallies/sai-aws-auth).

```console
dev
```

Finally, run the integration test to use the function locally.

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

### Other

The bot's birthday is 06-20-2022!
