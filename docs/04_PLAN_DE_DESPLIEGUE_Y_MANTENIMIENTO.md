# 🚀 PLAN DE DESPLIEGUE, DEVOPS Y MANTENIMIENTO
**Plataforma:** TI Innovation Portal  
**Empresa:** Grupo Sole (Corporación Rinnai / MT Industrial S.A.C.)  
**Versión:** 1.0 (Producción)  
**Fecha:** Septiembre 2026  

---

## 1. Procedimiento de Despliegue en Producción (Azure)

### Fase 1: Repositorio en Azure DevOps
1. Crear el repositorio en Azure DevOps: `TI-Innovation-Portal`.
2. Subir la rama `main` con los archivos de configuración incluidos (`azure-pipelines.yml`, `.env.example`).

### Fase 2: Recurso Azure App Service (Web App)
1. En [portal.azure.com](https://portal.azure.com), crear una **Web App**:
   * **Runtime Stack:** Node.js 20 LTS.
   * **Sistema Operativo:** Linux.
   * **Plan de Servicio:** `Standard S1` o `Basic B1`.

### Fase 3: Configuración de Variables de Entorno
En **Azure Portal > App Service > Configuration (Environment variables)**, configurar:
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

### Fase 4: Ejecución del Pipeline CI/CD
1. En Azure DevOps, crear un nuevo Pipeline apuntando a `azure-pipelines.yml`.
2. Ejecutar la compilación. El pipeline generará el artefacto comprimido e implementará la aplicación en el Web App automáticamente.

---

## 2. Plan de Mantenimiento y Buenas Prácticas

### 2.1. Respaldos de la Base de Datos Azure SQL
* La base de datos `soledb-puntoventa` cuenta con **Point-in-Time Restore (PITR)** automático provisto por Microsoft Azure con retención de 7 a 35 días.
* Adicionalmente, el esquema `ti_projects` puede exportarse mediante script de generación de BACPAC antes de cada pase a producción mayor.

### 2.2. Monitoreo de Disponibilidad (Health Checks)
* El endpoint `/api/projects/:id/health` permite verificar periódicamente la disponibilidad de cada servicio web asociado a los proyectos de TI.
* Se recomienda activar **Azure Application Insights** en el App Service para registrar métricas de CPU, memoria y tiempos de respuesta.

### 2.3. Procedimiento de Rollback (Contingencia)
Si una nueva versión presenta errores en producción:
1. En **Azure DevOps > Releases / Pipelines**, seleccionar la última compilación exitosa.
2. Hacer clic en **Redeploy**.
3. El despliegue anterior se restaurará en menos de 3 minutos sin pérdida de datos en Azure SQL Server.
