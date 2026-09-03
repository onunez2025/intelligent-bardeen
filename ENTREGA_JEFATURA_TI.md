# 📋 ENTREGA EJECUTIVA — TI INNOVATION PORTAL
**Para:** Jefatura de TI — Grupo Sole (Corporación Rinnai / MT Industrial S.A.C.)  
**De:** Especialista en Transformación Digital & IA (Orlando Núñez)  
**Proyecto:** TI Innovation Portal (Gestión de Portafolio, Intake M365, Cronogramas Gantt, ROI y Auditoría con DeepSeek AI)  
**Fecha:** Septiembre 2026  

---

## 1. ¿Qué es y qué resuelve la plataforma?
Es el nuevo centro de mando corporativo para la **gestión integral de proyectos de Transformación Digital, Automatizaciones RPA, Integraciones (SAP, C4C, FSM, Beetrack, Punto de Venta) y proyectos de Inteligencia Artificial**.

### Capacidades clave implementadas:
1. **Tabla Principal estilo Monday.com:** Gestión visual del ciclo de vida, cambio de estados en 1 clic y edición completa de entregables.
2. **Cronograma Mensual (Diagrama de Gantt):** Cálculo automático de porcentaje de avance real vs. meta mensual planificada con detección de adelantos o desvíos para jefatura.
3. **Dashboard Ejecutivo & ROI Financiero:** Proyección del ahorro mensual ($/mes) y anual ($/año) generado al liberar horas operativas de personal y licencias.
4. **Portal de Solicitudes Corporativo (`/solicitud`):** Buzón independiente para colaboradores con sesión Microsoft 365, selector de sistemas corporativos y carga interactiva de archivos adjuntos (Excel, PDF, capturas).
5. **Auditoría Técnica con DeepSeek AI:** Agente de IA que evalúa los requerimientos de los usuarios y audita el código fuente de los repositorios.
6. **Motor de Exportación a Excel (.xlsx):** Descarga de reportes ejecutivos consolidados con múltiples hojas formateadas.

---

## 2. Lo que ya está 100% configurado y listo en Producción:
* ✅ **Base de Datos Azure SQL Server:** Conectada a `soledbserver.database.windows.net` (DB: `soledb-puntoventa`).
* ✅ **Esquema Aislado Creado:** Se creó el esquema dedicado **`ti_projects`** con todas sus tablas (`Projects`, `Requests`, `Tasks`, `ProjectNotes`, `ProgressLogs`) para garantizar que **no se toque ni interfiera ninguna tabla de Punto de Venta**.
* ✅ **Datos Sincronizados:** Los proyectos y solicitudes iniciales ya están persistidos en Azure SQL.
* ✅ **DeepSeek AI:** Conexión probada y validada con API Key oficial.

---

## 3. Checklist para Despliegue en Azure (Lo que falta ejecutar):

### Paso 1: Subir el código a Azure DevOps (Azure Repos)
```bash
git init
git add .
git commit -m "feat: Version inicial TI Innovation Portal"
git remote add origin https://dev.azure.com/ORGANIZACION/PROYECTO/_git/TI-Innovation-Portal
git branch -M main
git push -u origin main
```

### Paso 2: Crear el Azure Web App (App Service)
* **Nombre:** `app-ti-innovation-portal` *(o el nombre que defina la jefatura)*.
* **Runtime Stack:** `Node 20 LTS`.
* **Sistema Operativo:** `Linux`.

### Paso 3: Configurar Variables de Entorno en Azure Portal
En **Azure Portal > App Service > Configuration (Application Settings)**, agregar:

```env
DATABASE_URL="sqlserver://soledbserver.database.windows.net:1433;database=soledb-puntoventa;user=soledbserveradmin;password=@s0le@dm1nAI#82,;encrypt=true;trustServerCertificate=false;"
DB_SCHEMA="ti_projects"
DEEPSEEK_API_KEY="sk-tu-api-key-de-deepseek"
DEEPSEEK_BASE_URL="https://api.deepseek.com"
DEEPSEEK_MODEL="deepseek-chat"
PORT=8080
NODE_ENV=production
NEXT_PUBLIC_APP_NAME="TI Innovation Portal"
NEXT_PUBLIC_COMPANY_NAME="Grupo Sole (Corporación Rinnai)"
```

### Paso 4: Ejecutar el Pipeline de CI/CD
El archivo `azure-pipelines.yml` ya está incluido en la raíz. Solo vincularlo en **Azure DevOps > Pipelines** y presionar **Run**.

---

## 4. Pendiente Menor (Opcional a futuro):
* **Azure Blob Storage:** En cuanto se cree el contenedor en Azure, solo pegar `AZURE_STORAGE_CONNECTION_STRING` en las variables de entorno para migrar el almacenamiento de adjuntos a la nube de blobs.
