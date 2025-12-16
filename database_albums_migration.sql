-- ============================================
-- MIGRAÇÃO: Sistema de Álbuns com Múltiplas Fotos
-- Data: 16/12/2025
-- ============================================

USE codigo1615admin_solinelson_db;

-- 1. Renomear tabela antiga (backup)
RENAME TABLE gallery_items TO gallery_items_old;

-- 2. Criar tabela de Álbuns
CREATE TABLE albums (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL COMMENT 'Título do álbum',
    description TEXT COMMENT 'Descrição do álbum/trabalho',
    main_photo_id INT UNSIGNED COMMENT 'ID da foto principal',
    display_order INT UNSIGNED DEFAULT 0 COMMENT 'Ordem de exibição',
    is_featured BOOLEAN DEFAULT FALSE COMMENT 'Álbum em destaque',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_display_order (display_order),
    INDEX idx_featured (is_featured)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Álbuns de fotos';

-- 3. Criar tabela de Fotos do Álbum
CREATE TABLE album_photos (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    album_id INT UNSIGNED NOT NULL COMMENT 'ID do álbum',
    url TEXT NOT NULL COMMENT 'URL da foto',
    title VARCHAR(255) COMMENT 'Legenda da foto',
    display_order INT UNSIGNED DEFAULT 0 COMMENT 'Ordem dentro do álbum',
    file_size INT UNSIGNED COMMENT 'Tamanho em bytes',
    mime_type VARCHAR(100) COMMENT 'Tipo MIME',
    width INT UNSIGNED COMMENT 'Largura da imagem',
    height INT UNSIGNED COMMENT 'Altura da imagem',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE,
    INDEX idx_album_order (album_id, display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Fotos dos álbuns';

-- 4. Adicionar FK para foto principal (após criar album_photos)
ALTER TABLE albums 
    ADD CONSTRAINT fk_main_photo 
    FOREIGN KEY (main_photo_id) REFERENCES album_photos(id) ON DELETE SET NULL;

-- 5. Migrar dados antigos (criar álbuns a partir das fotos antigas)
INSERT INTO albums (title, description, display_order, created_at)
SELECT 
    title,
    'Migrado do sistema antigo',
    display_order,
    created_at
FROM gallery_items_old;

-- 6. Migrar fotos para album_photos
INSERT INTO album_photos (album_id, url, title, display_order, created_at)
SELECT 
    a.id,
    g.url,
    g.title,
    0,
    g.created_at
FROM gallery_items_old g
JOIN albums a ON a.title = g.title AND a.created_at = g.created_at;

-- 7. Atualizar main_photo_id nos álbuns
UPDATE albums a
JOIN album_photos p ON p.album_id = a.id
SET a.main_photo_id = p.id
WHERE p.display_order = 0
LIMIT 1;

-- 8. View para listar álbuns com foto principal
CREATE OR REPLACE VIEW v_albums_with_main_photo AS
SELECT 
    a.id,
    a.title,
    a.description,
    a.display_order,
    a.is_featured,
    p.url as main_photo_url,
    p.width as main_photo_width,
    p.height as main_photo_height,
    (SELECT COUNT(*) FROM album_photos WHERE album_id = a.id) as photo_count,
    a.created_at,
    a.updated_at
FROM albums a
LEFT JOIN album_photos p ON p.id = a.main_photo_id
ORDER BY a.display_order, a.created_at DESC;

-- 9. Stored Procedure: Criar álbum com fotos
DELIMITER $$

DROP PROCEDURE IF EXISTS sp_create_album$$

CREATE PROCEDURE sp_create_album(
    IN p_title VARCHAR(255),
    IN p_description TEXT,
    IN p_photos JSON,
    IN p_main_photo_index INT,
    OUT p_album_id INT
)
BEGIN
    DECLARE v_photo_id INT;
    DECLARE v_index INT DEFAULT 0;
    DECLARE v_url TEXT;
    DECLARE v_photo_title VARCHAR(255);
    DECLARE v_width INT;
    DECLARE v_height INT;
    
    -- Iniciar transação
    START TRANSACTION;
    
    -- Criar álbum
    INSERT INTO albums (title, description, display_order)
    VALUES (p_title, p_description, 0);
    
    SET p_album_id = LAST_INSERT_ID();
    
    -- Inserir fotos do JSON
    WHILE v_index < JSON_LENGTH(p_photos) DO
        SET v_url = JSON_UNQUOTE(JSON_EXTRACT(p_photos, CONCAT('$[', v_index, '].url')));
        SET v_photo_title = JSON_UNQUOTE(JSON_EXTRACT(p_photos, CONCAT('$[', v_index, '].title')));
        SET v_width = JSON_EXTRACT(p_photos, CONCAT('$[', v_index, '].width'));
        SET v_height = JSON_EXTRACT(p_photos, CONCAT('$[', v_index, '].height'));
        
        INSERT INTO album_photos (album_id, url, title, width, height, display_order)
        VALUES (p_album_id, v_url, v_photo_title, v_width, v_height, v_index);
        
        -- Se for a foto principal
        IF v_index = p_main_photo_index THEN
            SET v_photo_id = LAST_INSERT_ID();
        END IF;
        
        SET v_index = v_index + 1;
    END WHILE;
    
    -- Atualizar foto principal
    UPDATE albums SET main_photo_id = v_photo_id WHERE id = p_album_id;
    
    COMMIT;
END$$

DELIMITER ;

-- 10. Dados iniciais de teste (opcional)
-- Descomente se quiser criar álbuns de exemplo

/*
CALL sp_create_album(
    'Reforma Residencial - Casa Azul',
    'Reforma completa de residência com 3 quartos',
    '[
        {"url": "https://picsum.photos/800/600?random=1", "title": "Fachada", "width": 800, "height": 600},
        {"url": "https://picsum.photos/800/600?random=2", "title": "Sala", "width": 800, "height": 600},
        {"url": "https://picsum.photos/800/600?random=3", "title": "Cozinha", "width": 800, "height": 600}
    ]',
    0,
    @album_id
);
*/

-- Fim da migração
SELECT 'Migração concluída com sucesso!' as status;
