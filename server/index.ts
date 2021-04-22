import cors from "cors";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import { bootstrapDB, saveProducts } from "./database/db";
import { getOrder } from "./order";
import { printOrder } from "./printer/printer";
import { getProducts } from "./rest";
import { getOrderToPrint } from "./state";

// set up enviroment variables
dotenv.config();
// init db
bootstrapDB();
// config express
const app = express();
const PORT = 8000;
app.use(cors());
app.use(express.urlencoded());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("printer server is up and running ...");
});

app.post("/print-order", async (req: Request, res: Response) => {
  const order = await getOrder(req.body.orderId, req.body.orders);
  const orderToPrint = await getOrderToPrint(order);
  printOrder(orderToPrint);
  res.send("Express reponse");
});

app.post("/update-products", async (req: Request, res: Response) => {
  // TODO: check if response is a valid code 200
  const products = await getProducts();
  await saveProducts(products);
  res.send("product catalog updated");
});

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});
