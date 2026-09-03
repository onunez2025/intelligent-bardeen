# 📄 DOCUMENTO DE ESPECIFICACIÓN FUNCIONAL (DEF / FRS)
**Plataforma:** TI Innovation Portal  
**Empresa:** Grupo Sole (Corporación Rinnai / MT Industrial S.A.C.)  
**Versión:** 1.0 (Producción)  
**Fecha:** Septiembre 2026  
**Autor:** Orlando Núñez (Especialista en Transformación Digital & IA)  
**Aprobador:** Jefatura de Tecnologías de la Información  

---

## 1. Propósito y Alcance del Sistema
El **TI Innovation Portal** es el centro de mando corporativo oficial para la recepción, priorización, seguimiento operativo, proyección de retorno de inversión (ROI) y auditoría técnica de todas las iniciativas tecnológicas, proyectos de Inteligencia Artificial, integraciones de sistemas corporativos (*SAP ERP, SAP C4C, SAP FSM, Beetrack, Punto de Venta, SIG Web, SIATC*) y automatizaciones RPA de **Grupo Sole**.

---

## 2. Matriz de Roles y Permisos (RBAC)

| Módulo / Función | Usuario Solicitante (M365) | Especialista TI / Administrador | Jefatura de TI |
| :--- | :---: | :---: | :---: |
| **Registrar Requerimiento (`/solicitud`)** | ✅ Sí | ✅ Sí | ✅ Sí |
| **Adjuntar Archivos (Excel, PDF, Imágenes)** | ✅ Sí | ✅ Sí | ✅ Sí |
| **Consultar Estado de sus Tickets** | ✅ Sí (Solo los propios) | ✅ Sí (Todos) | ✅ Sí (Todos) |
| **Convertir Solicitud en Proyecto** | ❌ No | ✅ Sí | ✅ Sí |
| **Cambio de Estados en 1 Clic (Monday Table)** | ❌ No | ✅ Sí | ✅ Sí |
| **Gestión de Tareas y Minutas** | ❌ No | ✅ Sí | ✅ Sí |
| **Auditoría Técnica con DeepSeek AI** | ❌ No | ✅ Sí | ✅ Sí |
| **Dashboard Ejecutivo & Cálculo de ROI Financiero** | ❌ No | ✅ Sí | ✅ Sí |
| **Exportación a Excel Multilibro (.xlsx)** | ❌ No | ✅ Sí | ✅ Sí |
| **Gestión de Infraestructura Azure & DevOps** | ❌ No | ✅ Sí | ✅ Sí |

---

## 3. Casos de Uso Principales (CU)

### CU-01: Registro de Requerimientos mediante Asistente Guiado (Intake)
* **Actor:** Colaborador de cualquier área de la empresa (Finanzas, Ventas, Logística, Servicio Técnico).
* **Flujo:**
  1. El usuario ingresa a `/solicitud` con sesión institucional de Microsoft 365.
  2. **Paso 1:** Ingresa el título del requerimiento y describe el problema o dolor operativo actual.
  3. **Paso 2:** Selecciona si es una solución nueva o una integración con sistemas existentes (*SAP, C4C, Beetrack, etc.*) e indica el impacto estimado.
  4. **Paso 3:** Opcionalmente arrastra y suelta archivos de prueba (reportes Excel, capturas de pantalla, especificaciones PDF) y envía el formulario.
  5. El sistema genera un código de ticket único (ej. `SOL-2026-003`) y notifica al equipo de TI.

### CU-02: Evaluación y Conversión a Proyecto
* **Actor:** Especialista de TI.
* **Flujo:**
  1. El especialista visualiza la solicitud en el **Buzón de Intake**.
  2. Ejecuta el análisis preliminar de viabilidad con DeepSeek AI.
  3. Al presionar **"Aprobar y Convertir a Proyecto"**, el sistema crea automáticamente el proyecto en Azure SQL Server con código oficial (ej. `IA-2026-002`), transfiriendo sus archivos adjuntos y asignando fechas tentativas.

### CU-03: Control de Portafolio y Ciclo de Vida (Monday Style)
* **Actor:** Especialista / Jefatura de TI.
* **Flujo:**
  1. Desde la **Tabla Principal**, el responsable cambia el estado del proyecto en 1 clic (*Discovery, Trabajando en ello, Pruebas UAT, Listo / Producción*).
  2. Puede alternar entre **Vista Compacta** (modo ejecutivo) y **Vista Extendida** (modo técnico).
  3. Al hacer clic en cualquier fila, se despliega el expediente completo para editar entregables, tareas, minutas y recursos de Azure.

### CU-04: Cronograma Mensual & Detección de Desviaciones (Gantt)
* **Actor:** Jefatura de TI.
* **Flujo:**
  1. El sistema evalúa mes a mes el avance entregado vs. la meta planificada.
  2. Si el proyecto tiene un retraso mayor al 10%, el sistema genera automáticamente una alerta roja de **"Retraso"**; si va por delante de lo programado, genera una pastilla verde de **"Adelanto"**.

### CU-05: Auditoría Técnica con DeepSeek AI
* **Actor:** Especialista de TI.
* **Flujo:**
  1. El especialista ingresa las notas del repositorio o resumen de cambios.
  2. DeepSeek AI analiza la completitud del desarrollo, calcula un puntaje de avance (0 a 100%) y genera una retroalimentación técnica con recomendaciones de arquitectura y seguridad.

---

## 4. Reglas de Negocio (Business Rules)

### RN-01: Fórmula del Porcentaje de Avance Esperado (Meta Mensual)
$$\text{Meta Mensual (\%)} = \left( \frac{\text{Días Transcurridos desde Inicio}}{\text{Días Totales del Cronograma}} \right) \times 100$$

### RN-02: Cálculo del Retorno de Inversión (ROI Financiero Mensual)
$$\text{Ahorro Mensual (\$)} = (\text{Horas Operativas Ahorradas / Mes} \times \text{Tarifa Hora: \$18 USD}) + \text{Ahorro de Licencias}$$

### RN-03: Integridad de Esquema en Azure SQL Server
Todas las transacciones de proyectos de TI deben ejecutarse exclusivamente dentro del esquema `ti_projects` de la base de datos `soledb-puntoventa`, asegurando que no se lea, modifique ni altere ninguna tabla de los esquemas transaccionales del Punto de Venta.
