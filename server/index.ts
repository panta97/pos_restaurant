import cors from "cors";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
// set up enviroment variables
dotenv.config();
import { bootstrapDB, getAllOrders, getAllProducts, saveProducts } from "./database/db";
import { getOrder } from "./order";
import { printOrder } from "./printer/printer";
import { getProducts } from "./rest";
import { getOrderToPrint } from "./state";
import { toCamelCase } from "./utils";
import  path from "path";

// init db
bootstrapDB();
// config express
const app = express();
const PORT = Number(process.env.SERVER_PORT!);
app.use(cors());
app.use(express.urlencoded());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'static')));

// app.get("/", (req: Request, res: Response) => {
//   res.send("printer server is up and running ...");
// });

app.post("/print-order", async (req: Request, res: Response) => {
  const response = { msj: "" };
  try {
    const order = await getOrder(req.body.orderId, req.body.orders);
    const orderToPrint = await getOrderToPrint(order);
    await printOrder(orderToPrint);
    res.status(200);
    response.msj = "Printed successfully";
  } catch (err) {
    res.status(500);
    response.msj = err.message;
  }
  res.json(response);
});

app.post("/update-products", async (req: Request, res: Response) => {
  const response = { msj: "" };
  try {
    const products = await getProducts();
    await saveProducts(products);
    res.status(200);
    response.msj = "Products catalog successfully updated";
  } catch (err) {
    res.status(500);
    response.msj = err.message;
  }
  res.json(response);
});

app.get("/list-products", async(req: Request, res: Response) => {
  try {
    const products = await getAllProducts();
    res.status(200);
    res.json(toCamelCase(products));
  } catch (err) {
    res.status(500);
    const response = { msj: err.message };
    res.json(response);
  }
});

app.get("/list-orders", async(req: Request, res: Response) => {
  try {
    const orders = await getAllOrders();
    res.status(200);
    res.json(orders);
  } catch (err) {
    res.status(500);
    const response = { msj: err.message };
    res.json(response);
  }
});

// Handles any requests that don't match the ones above
app.get('*', (req: Request, res: Response) =>{
  res.sendFile(path.join(__dirname, 'static', 'index.html'));
  });

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});
