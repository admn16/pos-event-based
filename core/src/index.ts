import "reflect-metadata";
import express from "express";
import { Kafka, logLevel } from "kafkajs";
import { createConnection, getManager } from "typeorm";
import cors from "cors";
import { Order, ORDER_STATUS } from "./entity/Order";

const kafka = new Kafka({
  clientId: "my-app",
  brokers: ["kafka:9092"],
  logLevel: logLevel.ERROR,
});

const PORT = process.env.PORT || 4000;

const app = express();
app.use(express.json());
app.use(cors());

app.post("/order", async (req, res) => {
  const payload: any = req.body;
  const order = new Order();
  order.client_number = payload.contact.number;
  order.client_name = payload.contact.name;
  order.cart_items = (payload.cart_items as any[]).map((x) => {
    return {
      id: "",
      product_id: x.product_id,
      quantity: x.quantity,
      remarks: x.remarks,
    };
  });
  order.status = ORDER_STATUS.CREATED;

  const entityManager = getManager();
  const savedOrder = await entityManager.save(order);

  const producer = kafka.producer();

  await producer.connect();
  await producer.send({
    topic: "order-created",
    messages: [
      {
        value: JSON.stringify(savedOrder),
      },
    ],
  });

  res.send({
    success: true,
  });
});

app.get("/", async (req, res) => {
  res.send({
    test: "CORE API",
  });
});

async function onOrderAccepted() {
  const consumer = kafka.consumer({
    groupId: "core-order-accepted",
  });
  await consumer.connect();
  await consumer.subscribe({
    topic: "order-accepted",
  });

  consumer.run({
    eachMessage: async ({ message }) => {
      const payload = JSON.parse(message.value?.toString() || "") as any;
      console.log(`\n\nON ORDER ACCEPTED\n\n ${payload.id}`);

      const manager = getManager();
      manager.update(Order, payload.id, {
        status: ORDER_STATUS.ACCEPTED,
      });
    },
  });
}


createConnection({
  type: "postgres",
  host: "core-db",
  port: 5432,
  username: "user",
  password: "core",
  database: "core",
  synchronize: true,
  logging: false,
  entities: ["src/entity/**/*.ts"],
  migrations: ["src/migration/**/*.ts"],
  subscribers: ["src/subscriber/**/*.ts"],
  cli: {
    entitiesDir: "src/entity",
    migrationsDir: "src/migration",
    subscribersDir: "src/subscriber",
  },
})
  .then(async (connection) => {
    onOrderAccepted();

    app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
  })
  .catch((err) => console.error(err));
