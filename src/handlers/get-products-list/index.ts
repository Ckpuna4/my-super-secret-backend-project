import {constructResponse, getProducts, logClientParams} from "/opt/handlers-utils";

export const handler = async () => {
    try {
        logClientParams('no params');
        const products = await getProducts();
        return constructResponse(200, products);
    } catch (e) {
        console.error(e);
        return constructResponse(500, {message: 'Internal error'});
    }
};
