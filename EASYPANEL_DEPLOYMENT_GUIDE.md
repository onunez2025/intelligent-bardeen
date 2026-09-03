# 🚀 Guía de Despliegue en EasyPanel (Hostinger VPS)
**Proyecto:** TI Innovation Portal  
**Entorno:** EasyPanel / Docker en Hostinger VPS  
**Fecha:** Septiembre 2026  

---

## Despliegue mediante GitHub en EasyPanel

1. **Crear el Servicio en EasyPanel:**
   * Ingresa a tu panel de EasyPanel en tu VPS (ej. `http://IP_DE_TU_VPS:3000`).
   * Haz clic en **Create Project** (ej. `ti-portal`).
   * Haz clic en **+ Service** > **App**.
   * En **Source**, selecciona **GitHub** y pega la URL de tu repositorio: `https://github.com/onunez2025/intelligent-bardeen.git`.
   * **Build Type:** Selecciona **Dockerfile** (el `Dockerfile` multi-stage ya está listo en la raíz).

2. **Configurar las Variables de Entorno en EasyPanel:**
   En la pestaña **Environment** de tu servicio en EasyPanel, agrega:

   ```env
   DATABASE_URL="sqlserver://soledbserver.database.windows.net:1433;database=soledb-puntoventa;user=soledbserveradmin;password=@s0le@dm1nAI#82,;encrypt=true;trustServerCertificate=false;"
   DB_SCHEMA="ti_projects"
   DEEPSEEK_API_KEY="sk-tu-api-key-de-deepseek"
   DEEPSEEK_BASE_URL="https://api.deepseek.com"
   DEEPSEEK_MODEL="deepseek-chat"
   PORT="3000"
   NODE_ENV="production"
   NEXT_PUBLIC_APP_NAME="TI Innovation Portal"
   NEXT_PUBLIC_COMPANY_NAME="Grupo Sole"
   ```

3. **Configurar Dominio y SSL Gratuito:**
   * En la pestaña **Domains** de tu servicio, ingresa tu subdominio (ej. `innovacion.tudominio.com` o el subdominio gratuito de tu VPS).
   * **Port:** `3000`
   * Haz clic en **Deploy**. ¡EasyPanel compilará la imagen de Docker y le activará certificado SSL HTTPS de Let's Encrypt automáticamente!

---

¡Tu plataforma quedará accesible 24/7 en internet con HTTPS en tu VPS de Hostinger!
