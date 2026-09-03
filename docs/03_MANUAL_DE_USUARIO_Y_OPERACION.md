# 📖 MANUAL DE USUARIO Y OPERACIONES (MUG / SOP)
**Plataforma:** TI Innovation Portal  
**Empresa:** Grupo Sole (Corporación Rinnai / MT Industrial S.A.C.)  
**Versión:** 1.0 (Producción)  
**Fecha:** Septiembre 2026  

---

## PARTE 1: GUÍA PARA COLABORADORES Y SOLICITANTES

### 1. ¿Cómo acceder al Portal de Solicitudes?
1. Abre tu navegador web e ingresa a: **`https://tudominio.gruposole.com.pe/solicitud`** (o `http://localhost:3001/solicitud` en entorno de pruebas).
2. El sistema detectará automáticamente tu nombre, correo institucional y departamento a través de Microsoft 365.

### 2. ¿Cómo registrar un requerimiento paso a paso?
El formulario cuenta con un asistente guiado en **3 sencillos pasos**:
* **Paso 1: ¿Qué necesitas resolver?**
  * Escribe un título descriptivo (ej. *Automatización de cruce de inventario SAP*).
  * Explica qué problema ocurre hoy en tu área y cuánto tiempo manual les toma resolverlo.
  * Describe brevemente cómo imaginas la solución ideal y selecciona la urgencia.
  * Presiona **"Siguiente"**.
* **Paso 2: Sistemas & Ahorro Estimado**
  * Indica si la solución es una integración con programas actuales (*SAP, C4C, FSM, Beetrack, Punto de Venta, etc.*) o si es una herramienta nueva.
  * Marca qué sistemas de la empresa estarían involucrados.
  * Indica cuántas horas estimadas al mes ahorraría tu equipo con esta solución.
  * Presiona **"Siguiente"**.
* **Paso 3: Archivos de Muestra & Envío Oficial**
  * Arrastra y suelta archivos de prueba (reportes de Excel con datos de ejemplo, capturas de pantalla o documentos).
  * Revisa el resumen y presiona **"Confirmar y Enviar Solicitud"**.
  * El sistema te entregará tu **código de ticket oficial** (ej. `SOL-2026-003`).

### 3. ¿Cómo consultar el estado de mis solicitudes?
1. En la parte superior de `/solicitud`, haz clic en la pestaña **"2. Mis Solicitudes Enviadas"**.
2. Verás tus tickets con sus estados actualizados:
   * 🔵 **Recibido:** En cola de revisión por el equipo de TI.
   * 🟡 **En Evaluación Técnica:** El especialista está analizando la arquitectura y factibilidad.
   * 🟢 **Proyecto Activo en TI:** El requerimiento fue aprobado y ya se encuentra en desarrollo.

---

## PARTE 2: GUÍA PARA EL ESPECIALISTA Y JEFATURA DE TI

### 1. Gestión de la Tabla de Proyectos (Estilo Monday.com)
* **Cambio de Estado en 1 Clic:** Haz clic sobre la pastilla de estado de cualquier proyecto (*Discovery, Trabajando en ello, Pruebas UAT, Listo*) para cambiar su fase operativa de inmediato.
* **Alternar Vista de Densidad:** En la barra superior, usa el botón **`Vista: Compacta / Vista: Extendida`** para cambiar entre el modo ejecutivo rápido y la vista con todas las columnas técnicas.
* **Información y Fórmulas:** Haz clic en los iconos `?` de cada cabecera para ver la explicación y fórmula matemática de cada indicador.

### 2. Aprobación de Requerimientos desde el Buzón de Intake
1. En la barra lateral izquierda, haz clic en **"Buzón de Intake"**.
2. Selecciona la solicitud que deseas revisar.
3. Puedes hacer clic en **"Evaluar con DeepSeek AI"** para obtener un análisis automático de complejidad.
4. Presiona **"Aprobar y Convertir a Proyecto"** para crear el registro en la tabla oficial con código asignado.

### 3. Auditoría Técnica con DeepSeek AI
1. Abre el expediente de un proyecto haciendo clic en su fila.
2. Ve a la pestaña **"Auditor DeepSeek"**.
3. Pega las notas del repositorio, ramas modificadas o descripción de las tareas completadas.
4. Presiona **"Ejecutar Auditoría con DeepSeek"**. La IA analizará el entregable y sugerirá el % de avance real.

### 4. Exportación de Reportes a Excel (.xlsx)
* **Portafolio Completo:** Haz clic en el botón verde **`[ Exportar Excel ]`** de la barra superior. Se descargará un libro con 3 hojas formateadas (*Portafolio de Proyectos, Tareas MVP y Minutas de Discovery*).
* **Ficha Individual:** Abre cualquier proyecto y presiona **`[ Descargar Ficha Excel ]`** para obtener el resumen ejecutivo individual.
