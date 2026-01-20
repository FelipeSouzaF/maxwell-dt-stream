import { createClient } from "redis";
import { v4 as uuidv4 } from "uuid";

const redis = createClient({
  url: "redis://localhost:6379",
});

redis.on("error", (err) => console.error("Redis Client Error", err));

await redis.connect();

console.log("Consumer conectado ao Redis. Aguardando eventos do Maxwell...");
console.log("Para simular eventos, execute comandos SQL no banco de dados.");
console.log("Os eventos aparecerão aqui via stdout do Maxwell.\n");

// Função para processar eventos do Maxwell vindos do stdin
process.stdin.on("data", async (data) => {
  try {
    const lines = data
      .toString()
      .split("\n")
      .filter((line) => line.trim());

    for (const line of lines) {
      try {
        const event = JSON.parse(line);

        const {
          database,
          table,
          type,
          data: currentData = {},
          old: oldData = {},
        } = event;

        const logEntry = {
          id: uuidv4(),
          database,
          table,
          operation: type,
          current_data: JSON.stringify(currentData),
          old_data: JSON.stringify(oldData),
          timestamp: new Date().toISOString(),
        };

        // Salva no Redis
        await redis.hSet(`log:${logEntry.id}`, logEntry);

        // Adiciona à lista de logs
        await redis.lPush("logs:all", logEntry.id);

        console.log("✓ Evento processado:", {
          id: logEntry.id,
          database,
          table,
          operation: type,
        });
      } catch (parseError) {
        // Ignora linhas que não são JSON válido
        if (line.trim().length > 0) {
          console.log("Info:", line);
        }
      }
    }
  } catch (error) {
    console.error("Erro ao processar eventos:", error);
  }
});

process.on("SIGINT", async () => {
  console.log("\nEncerrando consumer...");
  await redis.quit();
  process.exit(0);
});
