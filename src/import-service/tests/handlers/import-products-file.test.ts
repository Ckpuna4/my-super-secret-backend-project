import {handler} from "../../handlers/import-products-file";
import {constructResponse} from "../../../utils/handlers-utils";
import {APIGatewayProxyEvent} from "aws-lambda";

const fakeUrl = 'https://fakeUrl';

jest.mock('@aws-sdk/client-s3', () => {
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

    const originalModule = jest.requireActual('@aws-sdk/client-s3');

    return {
        ...originalModule,
        S3Client: jest.fn(() => {
            return {};
        }),
        PutObjectCommand: jest.fn(() => {
            return {};
        })
    };
});

jest.mock('@aws-sdk/s3-request-presigner', () => {
    const originalModule = jest.requireActual('@aws-sdk/s3-request-presigner');

    return {
        ...originalModule,
        getSignedUrl: jest.fn(async () => {
            return Promise.resolve(fakeUrl);
        }),
    };
});

describe('importProductsFile', () => {
    it('should return signed url', async () => {
        const event = {
            queryStringParameters: {
                name: 'test'
            } as APIGatewayProxyEvent['pathParameters']
        } as APIGatewayProxyEvent;
        const response = await handler(event);
        expect(response).toEqual(constructResponse(200, fakeUrl));
        expect(console.error).not.toHaveBeenCalled();
        expect(console.log).toHaveBeenCalled();
        expect(console.log).toHaveBeenCalledTimes(3);
    });

    it('should return an error if rest guard doesn\'t work', async () => {
        const response = await handler(void 0 as any);
        expect(response).toEqual(constructResponse(500, {message: 'Internal Server Error'}));
        expect(console.error).toHaveBeenCalled();
        expect(console.log).toHaveBeenCalledTimes(2);
        expect(console.log).toHaveBeenCalled();
        expect(console.log).toHaveBeenCalledTimes(2);
    });
});
