# Small Improvements Slack Bot

[Slack App](https://api.slack.com/apps/A03K9PBLSTE/general?)

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
Copy from [slack OAuth page](https://api.slack.com/apps/A03K9PBLSTE/oauth?)

#### Secrets Manager
When putting the new secret, the value must follow this structure.
```
{
  "SIToken": "***",
  "SlackToken": "***"
}
```

### Deployment

Deployment should be automatic with each new commit, but otherwise deployment can be triggered manually with a new deployment workflow online.

### Workflow

## Useful links

### Running Locally
