import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'

// R2 is optional - only initialize if credentials are provided
const isR2Configured = !!(
  process.env.R2_ENDPOINT &&
  process.env.R2_ACCESS_KEY_ID &&
  process.env.R2_SECRET_ACCESS_KEY &&
  process.env.R2_BUCKET
)

const r2Client = isR2Configured
  ? new S3Client({
      region: 'auto',
      endpoint: process.env.R2_ENDPOINT!,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    })
  : null

export async function uploadToR2(
  key: string,
  content: string,
  contentType: string = 'text/plain'
): Promise<void> {
  if (!isR2Configured || !r2Client) {
    console.log('R2 storage not configured, skipping upload')
    return
  }

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET,
    Key: key,
    Body: content,
    ContentType: contentType,
  })

  await r2Client.send(command)
}

export async function getFromR2(key: string): Promise<string> {
  if (!isR2Configured || !r2Client) {
    throw new Error('R2 storage is not configured')
  }

  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET,
    Key: key,
  })

  const response = await r2Client.send(command)
  return await response.Body!.transformToString()
}

export { r2Client, isR2Configured }
