import {mockProducts} from "/opt/mock-data";
import {constructResponse} from "/opt/response-utils";

export const handler = async () => {
    return constructResponse(200, mockProducts);
};
