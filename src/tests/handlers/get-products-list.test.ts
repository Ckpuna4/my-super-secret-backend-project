import {handler} from "../../handlers/get-products-list";
import {mockProducts} from "/opt/mock-data";
import {constructResponse} from "/opt/response-utils";

describe('getProductsList', () => {
    it('should return products list', async () => {
        const response = await handler();
        expect(response).toEqual(constructResponse(200, mockProducts));
    });
});
