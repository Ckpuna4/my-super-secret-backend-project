import {constructResponse, createProduct, isBodyFit, logClientParams} from "/opt/handlers-utils";
import {APIGatewayProxyEvent, Context} from 'aws-lambda';

export const handler = async (event: APIGatewayProxyEvent, context?: Context) => {
    try {
        console.log(`Event: ${JSON.stringify(event, null, 2)}`);
        console.log(`Context: ${JSON.stringify(context, null, 2)}`);
        const unprocessedBody = event.body;
        logClientParams(unprocessedBody);
        const body = JSON.parse(unprocessedBody || '');
        if (!isBodyFit(body)) {
            return constructResponse(400, {message: 'Body doesn\'t fit'});
        }
        await createProduct(body);
        return constructResponse(200, {message: 'Product was created successfully'});
    } catch (e) {
        console.error(e);
        return constructResponse(500, {message: 'Internal error'});
    }
};
