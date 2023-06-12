import {constructResponse, createProduct, isBodyFit, logClientParams} from "/opt/handlers-utils";
import {APIGatewayProxyEvent} from 'aws-lambda';

export const handler = async (event: APIGatewayProxyEvent) => {
    try {
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
