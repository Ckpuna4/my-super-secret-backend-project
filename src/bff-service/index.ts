import express from "express";
import dotenv from "dotenv";
import { createProxyMiddleware } from "http-proxy-middleware";

dotenv.config();

const app = express();
const PORT = 3000;

app.use("/cart-api", createProxyMiddleware({
    target: process.env.CART_API,
    changeOrigin: true,
    pathRewrite: {'^/cart-api' : ''}
}));

app.use("/product-api", createProxyMiddleware({
    target: process.env.PRODUCT_API,
    changeOrigin: true,
    pathRewrite: {'^/product-api' : ''}
}));

app.use("/import-api", createProxyMiddleware({
    target: process.env.IMPORT_API,
    changeOrigin: true,
    pathRewrite: {'^/import-api' : ''}
}));

app.use((req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ statusCode: 502, message: "Cannot process request" }));
});

app.listen(PORT, () => {
    console.log(`Proxy is running on http://localhost:${PORT}`);
});
