# Technical Overview

## Objetivo del sistema

`telegram-lead-qualifier` recibe leads desde Telegram en texto libre, los analiza con un proveedor LLM, contrasta el resultado contra un Perfil de Cliente Ideal (ICP) configurable y persiste la decision con trazabilidad. El resultado se puede sincronizar en Google Sheets y el bot responde al usuario con la clasificacion.

## Arquitectura general

```
┌──────────────────────────────────────────────────────────────┐
│                        Frontend (React + Vite)               │
│  Panel administrativo para gestionar bots, ICPs, prompts,    │
│  proveedores LLM y revision de leads.                        │
│  Consume API REST del backend via axios.                     │
└──────────┬───────────────────────────────────────────────────┘
           │ HTTP (JSON)
           ▼
┌──────────────────────────────────────────────────────────────┐
│                   Backend (Django / DRF)                      │
│                                                              │
│  ┌─────────┐ ┌────────┐ ┌──────┐ ┌─────┐ ┌──────┐ ┌─────┐ │
│  │Accounts │ │ Bots   │ │ ICPs │ │Leads│ │ LLM  │ │Sheets│ │
│  └─────────┘ └────────┘ └──────┘ └─────┘ └──────┘ └─────┘ │
│  ┌─────────┐ ┌──────┐                                       │
│  │Telegram │ │Audit │                                       │
│  └─────────┘ └──────┘                                       │
└──────┬──────────────────────┬───────────────────────────────┘
       │                      │
       ▼                      ▼
┌──────────────┐    ┌──────────────────┐
│  PostgreSQL  │    │  Redis + Celery  │
│  Datos       │    │  Cola / Async    │
│  principales │    │  procesamiento   │
└──────────────┘    └──────────────────┘
```

## Separacion backend / frontend

- **Backend**: API REST pura. Toda la logica de negocio, modelos, validaciones e integraciones externas residen aca. No renderiza HTML (salvo Django Admin).
- **Frontend**: SPA en React + Vite. Consume la API, maneja estado local y renderiza el panel administrativo. Sin logica de negocio critica.
- **Comunicacion**: JSON sobre HTTP. CORS configurado para permitir el origen del frontend.

## Modulos backend

### `apps.core`
Utilidades compartidas: paginacion (`DefaultPageNumberPagination`), respuestas estandar, excepciones personalizadas, permisos base y tareas comunes de Celery.

### `apps.accounts`
Modelo `User` (heredado de Django AbstractUser), login JWT con SimpleJWT, refresh token, perfil actual y endpoints CRUD de usuarios protegidos para administradores.

### `apps.bots`
Modelo `Bot` con nombre, username de Telegram, token, secreto de webhook, estado activo/inactivo, ICP por defecto, proveedor LLM y configuracion de Sheets. Si el panel no envia `webhook_secret`, el backend usa `TELEGRAM_WEBHOOK_SECRET`.

### `apps.icps`
Modelos `ICP` (reglas, industrias, regiones, intereses) y `PromptTemplate` (prompt del sistema, esquema JSON de salida esperado, version). Asociacion many-to-many entre ICPs y prompts.

### `apps.leads`
Modelo `Lead` con texto original, chat/message id de Telegram, resultado de cualificacion, confianza, razon, datos extraidos por el LLM (JSONField), metadata de tokens/costo y estado de sincronizacion con Sheets. Servicio de procesamiento que orquesta LLM, persistencia y append a Sheets.

### `apps.llm`
Abstraccion de proveedores LLM via clase base (`BaseLLMProvider`). Proveedores concretos: `MockProvider` (para tests/desarrollo), `GroqProvider` (via API de Groq). Modelo `LLMProviderConfig` para configuracion persistente por proveedor.

### `apps.telegram`
Endpoint de webhook (`POST /api/telegram/webhook/`) con validacion de secreto compartido. Maneja comandos `/start`, `/help` y `/ayuda`; envia mensaje de bienvenida; confirma procesamiento; clasifica mensajes de texto como leads; y envia el resultado final por Telegram.

### `apps.sheets`
Modelo `SheetConfig` con spreadsheet_id, worksheet_name y credenciales de Service Account. Servicio de append real via Google Sheets API usando `google-auth`. El serializer de leads expone `sheet_url` para abrir rapidamente el spreadsheet desde el panel.

### `apps.audit`
Modelo `AuditLog` para trazabilidad de acciones del sistema: creacion, actualizacion, procesamiento de leads, errores, etc.

## Modulos frontend

- `layouts/DashboardLayout`: shell principal con navegacion lateral.
- `pages/DashboardPage`, `BotsPage`, `IcpsPage`, `PromptsPage`, `LeadsPage`, `LeadDetailPage`, `SettingsPage`: vistas del panel operativo.
- `api/client.ts`: cliente axios con baseURL desde variable de entorno.
- `config/env.ts`: lectura tipada de `VITE_API_BASE_URL`.
- `types/`: contratos TypeScript para `Bot`, `ICP`, `Lead`.

## Flujo Telegram → Backend → LLM → Sheets

```
1. Telegram → POST /api/telegram/webhook/ (payload JSON)
2. Backend valida TELEGRAM_WEBHOOK_SECRET
3. Resuelve Bot por `X-Telegram-Bot-Api-Secret-Token`
4. Extrae texto del lead del payload
5. Responde bienvenida si es comando de ayuda o si no hay texto clasificable
6. Obtiene ICP activo y PromptTemplate asociados al bot
7. Construye prompt completo (system + user)
8. Envia a LLM Provider (via interfaz abstracta)
9. Parse y valida respuesta JSON del LLM
10. Crea registro Lead con decision, confianza, razon
11. Si hay SheetConfig activa, escribe una fila via Google Sheets API
12. Actualiza `sheet_status` (`success`, `failed`, `skipped`, `pending`)
13. Envia respuesta de clasificacion al chat de Telegram
14. Retorna respuesta al webhook
```

## Diseño multi-bot

El modelo `Bot` permite registrar multiples bots de Telegram. La resolucion actual se hace por secreto de webhook: Telegram envia `X-Telegram-Bot-Api-Secret-Token` y el backend busca un bot activo con ese `webhook_secret`. Cada bot tiene su propia configuracion de ICP, proveedor LLM y Sheets.

## Diseño multi-ICP

El modelo `ICP` permite registrar multiples perfiles de cliente ideal. Un bot puede tener un ICP asociado. Los ICPs incluyen reglas en JSONField, lo que permite criterios flexibles (industria, region, tamaño, intereses, etc.).

## Diseño multi-provider LLM

El modulo `llm` esta diseñado con el patron Strategy:

- `BaseLLMProvider`: clase abstracta con metodo `analyze(text, icp, prompt) -> dict`.
- `MockProvider`: implementacion de prueba que retorna datos simulados.
- `GroqProvider`: implementacion real que consume la API de Groq.

Nuevos proveedores (OpenAI, Anthropic, Ollama, etc.) solo requieren implementar la interfaz y registrar la configuracion en `LLMProviderConfig`.

## Consideraciones de escalabilidad

- **Base de datos**: PostgreSQL con indices planeados en campos de busqueda frecuente (lead text, fecha, bot).
- **Cache**: Redis disponible para cache de configuraciones y rate limiting.
- **Async**: Celery configurado para procesamiento fuera del ciclo request-response; la sincronizacion de Sheets hoy ocurre inline y puede migrarse a tarea asincrona con reintentos.
- **API**: DRF con paginacion y serializacion eficiente; preparado para filtering, searching y ordering.
- **Frontend**: Vite con build optimizado; preparado para lazy loading de rutas.
- **Docker**: Servicios separados que permiten escalado independiente.

## Decisiones pendientes

- Reintentos y cola para sincronizaciones fallidas de Google Sheets.
- Cifrado de secretos persistidos en base de datos.
- Hosting gestionado vs VPS.
- Estrategia de backups.
- Estrategia de monitoreo y alertas.
- Versionado de prompts y evaluacion A/B.
- CI/CD: GitHub Actions, GitLab CI u otro.
