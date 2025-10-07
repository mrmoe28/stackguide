import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'

if (!process.env.R2_ENDPOINT) {
  throw new Error('R2_ENDPOINT environment variable is required')
}
if (!process.env.R2_ACCESS_KEY_ID) {
  throw new Error('R2_ACCESS_KEY_ID environment variable is required')
}
if (!process.env.R2_SECRET_ACCESS_KEY) {
  throw new Error('R2_SECRET_ACCESS_KEY environment variable is required')
}
if (!process.env.R2_BUCKET) {
  throw new Error('R2_BUCKET environment variable is required')
}

const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
})

export async function uploadToR2(
  key: string,
  content: string,
  contentType: string = 'text/plain'
): Promise<void> {
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET,
    Key: key,
    Body: content,
    ContentType: contentType,
  })

  await r2Client.send(command)
}

export async function getFromR2(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET,
    Key: key,
  })

  const response = await r2Client.send(command)
  return await response.Body!.transformToString()
}

export { r2Client }
