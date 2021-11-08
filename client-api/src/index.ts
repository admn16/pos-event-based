import express from "express";
import { Kafka, logLevel } from "kafkajs";

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
  await producer.connect();
  await producer.send({
    topic: "order-created",
    messages: [
      {
        value: JSON.stringify(body),
      },
    ],
  });

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
