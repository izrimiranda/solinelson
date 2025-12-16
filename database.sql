-- ============================================
-- SOLINELSON - MARIDO DE ALUGUEL
-- Database Schema
-- ============================================
-- Host: 205.172.59.146
-- Porta: 3306
-- Banco: codigo1615admin_solinelson_db
-- Usuário: codigo1615admin_solinelsonadmin
-- Senha: VTx}*qmcN1=uLMGh
-- Data de Criação: 16 de dezembro de 2025
-- ============================================

-- Selecionar o banco de dados
USE codigo1615admin_solinelson_db;

-- ============================================
-- TABELA: budget_requests
-- Descrição: Armazena as solicitações de orçamento dos clientes
-- ============================================

DROP TABLE IF EXISTS budget_requests;

CREATE TABLE budget_requests (
    -- Identificação
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'ID único da solicitação',
    
    -- Dados do Cliente
    name VARCHAR(255) NOT NULL COMMENT 'Nome completo do cliente',
    phone VARCHAR(20) NOT NULL COMMENT 'Telefone do cliente (WhatsApp)',
    
    -- Dados do Serviço
    service_type VARCHAR(255) NOT NULL COMMENT 'Tipo de serviço solicitado',
    description TEXT COMMENT 'Descrição detalhada do serviço',
    service_date DATE COMMENT 'Data desejada para o serviço',
    
    -- Endereço (armazenado como JSON para flexibilidade)
    address_json JSON COMMENT 'Endereço completo em formato JSON',
    
    -- Campos individuais do endereço (para queries SQL mais fáceis)
    cep VARCHAR(10) COMMENT 'CEP do endereço',
    street VARCHAR(255) COMMENT 'Rua do endereço',
    number VARCHAR(50) COMMENT 'Número do endereço',
    complement VARCHAR(255) COMMENT 'Complemento do endereço',
    neighborhood VARCHAR(255) COMMENT 'Bairro',
    city VARCHAR(255) COMMENT 'Cidade',
    state VARCHAR(2) COMMENT 'Estado (sigla)',
    
    -- Status e Controle
    status ENUM('pending', 'contacted') DEFAULT 'pending' COMMENT 'Status da solicitação',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Data e hora de criação',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Data e hora da última atualização',
    
    -- Índices para melhor performance
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_phone (phone),
    INDEX idx_city_state (city, state)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Solicitações de orçamento dos clientes';

-- ============================================
-- TABELA: gallery_items
-- Descrição: Armazena as fotos da galeria de trabalhos
-- ============================================

DROP TABLE IF EXISTS gallery_items;

CREATE TABLE gallery_items (
    -- Identificação
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'ID único da foto',
    
    -- Dados da Foto
    title VARCHAR(255) NOT NULL COMMENT 'Título/descrição da foto',
    url TEXT NOT NULL COMMENT 'URL da imagem (pode ser externa ou base64)',
    
    -- Organização (para futuras funcionalidades)
    display_order INT UNSIGNED DEFAULT 0 COMMENT 'Ordem de exibição na galeria',
    is_featured BOOLEAN DEFAULT FALSE COMMENT 'Se a foto está em destaque',
    
    -- Metadados
    file_size INT UNSIGNED COMMENT 'Tamanho do arquivo em bytes',
    mime_type VARCHAR(100) COMMENT 'Tipo MIME da imagem',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Data e hora de criação',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Data e hora da última atualização',
    
    -- Índices
    INDEX idx_display_order (display_order),
    INDEX idx_is_featured (is_featured),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Galeria de fotos dos trabalhos realizados';

-- ============================================
-- TABELA: admin_users (Opcional)
-- Descrição: Usuários administrativos do sistema
-- ============================================

DROP TABLE IF EXISTS admin_users;

CREATE TABLE admin_users (
    -- Identificação
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'ID único do usuário',
    
    -- Credenciais
    username VARCHAR(100) NOT NULL UNIQUE COMMENT 'Nome de usuário',
    password_hash VARCHAR(255) NOT NULL COMMENT 'Hash da senha (bcrypt)',
    
    -- Dados Pessoais
    full_name VARCHAR(255) COMMENT 'Nome completo do administrador',
    email VARCHAR(255) COMMENT 'Email do administrador',
    
    -- Controle de Acesso
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Se o usuário está ativo',
    last_login TIMESTAMP NULL COMMENT 'Data e hora do último login',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Data de criação do usuário',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Data de atualização',
    
    -- Índices
    INDEX idx_username (username),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Usuários administrativos do sistema';

-- ============================================
-- DADOS INICIAIS - Gallery Items
-- ============================================

INSERT INTO gallery_items (title, url, display_order, is_featured) VALUES
('Instalação Hidráulica', 'https://images.unsplash.com/photo-1581094794329-cd8119608f84?auto=format&fit=crop&w=400&q=80', 1, TRUE),
('Reforma de Banheiro', 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80', 2, TRUE),
('Pintura Residencial', 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=400&q=80', 3, FALSE),
('Reparo Elétrico', 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=400&q=80', 4, FALSE);

-- ============================================
-- DADOS INICIAIS - Admin User
-- ============================================
-- Usuário: admin
-- Senha: admin (Hash gerado com PASSWORD() do MySQL - em produção usar bcrypt)
-- IMPORTANTE: Em produção, usar bcrypt via PHP/backend

INSERT INTO admin_users (username, password_hash, full_name, email, is_active) VALUES
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrador Solinelson', 'admin@solinelson.com.br', TRUE);

-- Nota: O hash acima é 'password' (exemplo genérico)
-- Para senha 'admin', você deve gerar o hash no backend PHP usando:
-- password_hash('admin', PASSWORD_BCRYPT)

-- ============================================
-- VIEWS ÚTEIS
-- ============================================

-- View para relatório de solicitações
CREATE OR REPLACE VIEW v_budget_requests_summary AS
SELECT 
    status,
    COUNT(*) as total,
    DATE(created_at) as date
FROM budget_requests
GROUP BY status, DATE(created_at)
ORDER BY date DESC;

-- View para galeria ativa ordenada
CREATE OR REPLACE VIEW v_gallery_active AS
SELECT 
    id,
    title,
    url,
    display_order,
    is_featured,
    created_at
FROM gallery_items
ORDER BY display_order ASC, created_at DESC;

-- ============================================
-- STORED PROCEDURES ÚTEIS
-- ============================================

DELIMITER //

-- Procedure para criar nova solicitação de orçamento
CREATE PROCEDURE sp_create_budget_request(
    IN p_name VARCHAR(255),
    IN p_phone VARCHAR(20),
    IN p_service_type VARCHAR(255),
    IN p_description TEXT,
    IN p_service_date DATE,
    IN p_cep VARCHAR(10),
    IN p_street VARCHAR(255),
    IN p_number VARCHAR(50),
    IN p_complement VARCHAR(255),
    IN p_neighborhood VARCHAR(255),
    IN p_city VARCHAR(255),
    IN p_state VARCHAR(2)
)
BEGIN
    DECLARE address_json_data JSON;
    
    -- Montar JSON do endereço
    SET address_json_data = JSON_OBJECT(
        'cep', p_cep,
        'street', p_street,
        'number', p_number,
        'complement', p_complement,
        'neighborhood', p_neighborhood,
        'city', p_city,
        'state', p_state
    );
    
    -- Inserir solicitação
    INSERT INTO budget_requests (
        name, phone, service_type, description, service_date,
        address_json, cep, street, number, complement,
        neighborhood, city, state, status
    ) VALUES (
        p_name, p_phone, p_service_type, p_description, p_service_date,
        address_json_data, p_cep, p_street, p_number, p_complement,
        p_neighborhood, p_city, p_state, 'pending'
    );
    
    -- Retornar ID criado
    SELECT LAST_INSERT_ID() as request_id;
END //

-- Procedure para atualizar status da solicitação
CREATE PROCEDURE sp_update_request_status(
    IN p_id INT,
    IN p_status VARCHAR(20)
)
BEGIN
    UPDATE budget_requests 
    SET status = p_status 
    WHERE id = p_id;
    
    SELECT ROW_COUNT() as rows_affected;
END //

-- Procedure para adicionar item à galeria
CREATE PROCEDURE sp_add_gallery_item(
    IN p_title VARCHAR(255),
    IN p_url TEXT,
    IN p_display_order INT,
    IN p_is_featured BOOLEAN
)
BEGIN
    -- Se display_order não foi especificado, usar o próximo disponível
    IF p_display_order IS NULL OR p_display_order = 0 THEN
        SELECT COALESCE(MAX(display_order), 0) + 1 INTO p_display_order
        FROM gallery_items;
    END IF;
    
    INSERT INTO gallery_items (title, url, display_order, is_featured)
    VALUES (p_title, p_url, p_display_order, p_is_featured);
    
    SELECT LAST_INSERT_ID() as gallery_id;
END //

DELIMITER ;

-- ============================================
-- TRIGGERS
-- ============================================

DELIMITER //

-- Trigger para validar telefone ao inserir/atualizar
CREATE TRIGGER trg_validate_phone_before_insert
BEFORE INSERT ON budget_requests
FOR EACH ROW
BEGIN
    -- Remover caracteres não numéricos do telefone (apenas dígitos)
    SET NEW.phone = REGEXP_REPLACE(NEW.phone, '[^0-9]', '');
    
    -- Validar se tem pelo menos 10 dígitos (DDD + número)
    IF CHAR_LENGTH(NEW.phone) < 10 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Telefone inválido: deve conter pelo menos 10 dígitos';
    END IF;
END //

CREATE TRIGGER trg_validate_phone_before_update
BEFORE UPDATE ON budget_requests
FOR EACH ROW
BEGIN
    IF NEW.phone != OLD.phone THEN
        SET NEW.phone = REGEXP_REPLACE(NEW.phone, '[^0-9]', '');
        
        IF CHAR_LENGTH(NEW.phone) < 10 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Telefone inválido: deve conter pelo menos 10 dígitos';
        END IF;
    END IF;
END //

DELIMITER ;

-- ============================================
-- GRANTS (Permissões)
-- ============================================

-- Garantir que o usuário da aplicação tenha as permissões necessárias
-- NOTA: Comandos GRANT exigem privilégios de administrador, executar manualmente se necessário
-- GRANT SELECT, INSERT, UPDATE, DELETE ON codigo1615admin_solinelson_db.* TO 'codigo1615admin_solinelsonadmin'@'%';
-- GRANT EXECUTE ON codigo1615admin_solinelson_db.* TO 'codigo1615admin_solinelsonadmin'@'%';
-- FLUSH PRIVILEGES;

-- ============================================
-- QUERIES ÚTEIS PARA TESTES
-- ============================================

-- Listar todas as solicitações pendentes
-- SELECT * FROM budget_requests WHERE status = 'pending' ORDER BY created_at DESC;

-- Listar todas as solicitações de hoje
-- SELECT * FROM budget_requests WHERE DATE(created_at) = CURDATE();

-- Estatísticas de solicitações
-- SELECT 
--     status,
--     COUNT(*) as total,
--     DATE(created_at) as date
-- FROM budget_requests 
-- GROUP BY status, DATE(created_at);

-- Listar galeria ordenada
-- SELECT * FROM gallery_items ORDER BY display_order ASC, is_featured DESC;

-- Buscar solicitações por cidade
-- SELECT * FROM budget_requests WHERE city LIKE '%Pedro Leopoldo%';

-- ============================================
-- BACKUP E MANUTENÇÃO
-- ============================================

-- Para fazer backup do banco:
-- mysqldump -h 205.172.59.146 -u codigo1615admin_solinelsonadmin -p codigo1615admin_solinelson_db > backup_solinelson_$(date +%Y%m%d).sql

-- Para restaurar do backup:
-- mysql -h 205.172.59.146 -u codigo1615admin_solinelsonadmin -p codigo1615admin_solinelson_db < backup_solinelson_YYYYMMDD.sql

-- ============================================
-- FIM DO SCRIPT
-- ============================================

-- Script criado com sucesso!
-- Próximos passos:
-- 1. Executar este script no MySQL
-- 2. Criar arquivos PHP para API (api/get_requests.php, api/add_request.php, etc.)
-- 3. Atualizar o index.tsx para usar as APIs reais ao invés do MockService
-- 4. Configurar autenticação segura no backend
