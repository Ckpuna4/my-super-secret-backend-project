import {adaptItem} from "./adapt-item";
import {products, stocks} from "./initial-data";
import {DynamoDB} from '@aws-sdk/client-dynamodb';
import {fromIni} from '@aws-sdk/credential-providers';
require('dotenv').config();

const credentials = fromIni({profile: process.env.AWS_PROFILE});
const region = process.env.REGION as string;
const dynamodb = new DynamoDB({region, credentials});

const productsTableName = process.env.PRODUCTS_TABLE_NAME as string;
const stocksTableName = process.env.STOCKS_TABLE_NAME as string;

const putItems = () => {
    const productsTableItems = products.map((product) => adaptItem(product))
    const stocksTableItems = stocks.map((stock) => adaptItem(stock))

    const params = {
        RequestItems: {
            [productsTableName]: productsTableItems,
            [stocksTableName]: stocksTableItems,
        },
    };

    dynamodb.batchWriteItem(params, (err, data) => {
        if (err) {
            console.error('Error adding items:', err);
        } else {
            console.log('Items added successfully:', data);
        }
    });
}

putItems();
