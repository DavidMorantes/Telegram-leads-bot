# User Manual

## Que es el sistema

`telegram-lead-qualifier` es un agente automatizado que recibe mensajes de leads a traves de Telegram, los analiza con inteligencia artificial (Groq) y decide si califican segun el perfil de cliente ideal (ICP) que hayas configurado.

El sistema tiene dos caras:
- **Un bot de Telegram** donde los leads escriben.
- **Un panel administrativo web** donde tu gestionas bots, ICPs, prompts y revisas resultados.

---

## Como iniciar sesion

1. Abrir `http://localhost:5173`.
2. Ir a "Iniciar sesion".
3. Ingresar usuario y contraseña (creados via `make createsuperuser`).
4. El panel mostrara las secciones segun tu rol.

---

## Como crear un bot

1. En el panel, ir a la seccion **Bots**.
2. Click en "Crear bot" o "Agregar".
3. Completar:
   - **Nombre**: nombre interno del bot (ej: "Bot Ventas Latam").
   - **Username de Telegram**: el @username del bot.
   - **Token**: el token que te dio BotFather al crear el bot en Telegram.
   - **ICP asociado**: seleccionar el perfil de cliente ideal (debe estar creado previamente).
   - **Proveedor LLM**: seleccionar la configuracion IA activa.
   - **Configuracion Sheets**: seleccionar la hoja donde se escribiran los leads.
   - **Activo**: marcar para que el bot procese mensajes.
4. Guardar.

Para activar el webhook real de Telegram, necesitaras ejecutar (una vez por bot):

```bash
bash scripts/set-webhook.sh <BOT_TOKEN> https://tudominio.com/api/telegram/webhook/ <WEBHOOK_SECRET>
```

El valor `<WEBHOOK_SECRET>` debe coincidir con `TELEGRAM_WEBHOOK_SECRET` o con el `webhook_secret` guardado para el bot.

---

## Como configurar un ICP

1. Ir a la seccion **ICPs**.
2. Click en "Crear ICP".
3. Definir:
   - **Nombre**: ej: "ICP SaaS B2B Latam".
   - **Industrias objetivo**: separadas por coma (ej: "SaaS, Fintech, Edtech").
   - **Regiones objetivo**: "LATAM, US Hispanic".
   - **Tamano de empresa**: "Startup, PYME".
   - **Intereses clave**: palabras clave que debe mencionar el lead.
   - **Reglas adicionales**: en formato JSON para criterios avanzados.
4. Guardar.

> **Tip:** Los ICPs pueden tener prompts asociados. Crea primero el prompt, luego asocialo al ICP.

---

## Como configurar un prompt

1. Ir a la seccion **Prompts**.
2. Crear un prompt asociado a un ICP.
3. Definir:
   - **Nombre**: ej: "Prompt cualificacion B2B v1".
   - **Prompt del sistema**: instrucciones para el LLM. Debe indicar claramente el formato de salida JSON.
   - **Esquema de salida esperado**: definir los campos JSON que el LLM debe retornar (ej: `{"calificado": bool, "razon": str, "confianza": float}`).
   - **Version**: numero de version del prompt.
   - **Activo**: marcar como activo para usarlo.
4. Guardar.
5. Guardar. El sistema usa el prompt activo mas reciente asociado al ICP por defecto del bot.

Ejemplo de prompt del sistema:

```
Eres un calificador de leads B2B. Analiza el mensaje del lead y determina
si califica segun estas reglas: {reglas_icp}. Responde SOLO con JSON
en este formato exacto:
{"calificado": true/false, "confianza": 0.0-1.0, "razon": "texto", "industria": "texto"}
```

---

## Como configurar proveedor IA

1. Obtener una API key en [console.groq.com](https://console.groq.com).
2. En el panel ir a **Configuracion** > **Proveedor IA**.
3. Crear o editar la configuracion:
   - **Proveedor**: `groq`.
   - **Nombre**: etiqueta interna.
   - **Modelo**: por ejemplo `llama-3.1-8b-instant`.
   - **Base URL**: `https://api.groq.com/openai/v1`.
   - **API Key**: clave real de Groq.
   - **Activo**: marcado.
4. En **Bots**, asociar esta configuracion al bot.

Al editar, deja la API key vacia si quieres conservar la clave actual.

---

## Como configurar Google Sheets

1. Crear un proyecto en [Google Cloud Console](https://console.cloud.google.com).
2. Habilitar la API de Google Sheets.
3. Crear una Service Account y descargar el JSON de credenciales.
4. Compartir el spreadsheet con el email de la Service Account (rol Editor).
5. Agregar al `.env`:
   ```
   GOOGLE_SHEETS_SPREADSHEET_ID=el_id_del_spreadsheet
   GOOGLE_SHEETS_WORKSHEET_NAME=Leads
   GOOGLE_SHEETS_CREDENTIALS_JSON={"type": "service_account", ...}
   ```

Tambien puedes configurar o editar Sheets desde el panel:

1. Ir a **Configuracion** > **Google Sheets**.
2. Crear o editar:
   - **Nombre**: etiqueta interna.
   - **Spreadsheet ID**: el ID de la URL de Google Sheets.
   - **Nombre de la hoja**: por ejemplo `Leads`.
   - **Credenciales JSON**: JSON de la Service Account.
   - **Activa**: marcado.
3. En **Bots**, asociar esta configuracion al bot.

Al editar, deja el JSON vacio si quieres conservar las credenciales actuales.

---

## Como activar / desactivar un bot

En la seccion **Bots**, cada bot tiene un campo "Activo" (booleano):
- **Activado**: el bot procesa los mensajes entrantes.
- **Desactivado**: el bot rechaza o ignora los mensajes.

Puedes cambiar el estado en cualquier momento sin perder la configuracion.

---

## Como revisar leads

1. Ir a la seccion **Leads**.
2. Veras una tabla con:
   - Fecha / hora del lead.
   - Bot que recibio el mensaje.
   - Decision: "Calificado" o "No calificado".
   - Confianza (0% - 100%).
   - Texto recibido.
   - Estado de sincronizacion a Sheets.
   - Acceso rapido a la hoja configurada.
3. Click en un lead para ver el detalle completo: texto original, datos extraidos por el LLM, trazabilidad.
4. Usa **Eliminar** para borrar un lead del panel.

---

## Como interpretar decisiones

| Decision        | Significado                                                 |
| --------------- | ----------------------------------------------------------- |
| **Calificado**  | El lead cumple con los criterios del ICP segun el LLM.      |
| **No calificado** | El lead no cumple con los criterios del ICP.               |
| **Error**       | El LLM no pudo procesar o la respuesta fue invalida.        |
| **Incierto**    | El LLM no tiene suficiente informacion para decidir.         |
| **Fallido**     | El LLM o una configuracion requerida fallo.                  |

La **confianza** es un valor entre 0.0 y 1.0 que indica que tan seguro esta el LLM de su decision. Puedes ajustar el umbral minimo en la configuracion del ICP.

## Como interpretar Sheets

| Estado      | Significado                                                |
| ----------- | ---------------------------------------------------------- |
| **success** | El lead se escribio correctamente en Google Sheets.        |
| **failed**  | La escritura fallo; revisa credenciales, permisos u hoja.  |
| **skipped** | El bot no tiene configuracion activa de Sheets.            |
| **pending** | Estado transitorio antes de intentar sincronizar.          |

---

## Solucion de problemas

| Problema                          | Causa posible                          | Accion                               |
| --------------------------------- | -------------------------------------- | ------------------------------------ |
| El lead no se procesa             | Bot inactivo o sin ICP asignado        | Verificar config del bot             |
| Error "LLM provider not found"    | `GROQ_API_KEY` no configurada          | Revisar `.env`                       |
| El webhook falla con 403          | `TELEGRAM_WEBHOOK_SECRET` incorrecto   | Verificar secreto en bot y webhook   |
| No veo leads en el panel          | No se han procesado leads aun          | Enviar mensaje de prueba al bot      |
| Sheets queda en failed            | Hoja no compartida o JSON invalido      | Compartir hoja con Service Account   |
| El frontend no carga              | Backend caido o CORS mal configurado   | `make logs` para diagnosticar        |
