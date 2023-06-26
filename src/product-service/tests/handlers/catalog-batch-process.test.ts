import {handler} from "../../handlers/catalog-batch-process";
import {SQSEvent} from "aws-lambda";

const fakeProduct1 = {
    description: "Fake Product1",
    price: 10,
    title: "Fake Product1",
    count: 42,
};

const fakeProduct2 = {
    description: "Fake Product1",
    price: 10,
    title: "Fake Product1",
    count: 42,
};

jest.mock('/opt/handlers-utils', () => {
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

    const originalModule = jest.requireActual('/opt/handlers-utils');

    return {
        ...originalModule,
        createProduct: jest.fn(async () => {
            return Promise.resolve();
        }),
        isBodyFit: jest.fn(() => {
            return true;
        }),
    };
});

jest.mock('@aws-sdk/client-sns', () => {
    const originalModule = jest.requireActual('@aws-sdk/client-sns');

    return {
        ...originalModule,
        SNSClient: jest.fn(() => {
            return {send: jest.fn(() => {})};
        }),
        PublishCommand: jest.fn(() => {}),
    };
});

describe('catlogBatchProcess', () => {
    it('should create products', async () => {
        await handler({
            Records: [
                {body: JSON.stringify(fakeProduct1)},
                {body: JSON.stringify(fakeProduct2)},
            ]
        } as SQSEvent);
        expect(console.error).not.toHaveBeenCalled();
        expect(console.log).toHaveBeenCalled();
        expect(console.log).toHaveBeenCalledTimes(3);
    });
    it('should not create products', async () => {
        await handler(undefined as any);
        expect(console.error).toHaveBeenCalled();
        expect(console.log).toHaveBeenCalled();
        expect(console.log).toHaveBeenCalledTimes(2);
    });
});
