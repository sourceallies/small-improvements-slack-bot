# Small Improvements Slack Bot

Periodically keeps track of and writes notifications to Slack of Achieved goals from Small Improvements

See the [Slack App page](https://api.slack.com/apps/A03K9PBLSTE/general?) for more information on the bot and its permissions.

Request access from a slack admin (`@slack-admin` in `#slack-support`) to gain access.

## Architecture

![Serverless Program Structure](https://github.com/sourceallies/small-improvements-slack-bot/blob/main/graphics/InfrastructureLayout.svg?raw=true)

## Development

### Credentials

There are two sets of credentials. A personal access token from Small Improvements and the Slack Bot's OAuth token.

Credentials are stored in Secrets Manager. It is managed manually to keep secrets out of the code base. If either token becomes invalid, review the links below to get new tokens. Then using the AWS console, put the new secret value. You will need to send both values.

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

## Useful links

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
