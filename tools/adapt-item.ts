export const adaptItem = (jsonObj: any) => {
    const adaptedItem: any = {};

    for (const key in jsonObj) {
        if (jsonObj.hasOwnProperty(key)) {
            const value = jsonObj[key];

            if (typeof value === 'string') {
                adaptedItem[key] = { S: value };
            } else if (typeof value === 'number') {
                adaptedItem[key] = { N: value.toString() };
            } else {
                console.warn(`Unsupported data type for attribute "${key}": ${typeof value}`);
            }
        }
    }

    return { PutRequest: { Item: adaptedItem } };
};
