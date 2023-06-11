type Product = {
    id: string;
    description: string;
    price: number;
    title: string;
    count: number;
}

export const mockProducts: Product[] = [
    {
        "id": "3aeb4f83-49da-4d78-9289-03f07a5a94c2",
        "description": "Short Product Description1",
        "price": 24,
        "title": "ProductOne",
        "count": 1
    },
    {
        "id": "8c2b526d-6c75-4ef5-a0e9-df9a894fb9d3",
        "description": "Short Product Description2",
        "price": 48,
        "title": "ProductTwo",
        "count": 3
    },
    {
        "id": "b5d55797-1f7a-4c26-9d2a-58a29313c7f1",
        "description": "Short Product Description3",
        "price": 42,
        "title": "ProductThree",
        "count": 0
    },
    {
        "id": "9e13a1e0-2bc0-4e59-94a3-4c1f6f7b7143",
        "description": "Short Product Description4",
        "price": 48,
        "title": "ProductFour",
        "count": 5
    },
    {
        "id": "f6235d75-5ae1-4de1-96d0-dcbb6f82362e",
        "description": "Short Product Description5",
        "price": 93,
        "title": "ProductFive",
        "count": 2
    }
];
const mapById = new Map<string, Product>();

for (const product of mockProducts) {
    mapById.set(product.id, product);
}

export const mockMapOfProducts = mapById;

