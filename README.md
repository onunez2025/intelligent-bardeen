# TI Innovation Portal
**Centro de Gestión de Transformación Digital, Automatizaciones & IA**  
**Empresa:** Grupo Sole (Corporación Rinnai / MT Industrial S.A.C.)

---

## 📌 Descripción General
Plataforma corporativa diseñada con interfaz moderna estilo **Monday.com** para la recepción de requerimientos, gestión de portafolio de TI, seguimiento de cronogramas mensuales con diagramas de Gantt interactivos, estimación de retorno de inversión económico (ROI) y auditoría técnica mediante **DeepSeek AI**.

---

## 🚀 Módulos Principales
1. **Tabla Principal (Monday Style):** Gestión del ciclo de vida de proyectos, selector de estados en 1 clic, badges de sistemas integrados (*SAP, C4C, FSM, Beetrack, Punto de Venta, SIATC*) y cálculo automático de avance real vs. meta planificada.
2. **Cronograma Mensual (Gantt):** Vista temporal con comparativo mensual de avance vs. meta esperada y detección automática de alertas de retraso o adelanto.
3. **Dashboard Ejecutivo & ROI Financiero:** Indicadores clave de impacto económico mensual (\$ / mes), proyección anual (\$ / año) y horas operativas liberadas al mes.
4. **Portal de Solicitudes Corporativo (`/solicitud`):** Buzón independiente con autenticación Microsoft 365 / Entra ID, autocompletado de datos del solicitante y carga interactiva de archivos adjuntos (Excel, PDF, capturas de pantalla).
5. **Auditoría Técnica con DeepSeek AI:** Evaluación automática de la viabilidad de requerimientos y auditoría de repositorios de código fuente.
6. **Motor de Exportación a Excel (.xlsx):** Descarga de expedientes consolidados y fichas técnicas individuales con formato multilibro.

---

## 🛠️ Stack Tecnológico
* **Framework:** Next.js 16 (App Router & React 19)
* **Lenguaje:** TypeScript
* **Base de Datos:** Azure SQL Server (Esquema dedicado `ti_projects`)
* **ORM & Conexión:** Prisma ORM / Native MSSQL Client
* **Inteligencia Artificial:** DeepSeek API (`deepseek-chat`)
* **Estilos:** Tailwind CSS 4 con iconografía vectorial `lucide-react`
* **Exportación:** SheetJS (`xlsx`)

---

## 💻 Ejecución en Desarrollo Local
```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm run dev
```
Acceder a: `http://localhost:3000` (o `http://localhost:3001`).

---

## ☁️ Despliegue en Azure (DevOps & App Service)
Consulta las instrucciones detalladas en:
* [ENTREGA_JEFATURA_TI.md](./ENTREGA_JEFATURA_TI.md)
* [AZURE_DEPLOYMENT_GUIDE.md](./AZURE_DEPLOYMENT_GUIDE.md)
