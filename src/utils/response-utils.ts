export const constructResponse = (statusCode: number, body: unknown) => {
    return {
        statusCode,
        headers: {
            'Access-Control-Allow-Origin': 'https://dgaojw28dgevx.cloudfront.net',
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Methods': 'OPTIONS,GET'
        },
        body: JSON.stringify(body),
    }
};
