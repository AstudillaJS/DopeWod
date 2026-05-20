# Manual de Procedimiento: Sistema DOPE WOD (Versión de Escritorio)

Este manual documenta el funcionamiento técnico, arquitectura, flujo de desarrollo (GitFlow), proceso de compilación y la guía de instalación y distribución de la aplicación de escritorio **DOPE WOD** para computadoras con Windows.

---

## 1. Arquitectura y Tecnologías

La aplicación está diseñada como una aplicación de escritorio híbrida utilizando las siguientes tecnologías:

*   **Frontend**: React (Typescript) estructurado mediante componentes modulares.
*   **Compilador y Bundler**: Vite (configurado para usar rutas relativas `./` para total compatibilidad local).
*   **Estilos**: Tailwind CSS v4 para diseño responsivo con la paleta de Lynx Consulting.
*   **Base de Datos y Autenticación**: Supabase (servicios en la nube a los que accede el cliente a través de peticiones seguras HTTPS/WSS).
*   **Entorno de Escritorio**: Electron (empaqueta la UI de React junto con un runtime de Chromium optimizado).

---

## 2. Estructura del Proyecto

*   `electron.cjs`: Archivo de configuración principal y punto de entrada para el runtime de Electron (CommonJS).
*   `vite.config.ts`: Configuración del compilador Vite (con `base: './'`).
*   `package.json`: Definición de metadatos, scripts y dependencias (incluye dependencias de desarrollo de Electron).
*   `src/`: Código fuente de la interfaz de usuario en React.
*   `dist/`: Carpeta que contiene la compilación de producción generada por Vite.
*   `dist-electron/`: Directorio donde se compila la versión de escritorio portátil de Windows.
*   `Versiones anteriores/`: Repositorio local de copias de seguridad de las carpetas `dist` compiladas.

---

## 3. Metodología de Trabajo: GitFlow

Para realizar cambios de forma ordenada y profesional, se debe seguir estrictamente el flujo de GitFlow:

1.  **Desarrollo de Características (`feature/*`)**:
    *   Toda nueva funcionalidad o cambio de branding se realiza en una rama que parta de `develop`. Ejemplo: `git checkout -b feature/mi-cambio develop`.
2.  **Integración a Desarrollo**:
    *   Una vez terminada la característica, se realiza un merge a `develop` sin "fast-forward" para mantener la historia de la característica limpia:
        ```bash
        git checkout develop
        git merge feature/mi-cambio --no-ff -m "Merge branch 'feature/mi-cambio' into develop"
        ```
3.  **Proceso de Liberación (`release/*`)**:
    *   Para crear una nueva versión ejecutable, se crea una rama de release desde `develop`:
        ```bash
        git checkout -b release/v1.0.0 develop
        ```
    *   Aquí se realizan pruebas, configuraciones del instalador y aumentos de versión en `package.json`.
    *   Una vez lista la release, se mergea tanto a `main` (producción) como a `develop`:
        ```bash
        git checkout main
        git merge release/v1.0.0 --no-ff -m "Merge branch 'release/v1.0.0' into main"
        git checkout develop
        git merge release/v1.0.0 --no-ff -m "Merge branch 'release/v1.0.0' into develop"
        ```
    *   Finalmente se borra la rama local: `git branch -d release/v1.0.0`.

---

## 4. Guía del Desarrollador: Instalación y Ejecución Local

### Requisitos Previos
*   Tener instalado **Node.js** (versión LTS recomendada, 18 o superior).

### Nota sobre Políticas de Ejecución de Windows PowerShell
Debido a las restricciones de las políticas de ejecución de scripts en entornos Windows estándar (`SecurityError` en PowerShell), **todos los comandos de npm deben llamarse usando explícitamente CMD** de la siguiente manera:

*   **Instalación inicial de dependencias**:
    ```powershell
    cmd /c npm install
    ```
*   **Iniciar el Servidor de Desarrollo React**:
    ```powershell
    cmd /c npm run dev
    ```
*   **Probar la aplicación en la ventana de Electron (Desarrollo/Local)**:
    1. Inicia el servidor React (`cmd /c npm run dev`).
    2. En otra consola de comandos, ejecuta la ventana de Electron:
       ```powershell
       cmd /c npm run electron:start
       ```

---

## 5. Proceso de Compilación y Regla de Copia de Seguridad

> [!IMPORTANT]
> **Regla Global de Versiones Anteriores**:
> Cada vez que vayas a realizar una nueva compilación de producción que reemplace la carpeta `dist`, debes realizar una copia de la carpeta `dist` actual dentro de una subcarpeta con fecha/hora dentro del directorio `Versiones anteriores`.

### Pasos para realizar una build de producción y empaquetar en ZIP:

1.  **Crear el backup del `dist` actual**:
    Ejecuta el siguiente comando en PowerShell reemplazando la fecha por la actual:
    ```powershell
    Copy-Item -Path "dist" -Destination "Versiones anteriores\dist_backup_YYYYMMDD_HHMM" -Recurse -Force
    ```
2.  **Compilar el Frontend e Instancias de Electron**:
    Genera el nuevo código optimizado de React y copia de archivos necesarios ejecutando:
    ```powershell
    cmd /c npm run build
    ```
3.  **Generar el ejecutable Portable (.exe y recursos)**:
    Para construir los binarios de Windows (que se ubicarán en `dist-electron/win-unpacked`):
    ```powershell
    cmd /c npm run electron:build
    ```
    *Nota: Si el comando falla al final del proceso con errores de extracción de 7zip sobre "darwin/libcrypto.dylib" (herramientas macOS de firma digital), puedes ignorarlo, ya que la carpeta de Windows ya fue generada exitosamente antes de esa sección.*
4.  **Comprimir en archivo ZIP portable**:
    Comprime el resultado para su distribución masiva ejecutando:
    ```powershell
    Compress-Archive -Path "dist-electron\win-unpacked\*" -DestinationPath "dist-electron\DOPE_WOD_win-x64.zip" -Force
    ```

---

## 6. Guía de Instalación para el Usuario Final (PC Windows de Clientes)

Para distribuir e instalar la aplicación **DOPE WOD** en las computadoras de las PC clientes con sistema operativo Windows, sigue estos sencillos pasos:

### Paso 1: Descargar el paquete
*   Copia y distribuye a la PC del cliente el archivo comprimido final generado: **`dist-electron/DOPE_WOD_win-x64.zip`**.

### Paso 2: Instalación (Descompresión)
1.  En la PC del cliente, haz clic derecho sobre el archivo `DOPE_WOD_win-x64.zip`.
2.  Selecciona **Extraer todo...** y elige una carpeta de destino permanente (por ejemplo: `C:\Program Files\DOPE WOD` o una carpeta dentro de documentos del usuario).
3.  Haz clic en **Extraer**.

### Paso 3: Crear un acceso directo en el escritorio
1.  Abre la carpeta descomprimida del cliente.
2.  Busca el archivo ejecutable llamado **`DOPE WOD.exe`** (que tiene el logotipo de Lynx Consulting).
3.  Haz clic derecho sobre `DOPE WOD.exe`, selecciona **Enviar a** > **Escritorio (crear acceso directo)**.
4.  Opcional: Cambia el nombre del acceso directo en el escritorio a simplemente `DOPE WOD`.

### Paso 4: Ejecución y Requisitos de Red
*   **Ejecución**: El cliente final simplemente debe hacer doble clic en el acceso directo del Escritorio o sobre `DOPE WOD.exe` para abrir la aplicación.
*   **Dependencias**: **No requiere** instalar Node.js, Python, ni librerías adicionales de programación en las PC de los clientes. El ejecutable portable incluye todo su entorno embebido.
*   **Conectividad**: Dado que la aplicación consume y sincroniza datos en tiempo real mediante Supabase, la PC donde se ejecute la aplicación **debe disponer de conexión activa a Internet** para permitir el inicio de sesión y el correcto guardado y actualización de los WODs.
