import {Context, S3Event} from "aws-lambda";
import {CopyObjectCommand, DeleteObjectCommand, GetObjectCommand, S3Client} from "@aws-sdk/client-s3";
import {Readable} from "stream";
import * as csvParser from "csv-parser";

const BUCKET_NAME = process.env!.BUCKET_NAME as string;
const BUCKET_REGION = process.env!.BUCKET_REGION as string;

export const handler = async (event: S3Event, context?: Context) => {
    try {
        console.log(`Event: ${JSON.stringify(event, null, 2)}`);
        console.log(`Context: ${JSON.stringify(context, null, 2)}`);
        const client = new S3Client({ region: BUCKET_REGION });

        const record = event.Records[0];
        const bucketName = record.s3.bucket.name;
        const objectKey = record.s3.object.key;

        const getObjectCommand = new GetObjectCommand({
            Bucket: bucketName,
            Key: objectKey,
        });

        const response = await client.send(getObjectCommand);
        const stream = response.Body as Readable;

        stream.pipe(csvParser())
            .on('data', (row) => {
                console.log('Received row:', row);
            })
            .on('end', () => {
                console.log('Finished parsing CSV file');
            })
            .on('error', (error) => {
                console.error('Error parsing CSV file:', error);
            });

        const copyCommand = new CopyObjectCommand({
            Bucket: BUCKET_NAME,
            CopySource: `/${BUCKET_NAME}/${objectKey}`,
            Key: objectKey.replace('uploaded', 'parsed')
        });
        await client.send(copyCommand);
        console.log('File copied successfully');

        const deleteCommand = new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: objectKey
        });
        await client.send(deleteCommand);
        console.log('Original file deleted successfully');
    } catch (e) {
        console.error(e);
    }
}
