DELIMITER //

CREATE PROCEDURE pedido_insert_random_data(IN iterations INT)
BEGIN
  DECLARE counter INT DEFAULT 0;

  WHILE counter < iterations DO
    INSERT INTO pedido (nome, descricao, preco, status, created_at, updated_at, deleted_at)
    VALUES
      (CONCAT('Nome', FLOOR(RAND() * 1000)), 'Descrição random', RAND() * 100, FLOOR(RAND() * 2) + 1, NOW(), NULL, NULL);
      
    SET counter = counter + 1;
  END WHILE;
END //

DELIMITER ;