import {APIGatewayProxyEvent, Context} from "aws-lambda";
import {constructResponse, logClientParams} from "/opt/handlers-utils";
import {PutObjectCommand, S3Client} from "@aws-sdk/client-s3";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";

const BUCKET_NAME = process.env!.BUCKET_NAME as string;
const BUCKET_REGION = process.env!.BUCKET_REGION as string;

export const handler = async (event: APIGatewayProxyEvent, context?: Context) => {
    try {
        console.log(`Event: ${JSON.stringify(event, null, 2)}`);
        console.log(`Context: ${JSON.stringify(context, null, 2)}`);
        const name = event.queryStringParameters!.name as string;
        const key = `uploaded/${name}`;
        const url = await createPresignedUrlWithClient(BUCKET_NAME, key, BUCKET_REGION)
        logClientParams(url);
        return constructResponse(200, url)
    } catch (e) {
        console.error(e);
        return constructResponse(500, { message: 'Internal Server Error' });
    }
}

const createPresignedUrlWithClient = (bucket: string, key: string, region: string) => {
    const client = new S3Client({ region });
    const command = new PutObjectCommand({ Bucket: bucket, Key: key });
    return getSignedUrl(client, command, { expiresIn: 3600 });
};
