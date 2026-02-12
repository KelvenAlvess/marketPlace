# 🛒 MarketPlace Enterprise

![Java](https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.4-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-3.12-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)

Um sistema de E-commerce/Marketplace Fullstack de alto desempenho, focado em escalabilidade, segurança e consistência de dados. O projeto utiliza uma arquitetura baseada em microsserviços (modular), mensageria assíncrona e containerização completa.

---

## 🚀 Funcionalidades Principais

### 🔒 Segurança & Autenticação
- **Autenticação Stateless:** Implementação via **JWT (JSON Web Token)** com Spring Security.
- **RBAC (Role-Based Access Control):** Controle granular de permissões para `BUYER`, `SELLER` e `ADMIN`.
- **Proteção Anti-Fraude:** Validação de assinatura HMAC-SHA256 nos Webhooks de pagamento.
- **CORS Dinâmico:** Configuração flexível para ambientes de produção e desenvolvimento.

### 💰 Pagamentos & Checkout
- **Integração Mercado Pago:** Suporte a Cartão de Crédito (com tokenização segura) e PIX.
- **Idempotência:** Tratamento de chaves de idempotência para evitar duplicidade de cobranças.
- **Webhooks Seguros:** Processamento assíncrono de confirmação de pagamento com validação de origem.
- **Carrinho Persistente:** UX otimizada com persistência local (`localStorage`) e sincronização com backend.

### ⚙️ Engenharia de Software
- **Controle de Concorrência:** Uso de **Optimistic Locking (`@Version`)** para evitar venda de estoque sem saldo.
- **Mensageria Assíncrona:** Uso de **RabbitMQ** para desacoplar o fluxo de pagamento do envio de notificações/emails.
- **Database Migrations:** Versionamento de banco de dados com **Flyway**.
- **Infraestrutura:** Ambiente de desenvolvimento totalmente dockerizado (`docker-compose`).

---

## 🛠️ Tech Stack

### Backend
- **Linguagem:** Java 21
- **Framework:** Spring Boot 3.4.1
- **Dados:** Spring Data JPA (Hibernate), PostgreSQL 16
- **Mensageria:** RabbitMQ
- **Validação:** Bean Validation (Jakarta Validation)
- **Doc:** Swagger / OpenAPI 3

### Frontend
- **Framework:** React.js (Vite)
- **Estilização:** Tailwind CSS
- **Gerenciamento de Estado:** Context API
- **HTTP Client:** Axios
- **Integração:** SDK Mercado Pago React

---

## 📦 Como Rodar o Projeto

### Pré-requisitos
- Docker & Docker Compose instalados.
- Node.js 18+ (caso queira rodar o front fora do Docker).
- Java 21 (caso queira rodar o back fora do Docker).

### Passo 1: Configurar Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto com as seguintes chaves (exemplo):

```properties
# Banco de Dados
DB_NAME=marketplace
DB_USER=postgres
DB_PASSWORD=password

# JWT
JWT_SECRET=sua_chave_secreta_super_segura_base64
JWT_EXPIRATION=86400000

# RabbitMQ
RABBITMQ_USER=guest
RABBITMQ_PASS=guest

# Mercado Pago (Credenciais de Teste/Prod)
MP_ACCESS_TOKEN=TEST-seu-access-token
MP_WEBHOOK_SECRET=sua-chave-webhook-secret-key

# Frontend
VITE_API_URL=http://localhost:8081/api
VITE_MP_PUBLIC_KEY=TEST-sua-public-key

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000
