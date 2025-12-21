-- ============================================
-- ATUALIZAÇÃO: Sistema de Orçamentos
-- Data: 16 de dezembro de 2025
-- Descrição: Adiciona campos para gerenciamento completo de orçamentos
-- ============================================

USE codigo1615admin_solinelson_db;

-- Adicionar novos campos na tabela budget_requests
ALTER TABLE budget_requests
    ADD COLUMN email VARCHAR(255) COMMENT 'Email do cliente para notificações' AFTER phone,
    ADD COLUMN budget_value DECIMAL(10,2) COMMENT 'Valor do orçamento em reais' AFTER description,
    ADD COLUMN is_approved BOOLEAN DEFAULT FALSE COMMENT 'Se o orçamento foi aprovado pelo cliente' AFTER status,
    ADD COLUMN execution_date DATE COMMENT 'Data agendada para execução do serviço' AFTER is_approved,
    ADD COLUMN budget_sent_at TIMESTAMP NULL COMMENT 'Data de envio do orçamento' AFTER execution_date,
    ADD COLUMN approved_at TIMESTAMP NULL COMMENT 'Data de aprovação do cliente' AFTER budget_sent_at,
    ADD COLUMN notes TEXT COMMENT 'Observações internas sobre o orçamento' AFTER approved_at;

-- Adicionar índices para melhor performance
ALTER TABLE budget_requests
    ADD INDEX idx_email (email),
    ADD INDEX idx_is_approved (is_approved),
    ADD INDEX idx_execution_date (execution_date);

-- Atualizar o enum de status para incluir novos estados
ALTER TABLE budget_requests 
    MODIFY COLUMN status ENUM('pending', 'contacted', 'budgeted', 'approved', 'rejected', 'completed') DEFAULT 'pending' COMMENT 'Status da solicitação';

-- ============================================
-- TABELA: email_logs
-- Descrição: Registro de emails enviados pelo sistema
-- ============================================

CREATE TABLE IF NOT EXISTS email_logs (
    -- Identificação
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'ID único do log',
    
    -- Relacionamento
    budget_request_id INT UNSIGNED COMMENT 'ID da solicitação de orçamento relacionada',
    
    -- Dados do Email
    recipient_email VARCHAR(255) NOT NULL COMMENT 'Email do destinatário',
    recipient_name VARCHAR(255) COMMENT 'Nome do destinatário',
    subject VARCHAR(500) NOT NULL COMMENT 'Assunto do email',
    email_type ENUM('budget_sent', 'budget_approved', 'budget_rejected', 'service_scheduled', 'service_completed') COMMENT 'Tipo de email enviado',
    
    -- Status
    status ENUM('sent', 'failed', 'pending') DEFAULT 'pending' COMMENT 'Status do envio',
    error_message TEXT COMMENT 'Mensagem de erro se houver',
    
    -- Timestamps
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Data e hora do envio',
    
    -- Índices
    INDEX idx_budget_request (budget_request_id),
    INDEX idx_recipient_email (recipient_email),
    INDEX idx_email_type (email_type),
    INDEX idx_status (status),
    INDEX idx_sent_at (sent_at),
    
    -- Foreign Key
    FOREIGN KEY (budget_request_id) REFERENCES budget_requests(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Log de emails enviados pelo sistema';

-- Confirmar alterações
SELECT 'Banco de dados atualizado com sucesso!' AS message;
