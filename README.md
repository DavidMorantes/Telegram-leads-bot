# telegram-lead-qualifier

Sistema de cualificacion de leads conectado a Telegram. Recibe mensajes de leads via webhook de Telegram, los analiza con un proveedor LLM (Groq en primera instancia), contrasta el resultado contra un Perfil de Cliente Ideal (ICP) configurable y registra la decision en Google Sheets. Incluye un panel administrativo React para gestionar bots, ICPs, prompts y revisar resultados.

## Stack

| Capa       | Tecnologia                                                    |
| ---------- | ------------------------------------------------------------- |
| Backend    | Python 3.12, Django 5.1, Django REST Framework 3.15          |
| Frontend   | React 18, TypeScript, Vite 5, TailwindCSS 3                   |
| Base datos | PostgreSQL 16                                                 |
| Cache/Cola | Redis 7 + Celery 5                                            |
| LLM        | Groq (proveedor inicial, abstraccion multi-provider)          |
| Infra      | Docker Compose, Caddy (produccion con HTTPS automatico)       |

## Arquitectura resumida

```
Telegram → Webhook → Backend DRF → LLM (Groq) → Lead + Decision → Google Sheets
                              ↑                        |
                         Panel Admin (React)    Auditoria (BD)
```

- El backend expone una API REST con viewsets, paginacion y permisos.
- El frontend consume la API y permite administrar bots, ICPs, prompts y revisar leads.
- Celery + Redis estan configurados para procesamiento asincrono futuro.
- Los proveedores LLM estan desacoplados via una interfaz base (strategy pattern).
- El bot responde en Telegram con bienvenida, instrucciones, estado de procesamiento y resultado.
- Google Sheets se sincroniza mediante Service Account y expone enlace directo desde el panel.

## Estructura del repositorio

```text
telegram-lead-qualifier/
├── backend/
│   ├── apps/
│   │   ├── accounts/       # Usuarios y autenticacion
│   │   ├── audit/          # Trazabilidad y log de acciones
│   │   ├── bots/           # Configuracion de bots Telegram
│   │   ├── core/           # Utilidades compartidas
│   │   ├── icps/           # Perfiles de cliente ideal (ICP)
│   │   ├── leads/          # Leads y resultados de cualificacion
│   │   ├── llm/            # Abstraccion multi-provider LLM
│   │   ├── sheets/         # Integracion Google Sheets
│   │   └── telegram/       # Webhook y logica Telegram
│   ├── config/
│   │   └── settings/       # base.py, local.py, production.py
│   ├── tests/
│   ├── Dockerfile
│   ├── entrypoint.sh
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/            # Cliente HTTP (axios)
│   │   ├── components/     # Componentes reutilizables
│   │   ├── config/         # Variables de entorno tipadas
│   │   ├── layouts/        # Layouts (DashboardLayout)
│   │   ├── pages/          # Paginas del panel
│   │   ├── styles/         # CSS / Tailwind
│   │   └── types/          # Tipos TypeScript
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.ts
├── docs/
│   ├── technical.md
│   ├── security.md
│   ├── user-manual.md
│   ├── delivery-checklist.md
│   ├── production-improvements.md
│   └── devops-review.md
├── scripts/
├── .env.example
├── .gitignore
├── Makefile
├── docker-compose.yml
└── README.md
```

## Requisitos

- Docker y Docker Compose (recomendado)
- Opcional para desarrollo local sin Docker:
  - Python 3.12
  - Node.js 20+
  - PostgreSQL 16
  - Redis 7

## Instalacion con Docker

```bash
# 1. Clonar y entrar
git clone <repo-url>
cd telegram-lead-qualifier

# 2. Copiar variables de entorno
cp .env.example .env
# Editar .env con tus claves reales (Groq, Telegram, Google Sheets)
# Nunca commitear .env ni credenciales JSON.

# 3. Construir y levantar
make build
make up

# 4. Migrar base de datos
make migrate

# 5. Crear superusuario
make createsuperuser

# 6. Abrir en navegador
# Backend:  http://localhost:8000/
# Frontend: http://localhost:5173/
# Admin:    http://localhost:8000/admin/
```

## Instalacion local (sin Docker)

```bash
# Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp ../.env.example ../.env  # editar con datos locales
python manage.py migrate
python manage.py runserver

# Frontend (otra terminal)
cd frontend
npm install
npm run dev
```

## Comandos utiles

```bash
make build           # Construir imagenes Docker
make up              # Levantar servicios en background
make down            # Detener servicios
make logs            # Ver logs en tiempo real
make migrate         # Ejecutar migraciones
make makemigrations  # Crear migraciones
make createsuperuser # Crear superusuario admin
make test            # Ejecutar tests
make lint            # Ejecutar ruff (Python)
make format          # Formatear codigo Python
make backend-shell   # Shell dentro del contenedor backend
make django-shell    # Shell interactivo de Django
```

## Endpoints iniciales

| Metodo | Ruta                        | Descripcion                    |
| ------ | --------------------------- | ------------------------------ |
| GET    | `/api/health/`              | Health check                   |
| GET    | `/api/auth/users/`          | Lista de usuarios              |
| GET    | `/api/bots/`                | Lista de bots Telegram         |
| GET    | `/api/icps/`                | Lista de ICPs                  |
| GET    | `/api/leads/`               | Lista de leads                 |
| DELETE | `/api/leads/{id}/`          | Elimina un lead                |
| POST   | `/api/telegram/webhook/`    | Webhook de Telegram            |
| GET    | `/api/llm/provider-configs/`| Proveedores LLM configurados   |
| GET    | `/api/sheets/configs/`      | Configuraciones Google Sheets  |

## Flujo esperado

1. El usuario escribe `/start`, `/help` o `/ayuda` y recibe instrucciones.
2. El usuario envia el texto completo del lead al bot de Telegram.
3. Telegram envia un webhook al backend (`POST /api/telegram/webhook/`) con `secret_token`.
4. Backend valida el secreto, resuelve el bot activo y extrae el texto.
5. El bot responde que esta procesando el lead.
6. El texto se envia al servicio LLM (Groq o mock) con el prompt e ICP asociados.
7. El LLM devuelve decision, confianza, razon y datos extraidos.
8. Se persiste un registro `Lead` con trazabilidad y metadata.
9. Si el bot tiene Google Sheets activo, se escribe una fila en la hoja y el estado queda `success`, `failed`, `skipped` o `pending`.
10. El bot responde al usuario con la clasificacion final.
11. El panel admin permite revisar, eliminar leads y abrir la Google Sheet directamente.

## Estado actual

Estado funcional actual:

- Autenticacion JWT para el panel administrativo.
- Backend modular con 9 apps Django.
- Modelos, serializers, viewsets y routers configurados.
- Abstraccion de proveedores LLM (base, mock, Groq).
- Webhook real de Telegram con validacion de secreto y respuestas al usuario.
- Configuracion editable de proveedores IA y Google Sheets desde el panel.
- Creacion, revision y eliminacion de leads.
- Escritura funcional en Google Sheets via Service Account.
- Enlace directo a la hoja desde lista y detalle de leads.
- Docker Compose de produccion con Caddy, backend, frontend, db, redis y celery worker.

## Proximas fases

- Workers Celery para mover la sincronizacion de Sheets fuera del request.
- Reintentos automaticos para leads con `sheet_status=failed`.
- Metricas, busqueda avanzada y exportacion.
- Cifrado de secretos en base de datos.
- Rate limiting, monitoreo y alertas de produccion.
- CI/CD con GitHub Actions.
