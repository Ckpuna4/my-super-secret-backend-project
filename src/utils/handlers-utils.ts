import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {DynamoDBDocumentClient, ScanCommand, QueryCommand, TransactWriteCommand} from "@aws-sdk/lib-dynamodb";
import * as crypto from "crypto";

const createDocClient = () => {
    const client = new DynamoDBClient({});
    return DynamoDBDocumentClient.from(client);
}

const PRODUCTS_TABLE_NAME = process.env!.PRODUCTS_TABLE_NAME as string;
const STOCKS_TABLE_NAME = process.env!.STOCKS_TABLE_NAME as string;

export const constructResponse = (statusCode: number, body: unknown) => {
    return {
        statusCode,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Methods': 'OPTIONS,GET'
        },
        body: JSON.stringify(body),
    }
};

export type Stock = {
    product_id: string;
    count: number;
}

export type Product = {
    id: string;
    description: string;
    price: number;
    title: string;
}

export const getProducts = async () => {
    const docClient = createDocClient();

    const productsScan = new ScanCommand({TableName: PRODUCTS_TABLE_NAME});
    const stocksScan = new ScanCommand({TableName: STOCKS_TABLE_NAME});

    const products = ((await docClient.send(productsScan)).Items || []) as Product[];
    const stocks = ((await docClient.send(stocksScan)).Items || []) as Stock[];

    const mapById = new Map<string, Partial<Stock>>();

    for (const stock of stocks) {
        mapById.set(stock.product_id, {count: stock.count});
    }

    const productsJoin = products.map((product) => {
        return {
            ...product,
            ...(mapById.get(product.id) || {count: 0})
        }
    }) || [];

    return productsJoin;
};

export const getProductsById = async (id: string) => {
    const docClient = createDocClient();

    const productsCommand = new QueryCommand({
        TableName: PRODUCTS_TABLE_NAME,
        KeyConditionExpression: 'id = :id',
        ExpressionAttributeValues: {
            ':id': id,
        },
    });
    const stocksCommand = new QueryCommand({
        TableName:  STOCKS_TABLE_NAME,
        KeyConditionExpression: 'product_id = :id',
        ExpressionAttributeValues: {
            ':id': id,
        },
    });

    const products = ((await docClient.send(productsCommand)).Items || []) as Product[];
    const stocks = ((await docClient.send(stocksCommand)).Items || []) as Stock[];

    if (!products.length) {
        return null;
    }

    return {
        ...products[0],
        ...{count: stocks?.[0].count ?? 0}
    };
};

export type AlmostProduct = {
    description: string;
    price: number;
    title: string;
    count: number;
}

export const createProduct = async (body: AlmostProduct) => {
    const docClient = createDocClient();
    const id = crypto.randomUUID();
    const {description, price, title, count} = body;

    const params = {
        TransactItems: [
            {
                Put: {
                    TableName: PRODUCTS_TABLE_NAME,
                    Item: {
                        id,
                        description,
                        price,
                        title,
                    },
                },
            },
            {
                Put: {
                    TableName: STOCKS_TABLE_NAME,
                    Item: {
                        product_id: id,
                        count,
                    },
                },
            },
        ],
    };

    const command = new TransactWriteCommand(params);
    await docClient.send(command);
}

export const isBodyFit = (body: Partial<AlmostProduct>): body is AlmostProduct => {
    return (
        typeof body === "object" &&
        typeof body!.description === "string" &&
        typeof body!.price === "number" && !isNaN(body!.price) &&
        typeof body!.title === "string" &&
        typeof body!.count === "number" && !isNaN(body!.count)
    );
};

export const logClientParams = (params: unknown) => console.log('Input parameters from client are', params);
