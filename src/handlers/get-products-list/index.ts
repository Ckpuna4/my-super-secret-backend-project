import {constructResponse, getProducts} from "/opt/handlers-utils";
import {APIGatewayProxyEvent, Context} from "aws-lambda";

export const handler = async (event?: APIGatewayProxyEvent, context?: Context) => {
    try {
        console.log(`Event: ${JSON.stringify(event, null, 2)}`);
        console.log(`Context: ${JSON.stringify(context, null, 2)}`);
        const products = await getProducts();
        return constructResponse(200, products);
    } catch (e) {
        console.error(e);
        return constructResponse(500, {message: 'Internal error'});
    }
};
