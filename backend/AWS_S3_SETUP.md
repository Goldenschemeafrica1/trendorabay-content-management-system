# AWS S3 Setup Guide

This guide explains how to configure AWS S3 for file uploads in the Trendorabay Content Management System.

## Overview

The CMS has been configured to use AWS S3 for file storage instead of local filesystem storage. This provides better scalability, performance, and reliability for production deployments.

## Prerequisites

1. AWS Account with appropriate permissions
2. S3 Bucket created
3. AWS Access Key ID and Secret Access Key
4. Node.js and npm installed

## Installation

The required AWS SDK packages have already been installed:

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner multer-s3
```

## Configuration

### 1. AWS S3 Bucket Setup

1. Log in to AWS Console
2. Navigate to S3 service
3. Create a new bucket with a unique name
4. Configure bucket settings:
   - Block Public Access: Off (if you want public file access)
   - CORS configuration (if needed for frontend access)

### 2. IAM User Setup

1. Create an IAM user with programmatic access
2. Attach the following policy to the user:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::your-bucket-name",
        "arn:aws:s3:::your-bucket-name/*"
      ]
    }
  ]
}
```

3. Save the Access Key ID and Secret Access Key

### 3. Environment Variables

Update the `.env` file in the backend directory with your AWS credentials:

```env
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
```

## File Upload Configuration

The CMS uses a centralized upload configuration in `src/config/upload.js` that automatically switches between S3 and local storage based on whether AWS credentials are configured.

### Upload Limits by Type

- **Podcasts**: 200MB (audio/video files)
- **Magazines**: 50MB (PDF files)
- **Media**: 10MB per file (images, videos)
- **Stories**: 5MB (cover images)
- **Authors**: 5MB (avatar images)
- **Products**: 5MB (product images)
- **Advertisements**: 5MB (ad images)
- **Events**: 5MB (event images)
- **Pitch Submissions**: 10MB (document files)

### Folder Structure

Files are organized in S3 with the following folder structure:

```
your-bucket-name/
├── podcasts/
├── magazines/
├── media/
├── stories/
├── authors/
├── products/
├── advertisements/
├── events/
└── pitches/
```

## Usage

### Automatic Switching

The system automatically switches between S3 and local storage:

- If AWS credentials are configured → Uses S3
- If AWS credentials are missing → Falls back to local storage

### Upload Examples

The upload routes have been updated to use the centralized configuration. No changes are needed in your route handlers.

```javascript
// Example from podcasts route
const { uploadFields } = require('../config/upload');
const upload = uploadFields([
  { name: 'cover_art', maxCount: 1 },
  { name: 'audio_file', maxCount: 1 },
  { name: 'video_file', maxCount: 1 }
], 'podcasts', 200 * 1024 * 1024);
```

### File URL Handling

The system automatically handles both S3 URLs and local file paths:

```javascript
// S3 URL format
https://your-bucket-name.s3.us-east-1.amazonaws.com/podcasts/file-123.jpg

// Local path format (fallback)
/uploads/podcasts/file-123.jpg
```

## S3 Configuration Module

The S3 configuration is in `src/config/s3.js` and provides:

- `uploadToS3()` - Upload files to S3
- `deleteFromS3()` - Delete files from S3
- `getSignedUrlForFile()` - Generate signed URLs for private files

## Testing

### Test S3 Configuration

1. Ensure your `.env` file has valid AWS credentials
2. Start the backend server: `npm start`
3. Test file upload through the API endpoints
4. Check your S3 bucket to verify files are uploaded

### Test Local Fallback

1. Remove or comment out AWS credentials from `.env`
2. Restart the backend server
3. Test file upload - files should be saved to local `uploads/` directory

## Troubleshooting

### Common Issues

1. **Access Denied Error**
   - Verify IAM user has correct S3 permissions
   - Check bucket policy allows the IAM user access

2. **Credentials Error**
   - Ensure AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are correct
   - Check that credentials haven't expired

3. **Region Error**
   - Verify AWS_REGION matches your bucket's region
   - Check bucket location in AWS Console

4. **File Size Limit Exceeded**
   - Check upload limits in `src/config/upload.js`
   - Verify S3 bucket doesn't have additional size restrictions

### Debug Mode

Enable debug logging by setting:

```env
NODE_ENV=development
```

This will provide detailed error messages in the console.

## Security Considerations

1. **Never commit `.env` file** to version control
2. **Use IAM roles** instead of access keys when deploying to AWS
3. **Enable bucket encryption** for sensitive files
4. **Configure bucket policies** appropriately for public vs private access
5. **Rotate access keys** regularly

## Production Deployment

For production deployment:

1. Use AWS IAM roles instead of access keys
2. Enable S3 bucket versioning
3. Configure lifecycle policies for old files
4. Enable S3 server-side encryption
5. Set up CloudFront CDN for better performance
6. Configure proper bucket policies for security

## Additional Resources

- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [AWS SDK for JavaScript](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)
- [Multer S3 Documentation](https://github.com/badunk/multer-s3)

## Support

If you encounter issues with S3 configuration:

1. Check AWS CloudTrail logs for API call details
2. Verify IAM user permissions in AWS Console
3. Test connectivity using AWS CLI
4. Review backend server logs for detailed error messages
