CREATE TABLE IF NOT EXISTS sql_log (
    id SERIAL PRIMARY KEY,
    table_name varchar(255) NOT NULL,
    operation_type varchar(255) NOT NULL,                   -- e.g., INSERT, UPDATE, DELETE
    previous_state JSON CHECK (JSON_VALID(previous_state)), -- JSON to save previous state
    new_state JSON CHECK (JSON_VALID(new_state)),           -- JSON to save new state
    log_metadata JSON CHECK (JSON_VALID(log_metadata)),     -- JSON to save log metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
