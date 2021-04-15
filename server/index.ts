import cors from "cors";
import express, { Request, Response } from "express";
import { bootstrapDB } from "./database/db";
import { getOrder } from "./order";

// init db
bootstrapDB();
// config express
const app = express();
const PORT = 8000;
app.use(cors());
app.use(express.urlencoded());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.post("/print-order", (req: Request, res: Response) => {
  console.log(req.body.orders);
  getOrder(req.body.orderId, req.body.orders);
  // printText("from express");
  res.send("Express reponse");
});

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});
