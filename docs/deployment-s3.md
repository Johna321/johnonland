# S3 Deployment Setup

This guide explains how to set up automatic deployment of your Quartz site to AWS S3 using GitHub Actions.

## Prerequisites

- An AWS S3 bucket configured for static website hosting
- A CloudFront distribution pointing to your S3 bucket
- AWS IAM permissions to create roles and policies (for OIDC method) or IAM user with access keys (for simple method)

## Deployment Methods

There are two ways to authenticate with AWS:

1. **Simple Method (Access Keys)** - Easier to set up, good for personal projects
2. **Secure Method (OIDC)** - More secure, recommended for production/team projects

## Setup Steps

### Method 1: Simple Setup (Access Keys)

#### 1. Create IAM User with Access Keys

1. Go to AWS IAM Console
2. Create a new IAM user (e.g., `github-actions-deploy`)
3. Attach the following policy to the user:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::YOUR_BUCKET_NAME",
        "arn:aws:s3:::YOUR_BUCKET_NAME/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation"
      ],
      "Resource": "arn:aws:cloudfront::YOUR_ACCOUNT_ID:distribution/YOUR_DISTRIBUTION_ID"
    }
  ]
}
```

4. Create access keys for this user
5. Copy the Access Key ID and Secret Access Key

#### 2. Add GitHub Secrets

Add these secrets to your GitHub repository:

- `AWS_ACCESS_KEY_ID`: Your IAM user's access key ID
- `AWS_SECRET_ACCESS_KEY`: Your IAM user's secret access key
- `S3_BUCKET_NAME`: Your S3 bucket name (e.g., `johnon.land`)
- `CLOUDFRONT_DISTRIBUTION_ID`: Your CloudFront distribution ID (e.g., `E2YAUZC3DRLKUI`)

#### 3. Use the Simple Workflow

The workflow file `.github/workflows/deploy-s3-simple.yaml` is ready to use with access keys.

### Method 2: Secure Setup (OIDC)

#### 1. Create IAM Role for GitHub Actions

Create an IAM role that GitHub Actions can assume to deploy to S3. This role should have the following trust policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::YOUR_ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:YOUR_GITHUB_USERNAME/YOUR_REPO_NAME:*"
        }
      }
    }
  ]
}
```

### 2. Attach Required Policies

Attach the following policies to your IAM role:

**S3 Access Policy:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::YOUR_BUCKET_NAME",
        "arn:aws:s3:::YOUR_BUCKET_NAME/*"
      ]
    }
  ]
}
```

**CloudFront Invalidation Policy:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation"
      ],
      "Resource": "arn:aws:cloudfront::YOUR_ACCOUNT_ID:distribution/YOUR_DISTRIBUTION_ID"
    }
  ]
}
```

#### 3. Configure GitHub Secrets

Add the following secrets to your GitHub repository:

1. Go to your repository settings
2. Navigate to "Secrets and variables" → "Actions"
3. Add the following secrets:

- `AWS_ROLE_ARN`: The ARN of the IAM role you created (e.g., `arn:aws:iam::123456789012:role/github-actions-s3-deploy`)
- `S3_BUCKET_NAME`: Your S3 bucket name (e.g., `johnon.land`)
- `CLOUDFRONT_DISTRIBUTION_ID`: Your CloudFront distribution ID (e.g., `E2YAUZC3DRLKUI`)

#### 4. Use the Secure Workflow

The workflow file `.github/workflows/deploy-s3.yaml` is configured for OIDC authentication.

### Branch Configuration

Both workflows are configured to deploy on pushes to the `v4` branch. If your default branch has a different name, update the workflow file:

```yaml
on:
  push:
    branches: [your-branch-name]
```

## How It Works

1. **Trigger**: The workflow runs when you push to your main branch or manually trigger it
2. **Build**: Installs dependencies and builds your Quartz site using `npx quartz build`
3. **Deploy**: Uploads all files from the `public/` directory to S3 with proper content types
4. **Invalidate**: Creates a CloudFront invalidation to ensure users see the latest content

## File Content Types

The workflow automatically sets the correct content types for different file types:
- HTML files: `text/html`
- CSS files: `text/css`
- JavaScript files: `application/javascript`
- XML files: `application/xml`
- JSON files: `application/json`
- Text files: `text/plain`
- Other files: Determined by AWS CLI

## Troubleshooting

### Common Issues

1. **Permission Denied**: Ensure your IAM role has the correct permissions and the trust policy includes your repository
2. **Bucket Not Found**: Verify the S3 bucket name in your secrets
3. **Distribution Not Found**: Check that the CloudFront distribution ID is correct
4. **Build Failures**: Ensure your Quartz configuration is valid and all dependencies are installed

### Debugging

You can manually trigger the workflow from the "Actions" tab in your GitHub repository to test the deployment process.

## Security Notes

### Access Keys Method
- **Pros**: Simple to set up, works with personal repositories
- **Cons**: Access keys are long-lived credentials that could be compromised
- **Best for**: Personal projects, quick setup

### OIDC Method
- **Pros**: No long-lived credentials, more secure, temporary tokens
- **Cons**: More complex setup, requires GitHub organization or specific repository configuration
- **Best for**: Production environments, team projects

### General Security
- Use minimal permissions for both methods
- Consider using a separate AWS account for production deployments
- Regularly rotate access keys if using the simple method 