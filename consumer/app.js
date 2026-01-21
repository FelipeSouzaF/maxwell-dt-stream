import { createClient } from "redis";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config({ path: "../.env" });

// Configuração do MySQL
const mysqlConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_ROOT_USER,
  password: process.env.MYSQL_ROOT_PASSWORD,
  database: process.env.MYSQL_LOGS_DB,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Pool de conexões MySQL
const pool = mysql.createPool(mysqlConfig);

// Cliente dedicado para Pub/Sub (subscriber)
const subscriber = createClient({
  url: "redis://localhost:6379",
});

subscriber.on("error", (err) => console.error("Redis Subscriber Error", err));

// Conecta ambos os clientes
await subscriber.connect();

// Testa conexão MySQL
try {
  const connection = await pool.getConnection();
  console.log("✅ Conectado ao MySQL");
  connection.release();
} catch (error) {
  console.error("❌ Erro ao conectar no MySQL:", error.message);
  process.exit(1);
}

console.log("🚀 Consumer conectado ao Redis Pub/Sub");
console.log("📡 Aguardando eventos do Maxwell...");
console.log("💡 Execute comandos SQL no banco de dados para gerar eventos\n");

// Subscribe ao canal do Maxwell
// Por padrão, Maxwell publica no canal "maxwell"
const MAXWELL_CHANNEL = "maxwell";

await subscriber.subscribe(MAXWELL_CHANNEL, async (message) => {
  try {
    const event = JSON.parse(message);

    const {
      database,
      table,
      type,
      data: currentData = {},
      old: oldData = {},
      ts,
    } = event;

    const logEntry = {
      id: uuidv4(),
      database,
      table,
      operation: type,
      current_data: JSON.stringify(currentData),
      old_data: JSON.stringify(oldData),
      timestamp: ts
        ? new Date(ts * 1000).toISOString()
        : new Date().toISOString(),
      processed_at: new Date().toISOString(),
    };

    // Insere no MySQL na tabela sql_log
    try {
      const logMetadata = {
        database,
        event_timestamp: logEntry.timestamp,
        processed_at: logEntry.processed_at,
        log_id: logEntry.id,
      };

      await pool.execute(
        `INSERT INTO sql_log 
         (table_name, operation_type, previous_state, new_state, log_metadata) 
         VALUES (?, ?, ?, ?, ?)`,
        [
          table,
          type.toUpperCase(),
          JSON.stringify(oldData),
          JSON.stringify(currentData),
          JSON.stringify(logMetadata),
        ],
      );
    } catch (dbError) {
      console.error("❌ Erro ao inserir no MySQL:", dbError.message);
      throw dbError;
    }

    console.log("✅ Evento processado:", {
      id: logEntry.id,
      database,
      table,
      operation: type,
      timestamp: logEntry.timestamp,
    });
  } catch (error) {
    console.error("❌ Erro ao processar evento:", error);
    console.error("Mensagem recebida:", message);
  }
});

console.log(`✓ Inscrito no canal: ${MAXWELL_CHANNEL}\n`);

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n\n🛑 Encerrando consumer...");
  await subscriber.unsubscribe(MAXWELL_CHANNEL);
  await subscriber.quit();
  await pool.end();
  console.log("✓ Consumer encerrado com sucesso");
  process.exit(0);
});
