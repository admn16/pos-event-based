import 'reflect-metadata'
import express from "express";
import { Kafka, logLevel } from "kafkajs";

const kafka = new Kafka({
  clientId: "my-app",
  brokers: ["kafka:9092"],
  logLevel: logLevel.ERROR,
});

const PORT = process.env.PORT || 4000;

const app = express();

app.get("/", async (req, res) => {
  res.send({
    test: "CORE API",
  });
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
