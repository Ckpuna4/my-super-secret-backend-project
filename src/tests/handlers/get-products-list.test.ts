import {handler} from "../../handlers/get-products-list";
import {constructResponse} from "../../utils/handlers-utils";
const fakeProducts = [
    {
        id: "1",
        description: "Fake Product",
        price: 10,
        title: "Fake Product",
        count: 42,
    },
    {
        id: "2",
        description: "Fake Product",
        price: 10,
        title: "Fake Product",
        count: 42,
    }
];

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
        getProducts: jest.fn(async () => {
            return fakeProducts;
        }),
    };
});

describe('getProductsList', () => {
    it('should return products list', async () => {
        const response = await handler();
        expect(response).toEqual(constructResponse(200, fakeProducts));
        expect(console.error).not.toHaveBeenCalled();
        expect(console.log).toHaveBeenCalled();
        expect(console.log).toHaveBeenCalledTimes(1);
    });
});
