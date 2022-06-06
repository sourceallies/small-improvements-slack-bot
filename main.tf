terraform {
    required_providers {
        aws = {
            source = "hashicorp/aws"
            version = "~> 3.27"
        }
    }
}

provider "aws" {
    profile = "default"
    region = var.region
}

resource "aws_iam_role" "lambda_role" {
    name = "Spacelift_Test_Lambda_Function_Role"
    assume_role_policy = <<EOF
{
 "Version": "2012-10-17",
 "Statement": [
   {
     "Action": "sts:AssumeRole",
     "Principal": {
       "Service": "lambda.amazonaws.com"
     },
     "Effect": "Allow",
     "Sid": ""
   }
 ]
}
EOF
}

resource "aws_iam_policy" "iam_policy_for_lambda" {
 name = "aws_iam_policy_for_terraform_aws_lambda_role"
 path = "/"
 description  = "AWS IAM Policy for managing aws lambda role"
 policy = <<EOF
{
 "Version": "2012-10-17",
 "Statement": [
   {
     "Action": [
       "logs:CreateLogGroup",
       "logs:CreateLogStream",
       "logs:PutLogEvents"
     ],
     "Resource": "arn:aws:logs:*:*:*",
     "Effect": "Allow"
   }
 ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "attach_iam_policy_to_iam_role" {
 role        = aws_iam_role.lambda_role.name
 policy_arn  = aws_iam_policy.iam_policy_for_lambda.arn
}

# https://spacelift.io/blog/terraform-aws-lambda

# https://github.com/terraform-aws-modules/terraform-aws-eventbridge/blob/v1.14.0/examples/with-lambda-scheduling/main.tf

data "archive_file" "zip_the_node_code" {
    type = "zip"
    source_dir  = "${path.module}/python/"
    output_path = "${path.module}/python/hello-python.zip"
}

resource "aws_lambda_function" "terraform_lambda_func" {
    filename = "${path.module}/python/hello-python.zip"
    function_name = "Spacelift_Test_Lambda_Function"
    role = aws_iam_role.lambda_role.arn
    handler = "index.lambda_handler"
    runtime  = "python3.8"
    depends_on = [aws_iam_role_policy_attachment.attach_iam_policy_to_iam_role]
}

resource "aws_instance" "cloudwatch_rule" {

}

module "eventbridge" {
    source = "../../"
    create_bus = false
    rules = {
        crons = {
            description = "Trigger for a Lambda"
            schedule_expression = "rate(12 hours)"
        }
    }
    targets = {
        crons = [
            {
                name  = "lambda-loves-cron"
                arn   = module.lambda.lambda_function_arn
                input = jsonencode({ "job" : "cron-by-rate" })
            }
        ]
    }
}