import { createClient } from "redis";

const publisher = createClient({
  url: "redis://localhost:6380",
});

const subscriber = publisher.duplicate();

publisher.on("error", (err) => {
  console.error("REDIS PUBLISHER ERROR:", err);
});

subscriber.on("error", (err) => {
  console.error("REDIS SUBSCRIBER ERROR:", err);
});

export const connectRedis = async () => {
  if (!publisher.isOpen) {
    await publisher.connect();
  }

  if (!subscriber.isOpen) {
    await subscriber.connect();
  }

  console.log("REDIS CONNECTED");
};

export const disconnectRedis = async () => {
  if (publisher.isOpen) {
    await publisher.quit();
  }

  if (subscriber.isOpen) {
    await subscriber.quit();
  }

  console.log("REDIS DISCONNECTED");
};

export { publisher, subscriber };
