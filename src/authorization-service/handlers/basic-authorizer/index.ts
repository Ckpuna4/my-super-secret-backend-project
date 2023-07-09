import {Callback, APIGatewayRequestAuthorizerEvent, Context, APIGatewayAuthorizerResult} from "aws-lambda";

const TEST_GITHUB_ACCOUNT_LOGIN = process.env.TEST_GITHUB_ACCOUNT_LOGIN;
const TEST_PASSWORD = process.env.TEST_PASSWORD;
export const handler = async (event: APIGatewayRequestAuthorizerEvent, context: Context, callback: Callback) => {
    try {
        console.log(`Event: ${JSON.stringify(event, null, 2)}`);
        console.log(`Context: ${JSON.stringify(context, null, 2)}`);
        const token = event!.headers!.Authorization;

        if (!token) {
            callback("Unauthorized"); // Return a 401 Unauthorized response
            return;
        }

        const [, encodedCredentials] = token!.split(' ');
        const buff = Buffer.from(encodedCredentials, 'base64');
        const [username, password] = buff.toString('utf-8').split(':');

        console.log('username', username);

        if (!TEST_GITHUB_ACCOUNT_LOGIN || username !== TEST_GITHUB_ACCOUNT_LOGIN ||
            !TEST_PASSWORD || password !== TEST_PASSWORD) {
            callback(null, generatePolicy(encodedCredentials, 'Deny', event.methodArn));
            return;
        }

        callback(null, generatePolicy(encodedCredentials, 'Allow', event.methodArn));
    } catch (e) {
        console.error(e);
        callback("Unauthorized"); // Return a 401 Unauthorized response
    }
};

const generatePolicy = (principalId: string, effect: string, resource: string): APIGatewayAuthorizerResult => {
    return {
        principalId,
        policyDocument: {
            Version: '2012-10-17',
            Statement: [
                {
                    Action: 'execute-api:Invoke',
                    Effect: effect,
                    Resource: resource,
                }
            ]
        }
    }
};






