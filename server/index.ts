import cors from "cors";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
// set up enviroment variables
dotenv.config();
import { bootstrapDB, saveProducts } from "./database/db";
import { getOrder } from "./order";
import { printOrder } from "./printer/printer";
import { getProducts } from "./rest";
import { getOrderToPrint } from "./state";

// init db
bootstrapDB();
// config express
const app = express();
const PORT = Number(process.env.SERVER_PORT!);
app.use(cors());
app.use(express.urlencoded());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("printer server is up and running ...");
});

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

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});
