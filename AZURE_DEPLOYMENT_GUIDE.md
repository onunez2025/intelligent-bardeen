# Guía de Despliegue en Azure DevOps & Azure Web App (App Service)
**Proyecto:** TI Innovation Portal  
**Empresa:** Grupo Sole (Corporación Rinnai)  
**Fecha:** Septiembre 2026

---

## 1. Subir el Código a Azure Repos (Azure DevOps)

En la terminal de tu proyecto (`c:\Users\onunez\Documents\antigravity\intelligent-bardeen`):

```bash
# 1. Inicializar git si aún no está inicializado
git init

# 2. Agregar todos los archivos preparados
git add .

# 3. Crear el commit inicial
git commit -m "feat: Version inicial TI Innovation Portal con Azure SQL, DeepSeek y Monday UI"

# 4. Vincular con tu repositorio de Azure DevOps
git remote add origin https://dev.azure.com/TU_ORGANIZACION/TU_PROYECTO/_git/TI-Innovation-Portal

# 5. Subir a la rama principal
git branch -M main
git push -u origin main
```

---

## 2. Crear el Recurso en Azure Portal (Azure App Service)

1. Ingresa a [portal.azure.com](https://portal.azure.com).
2. Haz clic en **Create a resource** > **Web App** (App Service).
3. Configura los parámetros básicos:
   * **Resource Group:** Selecciona tu grupo de recursos (ej. `rg-ti-sole`).
   * **Name:** `app-ti-innovation-portal` *(o el nombre que elijas)*.
   * **Publish:** `Code`.
   * **Runtime stack:** `Node 20 LTS`.
   * **Operating System:** `Linux`.
   * **Pricing Plan:** `Basic B1` o `Standard S1` (o el plan corporativo de Grupo Sole).
4. Haz clic en **Review + create** > **Create**.

---

## 3. Configurar las Variables de Entorno en Azure App Service

En Azure Portal, ve a tu **App Service** recién creado > menú lateral **Configuration** (o **Environment variables**) y agrega las siguientes variables de aplicación (**Application Settings**):

| Variable | Valor |
|---|---|
| `DATABASE_URL` | `sqlserver://soledbserver.database.windows.net:1433;database=soledb-puntoventa;user=soledbserveradmin;password=@s0le@dm1nAI#82,;encrypt=true;trustServerCertificate=false;` |
| `DB_SCHEMA` | `ti_projects` |
| `DEEPSEEK_API_KEY` | `sk-tu-api-key-de-deepseek` |
| `DEEPSEEK_BASE_URL` | `https://api.deepseek.com` |
| `DEEPSEEK_MODEL` | `deepseek-chat` |
| `NODE_ENV` | `production` |
| `PORT` | `8080` |

> 💡 **Nota sobre Azure Blob Storage:** Cuando te entreguen el contenedor de Blob Storage, solo agregarás en esta misma ventana `AZURE_STORAGE_CONNECTION_STRING` y `AZURE_STORAGE_CONTAINER="ti-proyectos-archivos"`.

---

## 4. Configurar el Pipeline de Despliegue en Azure DevOps (CI/CD)

El archivo `azure-pipelines.yml` ya está creado en la raíz del proyecto:

1. En Azure DevOps, ve a **Pipelines** > **New Pipeline**.
2. Selecciona **Azure Repos Git** > elige tu repositorio `TI-Innovation-Portal`.
3. Selecciona **Existing Azure Pipelines YAML file** y escoge `/azure-pipelines.yml`.
4. En el paso de Deploy, vincula la conexión de servicio de Azure (**Service Connection**) hacia tu suscripción de Azure.
5. Haz clic en **Run Pipeline**.

¡A partir de ese momento, cada vez que hagas `git push` a `main`, Azure DevOps compilará automáticamente el proyecto y lo publicará en tu **Azure Web App**!
