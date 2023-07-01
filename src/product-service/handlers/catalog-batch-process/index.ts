import {Context, SQSEvent} from "aws-lambda";
import {AlmostProduct, createProduct, isBodyFit} from "/opt/handlers-utils";
import {SNSClient, PublishCommand} from '@aws-sdk/client-sns';

const SNS_TOPIC_ARN = process.env.SNS_TOPIC_ARN as string;

export const handler = async (event: SQSEvent, context?: Context) => {
    try {
        console.log(`Event: ${JSON.stringify(event, null, 2)}`);
        console.log(`Context: ${JSON.stringify(context, null, 2)}`);
        const records = event.Records;

        const productsTitles = [];
        for (let record of records) {
            const body = JSON.parse(record.body);
            const product: AlmostProduct = {
                description: body.description,
                title: body.title,
                price: Number(body.price),
                count: Number(body.count),
            };

            if (!isBodyFit(product)) {
                console.error('product does not fit to schema');
                return;
            }
            await createProduct(product);
            productsTitles.push(product.title);
        }

        const message = `Products were created ${productsTitles.join(', ')}`;
        console.log(message);
        const snsClient = new SNSClient({});
        await snsClient.send(new PublishCommand({
            TopicArn: SNS_TOPIC_ARN,
            Message: message,
            MessageAttributes: {
                'title': {
                    DataType: 'String.Array',
                    StringValue: JSON.stringify(productsTitles)
                }
            }
        }));
    } catch (e) {
        console.error(e);
    }
}
