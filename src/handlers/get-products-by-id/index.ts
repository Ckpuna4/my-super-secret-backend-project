import {mockMapOfProducts} from "/opt/mock-data";
import {constructResponse} from "/opt/response-utils";
import {APIGatewayProxyEvent} from 'aws-lambda';

export const handler = async (event: APIGatewayProxyEvent) => {
    try {
        const productId = event.pathParameters!.productId as string | null;

        if (!productId) {
            return constructResponse(200, { message: 'id is empty' });
        }

        const product = mockMapOfProducts.get(productId);
        let body;

        if (product) {
            body = {
                message: 'Product details fetched successfully',
                product
            };
        } else {
            body = {
                message: `There is no product with id ${productId}`
            };
        }

        return constructResponse(200, body);
    } catch (error) {
        console.error(error);
        return constructResponse(500, { message: 'Internal Server Error' });
    }
};
