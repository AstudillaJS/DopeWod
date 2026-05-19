# MANUAL DE PROCEDIMIENTO Y FUNCIONAMIENTO
## SISTEMA: DOPE WOD — GESTIÓN DE ENTRENAMIENTOS Y ATLETAS
*Última actualización: Mayo 2026*

---

## 1. INTRODUCCIÓN Y PROPÓSITO
Este documento detalla el funcionamiento técnico, la arquitectura y los procedimientos clave del ecosistema **DOPE WOD**. Su objetivo es servir como guía operativa para desarrolladores, entrenadores y administradores, asegurando la consistencia del sistema en el tiempo y el cumplimiento de las políticas de versionado y seguridad de datos.

---

## 2. ARQUITECTURA GENERAL DEL SISTEMA
El sistema está construido sobre una arquitectura moderna basada en la nube con desacoplamiento de frontend y backend:

*   **Frontend**: Aplicación interactiva de una sola página (SPA) desarrollada con **React 18+**, **TypeScript** y **Vite**.
*   **Alineación Estética**: Utiliza estilos personalizados CSS premium orientados a una estética deportiva de alta gama (tonos oscuros, degradados cian/azul neón, microinteracciones y tipografías de gran peso visual).
*   **Backend (BaaS)**: **Supabase** (PostgreSQL) para la autenticación, base de datos en tiempo real y almacenamiento seguro de datos.
*   **Políticas de Acceso (RLS)**: Cada tabla en Supabase está protegida con políticas de nivel de fila para garantizar que los atletas solo puedan ver y editar su propia información, mientras que los coaches y administradores poseen permisos ampliados.

---

## 3. MÓDULOS DE APLICACIÓN Y NUEVAS MEJORAS

### A. Buscador de Ejercicios y Soporte "Complex" (Nuevo)
*   **Ubicación**: `src/components/ExerciseAutocomplete.tsx`
*   **Descripción**: Permite a los coaches buscar y seleccionar ejercicios individuales o componer complejos olímpicos / gimnásticos interactivos usando el delimitador `+` (ej. `POWER CLEAN + FRONT SQUAT + JERK`).
*   **Funcionamiento Técnico**:
    1. El componente recibe el texto y lo divide mediante el carácter `+`.
    2. Realiza la búsqueda reactiva en la base de datos **únicamente sobre el último segmento que se está escribiendo**, mejorando drásticamente el rendimiento.
    3. Al seleccionar un ejercicio del dropdown, este **reemplaza solo el fragmento final activo**, manteniendo los ejercicios previos del complejo intactos.
    4. Formatea la salida de manera automática y limpia, asegurando mayúsculas sostenidas y espacios óptimos (ej. `MOVIMIENTO A + MOVIMIENTO B`).

### B. Módulo Inline de Alta de Ejercicios (Nuevo)
*   **Ubicación**: `src/components/ExerciseAutocomplete.tsx`
*   **Descripción**: Proporciona un flujo interactivo para registrar un nuevo ejercicio directamente en caliente si este no existe en la base de datos, evitando salir de la pantalla de planificación.
*   **Funcionamiento Técnico**:
    1. Si no hay coincidencias exactas, se habilita la opción `+ ¿No encuentras el ejercicio? Dar de alta nuevo`.
    2. Al hacer clic, se despliega un formulario inline premium que extrae el nombre ingresado por el usuario y permite categorizarlo de inmediato.
    3. Al confirmar, el ejercicio se registra en Supabase y se autoselecciona de inmediato en la planificación del bloque correspondiente.

### C. Registro y Visualización de Marcas Personales (PR)
*   **Ubicación**: `src/screens/AthleteManagement.tsx` y componentes de perfil.
*   **Descripción**: Permite a los atletas registrar sus mejores marcas por ejercicio, con selectores interactivos de unidad de medida (KG / LBS) y almacenamiento persistente en la tabla `personal_records` en Supabase.

---

## 4. SEGURIDAD Y BASE DE DATOS (POLÍTICAS RLS)
La base de datos utiliza políticas de seguridad de PostgreSQL para blindar la información de los usuarios. Recientemente se reestructuró esta sección para evitar la recursión infinita en la tabla `profiles`.

### El problema resuelto (Recursividad RLS)
Anteriormente, las consultas en la tabla `exercises` verificaban si el usuario era administrador haciendo una consulta a `profiles`. Esta última, al ser consultada, ejecutaba una política de lectura interna (`Coaches can view their own athletes`) que volvía a hacer una consulta a `profiles` para determinar el rol del usuario actual, creando un bucle infinito en PostgreSQL.

### La Solución Implementada (Función Security Definer)
Se implementó una arquitectura basada en funciones de base de datos seguras:
1.  **Función Auxiliar Segura**: Se creó `public.get_user_role(user_id uuid)` marcada como **`SECURITY DEFINER`**. Esta función se ejecuta con privilegios del creador de la base de datos, lo que le permite saltarse el motor RLS exclusivamente para leer el rol del perfil del usuario, rompiendo la recursividad.
2.  **Políticas Actualizadas**:
    *   **`profiles`**: La política `"Coaches can view their own athletes"` ahora consulta de forma limpia y directa el rol mediante `public.get_user_role(auth.uid()) = 'admin'`.
    *   **`exercises`**: Las políticas de `INSERT`, `UPDATE` y `DELETE` usan esta misma función rápida de rol, permitiendo el alta y edición de ejercicios tanto a usuarios con rol `admin` como `coach`.

---

## 5. PROCEDIMIENTOS DE MANTENIMIENTO, RESPALDO Y DESPLIEGUE

### A. Regla de Oro de Compilación y Respaldo
Cada vez que se realiza un despliegue y se genera una nueva distribución estática (`dist/`), es **MANDATORIO** respaldar la versión previa para garantizar la reversión inmediata ante contingencias.
*   **Procedimiento**:
    1. Antes de compilar, copiar la carpeta `dist` existente dentro de la carpeta `Versiones anteriores` con un sufijo de marca de tiempo (ej: `Versiones anteriores/dist_backup_YYYYMMDD_HHMM`).
    2. Ejecutar la compilación para generar los nuevos archivos de distribución optimizados.

### B. Comandos de Consola Clave (PowerShell / CMD en Windows)
> [!NOTE]
> Debido a las restricciones de ejecución de scripts en la máquina local (políticas de PowerShell), todos los comandos de desarrollo deben ejecutarse llamando directamente a los módulos con sus prefijos estándar.

*   **Verificación Estática de Tipos (TypeScript)**:
    ```cmd
    npx tsc --noEmit
    ```
    *Este comando valida la integridad de los tipos de datos en todo el proyecto antes de pasar a producción, garantizando 0 errores de compilación.*

*   **Compilación para Producción (Vite)**:
    ```cmd
    cmd /c npm run build
    ```
    *Genera la carpeta `dist` con los archivos HTML, CSS y JS optimizados, minificados y listos para subir al servidor de hosting.*

*   **Ejecución del Entorno de Desarrollo Local**:
    ```cmd
    cmd /c npm run dev
    ```
    *Levanta el servidor local interactivo para previsualizar cambios en tiempo real.*

---

## 6. CONSIDERACIONES DE LA BASE DE DATOS
*   **Restricciones de Categoría y Equipamiento**:
    Al registrar ejercicios nuevos de forma inline, el sistema restringe y provee de forma estricta los valores de las columnas `category` y `equipment_type` requeridas por Supabase:
    *   **Categorías permitidas**: `'Weightlifting'`, `'Gymnastics'`, `'Monostructural'`.
    *   **Equipamiento habitual**: `'Barbell'`, `'Bodyweight'`, `'Dumbbell'`, `'Kettlebell'`, `'Medicine Ball'`, `'Box'`, `'Rope'`, `'Machine'`, etc.
    *   **Auto-selección**: Al cambiar la categoría, el sistema pre-selecciona automáticamente el equipamiento recomendado (ej. *Weightlifting* -> *Barbell*, *Gymnastics* -> *Bodyweight*) para agilizar el registro y evitar violaciones de restricción NOT NULL en la base de datos.
