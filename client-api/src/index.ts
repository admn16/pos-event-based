import express from "express";
import { Kafka, logLevel } from "kafkajs";
import { coreReq } from "./core-req";

const kafka = new Kafka({
  clientId: "my-app",
  brokers: ["kafka:9092"],
  logLevel: logLevel.ERROR,
});

const producer = kafka.producer();

const PORT = process.env.PORT || 4000;

const app = express();
app.use(express.json());

app.post("/order", async ({ body }, res) => {
  try {
    // TODO: Schema validation before calling Core API
    await coreReq.post("/order", {
      ...body,
    });

  } catch (error) {
    console.error(error);
  }

  res.send({
    success: true,
  });
});

app.get("/", (req, res) => {
  res.send({
    test: "Client API",
  });
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
