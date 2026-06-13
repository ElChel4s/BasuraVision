# BasuraVision 🍃 — Sistema Inteligente de Gestión y Reporte de Residuos Sólidos

**BasuraVision** es un proyecto académico de fin de grado desarrollado para la materia de **Inteligencia Artificial (INF-335) — Universidad Mayor de San Andrés (UMSA)**. Consiste en una plataforma web y PWA inteligente diseñada para el Gobierno Autónomo Municipal de La Paz (GAMLP), que optimiza la detección, clasificación y recojo de desechos en la vía pública combinando tecnologías de nube y redes neuronales convolucionales (CNN).

---

## 🚀 Módulos del Sistema

1. **Página Web Académica (`/`)**: Presentación institucional del proyecto, justificación científica y documentación técnica de la Red Neuronal Convolucional (CNN).
2. **PWA del Ciudadano (`/client`)**: Aplicación móvil instalable que permite capturar fotografías de focos de basura, geolocalizar el reporte en tiempo real y enviar los datos al servidor.
3. **Panel de Control Operativo (`/admin`)**: Sistema web para los operadores municipales donde visualizan los reportes en un mapa, gestionan el estado del recojo en tiempo real y ejecutan la inferencia analítica de IA sobre las fotos reportadas.

---

## 🧠 Componente de IA: Red Neuronal Convolucional (WasteNet)

Como núcleo inteligente del proyecto, se entrenó una red neuronal convolucional personalizada llamada **WasteNet** en Python usando **TensorFlow / Keras**. 

Los archivos de entrenamiento, métricas y el modelo exportado se encuentran organizados dentro de la carpeta `/modelo_ia` en este repositorio.

### 📊 Especificaciones de la Red
* **Dataset utilizado**: TrashNet (Yang & Thung, 2016).
* **Entrada de la Red**: Imágenes de 224x224 píxeles en RGB (normalizadas a `[0,1]`).
* **Arquitectura**:
  * **ConvBlock 1**: 32 filtros (3x3), BatchNormalization, ReLU y MaxPooling (2x2).
  * **ConvBlock 2**: 64 filtros (3x3), BatchNormalization, ReLU y MaxPooling (2x2).
  * **ConvBlock 3**: 128 filtros (3x3), BatchNormalization, ReLU y MaxPooling (2x2).
  * **ConvBlock 4**: 256 filtros (3x3), BatchNormalization, ReLU y GlobalAveragePooling (GAP) para reducción dimensional.
  * **Clasificador**: Capa densa de 256 neuronas, Dropout (0.5), Capa densa de 128 neuronas y Capa de salida Softmax de 5 clases.
* **Categorías Remapeadas y Clasificadas**:
  1. `PLASTICOS`
  2. `METALES`
  3. `ORGANICOS`
  4. `PAPEL_CARTON`
  5. `RESIDUOS_MIXTOS`

### 📈 Gráficas y Métricas de Rendimiento
Las gráficas del rendimiento real del entrenamiento se encuentran guardadas en `/modelo_ia`:
* **Historial de Entrenamiento (`historial_entrenamiento.png`)**: Curvas de precisión (Accuracy) y pérdida (Loss) durante las épocas de entrenamiento.
* **Matriz de Confusión (`matriz_confusion.png`)**: Desglose detallado de aciertos y falsos positivos del conjunto de prueba por categoría.
* **Curvas ROC (`curvas_roc.png`)**: Curvas de características operativas del receptor y su valor AUC por clase.

---

## 📂 Estructura de Carpetas del Proyecto

```text
basuravision/
├── app/                  # Rutas de Next.js (Landing, Client PWA, Admin Panel, APIs)
├── components/           # Componentes atómicos estructurados por rol
├── lib/                  # Configuración de base de datos Supabase
├── public/               # Favicon, manifiesto PWA y logos institucionales
├── modelo_ia/            # Script de entrenamiento, modelo .keras y gráficas de métricas (¡Extra!)
│   ├── Entrenamiento.py       # Código fuente de entrenamiento en TensorFlow
│   ├── wastenet_model.keras   # Modelo entrenado listo para producción (~5.9 MB)
│   ├── historial_entrenamiento.png
│   ├── matriz_confusion.png
│   └── curvas_roc.png
├── supabase_setup.sql    # Script para crear tablas y configurar RLS en Supabase
└── .env.example          # Plantilla de variables de entorno
```

---

## ⚙️ Configuración y Despliegue Local

### 1. Requisitos Previos
* **Node.js**: versión 20.x o superior.
* **Supabase**: Proyecto configurado con Storage público llamado `trash-images` y la tabla `reportes` creada mediante `supabase_setup.sql`.
* **Gemini API Key**: Llave obtenida de Google AI Studio para análisis de lenguaje/visión en la nube.

### 2. Instalación de la Web
1. Clonar el repositorio:
   ```bash
   git clone https://github.com/ElChel4s/BasuraVision.git
   cd BasuraVision
   ```
2. Instalar dependencias de Node:
   ```bash
   npm install
   ```
3. Configurar variables de entorno copiando el ejemplo:
   ```bash
   cp .env.example .env
   ```
   *Rellena las variables de `.env` con tus llaves reales de Supabase y Gemini.*

4. Levantar servidor local en modo desarrollo:
   ```bash
   npm run dev
   ```
5. Abrir en el navegador:
   * **Landing page**: `http://localhost:3000`
   * **PWA Cliente**: `http://localhost:3000/client`
   * **Administrador**: `http://localhost:3000/admin`

---

## 🐍 Ejecutar el Pipeline de Inteligencia Artificial (Python)

Si deseas re-entrenar la red WasteNet localmente en tu computadora:

1. Ve a la carpeta del modelo:
   ```bash
   cd modelo_ia
   ```
2. Instala las dependencias de Python necesarias:
   ```bash
   pip install tensorflow scikit-learn matplotlib seaborn numpy pillow
   ```
3. Descarga el dataset de imágenes original (TrashNet):
   ```bash
   git clone https://github.com/garythung/trashnet.git
   cd trashnet && tar -xzf dataset-resized.tar.gz
   cd ..
   ```
4. Ejecuta el entrenamiento:
   ```bash
   python Entrenamiento.py
   ```
   *Al finalizar, exportará el modelo actualizado `wastenet_model.keras` y regenerará las gráficas de rendimiento.*

---

## 🎓 Créditos
Desarrollado como proyecto final de la materia **INF-335 Inteligencia Artificial** — **Carrera de Informática, UMSA**.
