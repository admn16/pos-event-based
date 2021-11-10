import "reflect-metadata";
import express from "express";
import { Kafka, logLevel } from "kafkajs";
import { createConnection, getManager } from "typeorm";
import { Order, ORDER_STATUS } from "./entity/Order";

const kafka = new Kafka({
  clientId: "my-app",
  brokers: ["kafka:9092"],
  logLevel: logLevel.ERROR,
});

const PORT = process.env.PORT || 4000;

const app = express();

app.get("/", async (req, res) => {
  res.send({
    test: "EATS365 API",
  });
});

async function consumeKafka() {
  const consumer = kafka.consumer({
    groupId: "eats365",
  });
  await consumer.connect();
  await consumer.subscribe({
    topic: "order-created",
  });

  consumer.run({
    eachMessage: async ({ message }) => {
      const payload = JSON.parse(message.value?.toString() || "") as any;
      console.log(payload)
      const order = new Order();
      order.id = payload.id;
      order.client_number = payload.client_number;
      order.client_name = payload.client_name;
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

      // Emulating API call - "Eats processes the order"
      const orderId = await new Promise(async (resolve) => {
        setTimeout(() => {
          resolve(savedOrder.id);
        }, 4000);
      });

      await entityManager.update(Order, orderId, {
        status: ORDER_STATUS.ACCEPTED,
      });

      const producer = kafka.producer();
      await producer.connect();
      producer.send({
        topic: "order-accepted",
        messages: [
          {
            value: JSON.stringify({
              id: orderId,
            }),
          },
        ],
      });
    },
  });
}

createConnection({
  type: "postgres",
  host: "eats365-db",
  port: 5432,
  username: "user",
  password: "eats365",
  database: "eats365",
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
  .then(async () => {
    await consumeKafka();
    app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
  })
  .catch((err) => console.error(err));
