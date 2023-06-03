import {handler} from "../../handlers/get-products-by-id";
import {mockProducts} from "/opt/mock-data";
import {constructResponse} from "/opt/response-utils";
import {APIGatewayProxyEvent} from 'aws-lambda';

describe('getProductsListById', () => {
    let originalConsoleError: (...data: any[]) => void;

    beforeEach(() => {
        originalConsoleError = console.error;
        console.error = jest.fn();
    });

    afterEach(() => {
        console.error = originalConsoleError;
    });

    it('should return successfully products by id', async () => {
        const product = mockProducts[0];

        const response = await handler({
            pathParameters: {
                productId: product.id
            } as APIGatewayProxyEvent['pathParameters']
        } as APIGatewayProxyEvent);

        expect(response).toEqual(constructResponse(200, {
            message: 'Product details fetched successfully',
            product
        }));
    });

    it('should return message that there is no products with this id', async () => {
        const productId = 'no-existing-id-sorry';

        const response = await handler({
            pathParameters: {
                productId
            } as APIGatewayProxyEvent['pathParameters']
        } as APIGatewayProxyEvent);

        expect(response).toEqual(constructResponse(200, {
            message: `There is no product with id ${productId}`,
        }));
    });

    it('should return internal error if for example no event', async () => {
        const response = await handler(null as any);

        expect(response).toEqual(constructResponse(500, { message: 'Internal Server Error' }));

        expect(console.error).toHaveBeenCalled();
        expect(console.error).toHaveBeenCalledTimes(1);
    });
});
