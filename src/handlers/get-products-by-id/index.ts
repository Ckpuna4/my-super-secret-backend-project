import {constructResponse, getProductsById, logClientParams} from "/opt/handlers-utils";
import {APIGatewayProxyEvent, Context} from 'aws-lambda';

export const handler = async (event: APIGatewayProxyEvent, context?: Context) => {
    try {
        console.log(`Event: ${JSON.stringify(event, null, 2)}`);
        console.log(`Context: ${JSON.stringify(context, null, 2)}`);
        logClientParams(event.pathParameters);
        const productId = event.pathParameters!.productId as string | null;

        if (!productId) {
            return constructResponse(200, { message: 'id is empty' });
        }

        const product = await getProductsById(productId);
        let body;

        if (product) {
            body = {
                message: 'Product details fetched successfully',
                product
            };
        } else {
            body = {
                message: 'Product not found'
            };
        }

        return constructResponse(200, body);
    } catch (error) {
        console.error(error);
        return constructResponse(500, { message: 'Internal Server Error' });
    }
};
