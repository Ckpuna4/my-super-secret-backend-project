import {handler} from "../../handlers/get-products-by-id";
import {constructResponse} from "/opt/handlers-utils";
import {APIGatewayProxyEvent} from 'aws-lambda';

const fakeProduct = {
    id: "1",
    description: "Fake Product",
    price: 10,
    title: "Fake Product",
    count: 42,
};

jest.mock('/opt/handlers-utils', () => {
    const originalModule = jest.requireActual('/opt/handlers-utils');

    return {
        ...originalModule,
        getProductsById: jest.fn(async (id: string) => {
            if (id === fakeProduct.id) {
                return fakeProduct;
            } else {
                return null;
            }
        }),
    };
});

describe('getProductsListById', () => {
    let originalConsoleError: (...data: any[]) => void;
    let originalConsoleLog: (...data: any[]) => void;

    beforeEach(() => {
        originalConsoleError = console.error;
        originalConsoleLog = console.log;
        console.error = jest.fn();
        console.log = jest.fn();
    });

    afterEach(() => {
        console.error = originalConsoleError;
        console.log = originalConsoleLog;
    });

    it('should return successfully products by id', async () => {
        const response = await handler({
            pathParameters: {
                productId: fakeProduct.id
            } as APIGatewayProxyEvent['pathParameters']
        } as APIGatewayProxyEvent);

        expect(response).toEqual(constructResponse(200, {
            message: 'Product details fetched successfully',
            product: fakeProduct
        }));
        expect(console.log).toHaveBeenCalled();
        expect(console.log).toHaveBeenCalledTimes(1);
    });

    it('should return message that there is no products with this id', async () => {
        const productId = 'no-existing-id-sorry';

        const response = await handler({
            pathParameters: {
                productId
            } as APIGatewayProxyEvent['pathParameters']
        } as APIGatewayProxyEvent);

        expect(response).toEqual(constructResponse(200, {
            message: 'Product not found',
        }));
        expect(console.log).toHaveBeenCalled();
        expect(console.log).toHaveBeenCalledTimes(1);
    });

    it('should return internal error if for example no event', async () => {
        const response = await handler(null as any);

        expect(response).toEqual(constructResponse(500, { message: 'Internal Server Error' }));

        expect(console.error).toHaveBeenCalled();
        expect(console.error).toHaveBeenCalledTimes(1);
    });
});
