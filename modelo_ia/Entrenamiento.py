# =============================================================================
# WasteNet — Red Neuronal Convolucional para Detección de Residuos Sólidos
# Universidad Mayor de San Andrés — INF-335 Inteligencia Artificial
# =============================================================================
# Dataset: TrashNet (Yang & Thung, 2016)
# Framework: TensorFlow 2.x / Keras
# Python: 3.8+
#
# Instalación de dependencias:
#   pip install tensorflow scikit-learn matplotlib seaborn numpy pillow
#
# Descarga del dataset:
#   git clone https://github.com/garythung/trashnet.git
#   cd trashnet && tar -xzf dataset-resized.tar.gz
# =============================================================================

import os
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path

import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.callbacks import (
    EarlyStopping, ReduceLROnPlateau, ModelCheckpoint
)

from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    classification_report, confusion_matrix,
    roc_curve, auc
)
from sklearn.preprocessing import label_binarize

# ─── 0. CONFIGURACIÓN GENERAL ─────────────────────────────────────────────────

DATASET_PATH = "./trashnet/data/dataset-resized"   # Carpeta raíz del dataset TrashNet
IMG_SIZE     = (224, 224)            # Tamaño de entrada de la red
BATCH_SIZE   = 32
EPOCHS       = 50
NUM_CLASSES  = 5
SEED         = 42
MODEL_PATH   = "wastenet_model.keras"

# Mapeo de categorías TrashNet → clases WasteNet
# TrashNet: glass, paper, cardboard, plastic, metal, trash
LABEL_MAP = {
    "plastic":   "PLASTICOS",
    "metal":     "METALES",
    "trash":     "ORGANICOS",
    "paper":     "PAPEL_CARTON",
    "cardboard": "PAPEL_CARTON",
    "glass":     "RESIDUOS_MIXTOS",
}

CLASS_NAMES = ["PLASTICOS", "METALES", "ORGANICOS", "PAPEL_CARTON", "RESIDUOS_MIXTOS"]
CLASS_INDEX = {name: i for i, name in enumerate(CLASS_NAMES)}

tf.random.set_seed(SEED)
np.random.seed(SEED)


# ─── 1. CARGA Y PREPROCESAMIENTO DEL DATASET ─────────────────────────────────

def cargar_dataset(dataset_path: str):
    """
    Recorre las carpetas de TrashNet, remapea las etiquetas a las 5 clases
    de WasteNet y devuelve listas de rutas de imagen y etiquetas numéricas.
    """
    rutas, etiquetas = [], []

    for carpeta in os.listdir(dataset_path):
        if carpeta not in LABEL_MAP:
            continue
        clase_wastenet = LABEL_MAP[carpeta]
        indice_clase   = CLASS_INDEX[clase_wastenet]
        carpeta_path   = Path(dataset_path) / carpeta

        for imagen in carpeta_path.glob("*.jpg"):
            rutas.append(str(imagen))
            etiquetas.append(indice_clase)

    print(f"Total de imágenes encontradas: {len(rutas)}")
    for i, nombre in enumerate(CLASS_NAMES):
        print(f"  {nombre}: {etiquetas.count(i)} imágenes")

    return np.array(rutas), np.array(etiquetas)


def cargar_imagen(ruta, etiqueta):
    """Lee, decodifica, redimensiona y normaliza una imagen."""
    imagen = tf.io.read_file(ruta)
    imagen = tf.image.decode_jpeg(imagen, channels=3)
    imagen = tf.image.resize(imagen, IMG_SIZE)
    imagen = imagen / 255.0   # Normalización al rango [0, 1]
    return imagen, etiqueta

aumentador = keras.Sequential([
    layers.RandomFlip("horizontal", seed=SEED),
    layers.RandomRotation(0.2, seed=SEED),
    layers.RandomZoom(0.15, seed=SEED),
    layers.RandomTranslation(0.1, 0.1, seed=SEED),
    layers.RandomBrightness(0.2, seed=SEED),
    layers.RandomContrast(0.2, seed=SEED),
], name="data_augmentation")


def aumentar_datos(imagen, etiqueta):
    """Aplica el augmentador global. Se llama solo en entrenamiento."""
    imagen = aumentador(imagen, training=True)
    imagen = tf.clip_by_value(imagen, 0.0, 1.0)
    return imagen, etiqueta


def construir_datasets(rutas, etiquetas):
    """
    Divide el dataset en train/val/test (70/15/15) y construye
    los tf.data.Dataset optimizados para entrenamiento.
    """
    r_train, r_temp, y_train, y_temp = train_test_split(
        rutas, etiquetas, test_size=0.30,
        stratify=etiquetas, random_state=SEED
    )
    r_val, r_test, y_val, y_test = train_test_split(
        r_temp, y_temp, test_size=0.50,
        stratify=y_temp, random_state=SEED
    )

    print(f"\nDivisión del dataset:")
    print(f"  Entrenamiento : {len(r_train)} imágenes")
    print(f"  Validación    : {len(r_val)} imágenes")
    print(f"  Prueba        : {len(r_test)} imágenes")

    def crear_ds(rutas, etiquetas, augmentar=False, shuffle=False):
        ds = tf.data.Dataset.from_tensor_slices((rutas, etiquetas))
        if shuffle:
            ds = ds.shuffle(buffer_size=len(rutas), seed=SEED)
        ds = ds.map(cargar_imagen, num_parallel_calls=tf.data.AUTOTUNE)
        if augmentar:
            # map con augmentation — el aumentador ya existe fuera, no hay problema
            ds = ds.map(aumentar_datos, num_parallel_calls=tf.data.AUTOTUNE)
        ds = ds.batch(BATCH_SIZE).prefetch(tf.data.AUTOTUNE)
        return ds

    ds_train = crear_ds(r_train, y_train, augmentar=True, shuffle=True)
    ds_val   = crear_ds(r_val,   y_val)
    ds_test  = crear_ds(r_test,  y_test)

    return ds_train, ds_val, ds_test, r_test, y_test


# ─── 2. ARQUITECTURA DEL MODELO — WasteNet ────────────────────────────────────

def construir_wastenet(num_classes: int = NUM_CLASSES) -> keras.Model:
    """
    Construye la arquitectura CNN WasteNet definida en el informe:
      Entrada 224×224×3
      → Conv Block 1: Conv2D(32) + ReLU + BN + MaxPool  → 112×112×32
      → Conv Block 2: Conv2D(64) + ReLU + BN + MaxPool  →  56×56×64
      → Conv Block 3: Conv2D(128)+ ReLU + BN + MaxPool  →  28×28×128
      → Conv Block 4: Conv2D(256)+ ReLU + BN + GAP      →  vector 256-d
      → Dense(256) + Dropout(0.5)
      → Dense(128)
      → Dense(5)   + Softmax
    """
    entradas = keras.Input(shape=(224, 224, 3), name="entrada_imagen")

    # ── BLOQUE CONVOLUCIONAL 1 ─────────────────────────────────────────────
    x = layers.Conv2D(32, (3, 3), padding="same", name="conv1")(entradas)
    x = layers.BatchNormalization(name="bn1")(x)
    x = layers.Activation("relu", name="relu1")(x)
    x = layers.MaxPooling2D((2, 2), name="maxpool1")(x)
    # Salida: 112×112×32

    # ── BLOQUE CONVOLUCIONAL 2 ─────────────────────────────────────────────
    x = layers.Conv2D(64, (3, 3), padding="same", name="conv2")(x)
    x = layers.BatchNormalization(name="bn2")(x)
    x = layers.Activation("relu", name="relu2")(x)
    x = layers.MaxPooling2D((2, 2), name="maxpool2")(x)
    # Salida: 56×56×64

    # ── BLOQUE CONVOLUCIONAL 3 ─────────────────────────────────────────────
    x = layers.Conv2D(128, (3, 3), padding="same", name="conv3")(x)
    x = layers.BatchNormalization(name="bn3")(x)
    x = layers.Activation("relu", name="relu3")(x)
    x = layers.MaxPooling2D((2, 2), name="maxpool3")(x)
    # Salida: 28×28×128

    # ── BLOQUE CONVOLUCIONAL 4 + GlobalAveragePooling ──────────────────────
    x = layers.Conv2D(256, (3, 3), padding="same", name="conv4")(x)
    x = layers.BatchNormalization(name="bn4")(x)
    x = layers.Activation("relu", name="relu4")(x)
    x = layers.GlobalAveragePooling2D(name="gap")(x)
    # Salida: vector 256-d

    # ── CAPAS DENSAS (CLASIFICADOR) ────────────────────────────────────────
    x = layers.Dense(256, activation="relu", name="dense1")(x)
    x = layers.Dropout(0.5, name="dropout")(x)
    x = layers.Dense(128, activation="relu", name="dense2")(x)

    # ── CAPA DE SALIDA — Softmax ───────────────────────────────────────────
    salidas = layers.Dense(num_classes, activation="softmax", name="salida")(x)

    modelo = keras.Model(inputs=entradas, outputs=salidas, name="WasteNet")
    return modelo


# ─── 3. COMPILACIÓN Y ENTRENAMIENTO ───────────────────────────────────────────

def compilar_y_entrenar(modelo, ds_train, ds_val):
    """Compila el modelo y ejecuta el ciclo de entrenamiento."""

    modelo.compile(
        optimizer=keras.optimizers.Adam(learning_rate=0.001),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"]
    )

    modelo.summary()

    callbacks = [
        EarlyStopping(
            monitor="val_loss",
            patience=10,
            restore_best_weights=True,
            verbose=1
        ),
        ReduceLROnPlateau(
            monitor="val_loss",
            factor=0.5,
            patience=5,
            min_lr=1e-6,
            verbose=1
        ),
        ModelCheckpoint(
            filepath=MODEL_PATH,
            monitor="val_loss",
            save_best_only=True,
            verbose=1
        ),
    ]

    historial = modelo.fit(
        ds_train,
        validation_data=ds_val,
        epochs=EPOCHS,
        callbacks=callbacks,
        verbose=1
    )

    return historial


# ─── 4. VISUALIZACIÓN DEL ENTRENAMIENTO ──────────────────────────────────────

def graficar_historial(historial):
    """Genera gráficas de accuracy y loss durante el entrenamiento."""
    epocas = range(1, len(historial.history["accuracy"]) + 1)

    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))
    fig.suptitle("WasteNet — Historial de Entrenamiento", fontsize=14, fontweight="bold")

    # Accuracy
    ax1.plot(epocas, historial.history["accuracy"],     "b-o", label="Entrenamiento", markersize=3)
    ax1.plot(epocas, historial.history["val_accuracy"], "r-o", label="Validación",    markersize=3)
    ax1.set_title("Exactitud (Accuracy)")
    ax1.set_xlabel("Época")
    ax1.set_ylabel("Accuracy")
    ax1.legend()
    ax1.grid(True, alpha=0.3)

    # Loss
    ax2.plot(epocas, historial.history["loss"],     "b-o", label="Entrenamiento", markersize=3)
    ax2.plot(epocas, historial.history["val_loss"], "r-o", label="Validación",    markersize=3)
    ax2.set_title("Pérdida (Loss)")
    ax2.set_xlabel("Época")
    ax2.set_ylabel("Loss")
    ax2.legend()
    ax2.grid(True, alpha=0.3)

    plt.tight_layout()
    plt.savefig("historial_entrenamiento.png", dpi=150, bbox_inches="tight")
    plt.show()
    print("Gráfica guardada: historial_entrenamiento.png")


# ─── 5. EVALUACIÓN Y MÉTRICAS ─────────────────────────────────────────────────

def evaluar_modelo(modelo, ds_test, y_test):
    """
    Evalúa el modelo sobre el conjunto de prueba y genera:
    - Accuracy global
    - Reporte de clasificación (Precision, Recall, F1 por clase)
    - Matriz de confusión
    - Curvas ROC/AUC por clase
    """
    print("\n" + "="*60)
    print("EVALUACIÓN SOBRE CONJUNTO DE PRUEBA")
    print("="*60)

    # ── 5.1 Accuracy global ────────────────────────────────────────────────
    loss, accuracy = modelo.evaluate(ds_test, verbose=0)
    print(f"\nLoss en prueba  : {loss:.4f}")
    print(f"Accuracy global : {accuracy*100:.2f}%")

    # ── 5.2 Predicciones ──────────────────────────────────────────────────
    y_pred_proba = modelo.predict(ds_test, verbose=0)
    y_pred       = np.argmax(y_pred_proba, axis=1)

    # ── 5.3 Reporte de clasificación ──────────────────────────────────────
    print("\nReporte de clasificación por clase:")
    print(classification_report(
        y_test, y_pred,
        target_names=CLASS_NAMES,
        digits=4
    ))

    # ── 5.4 Matriz de confusión ───────────────────────────────────────────
    cm = confusion_matrix(y_test, y_pred)

    plt.figure(figsize=(8, 6))
    sns.heatmap(
        cm, annot=True, fmt="d", cmap="Blues",
        xticklabels=CLASS_NAMES,
        yticklabels=CLASS_NAMES,
        linewidths=0.5
    )
    plt.title("WasteNet — Matriz de Confusión (Conjunto de Prueba)",
              fontweight="bold", pad=12)
    plt.ylabel("Clase Real",     fontsize=11)
    plt.xlabel("Clase Predicha", fontsize=11)
    plt.xticks(rotation=30, ha="right")
    plt.yticks(rotation=0)
    plt.tight_layout()
    plt.savefig("matriz_confusion.png", dpi=150, bbox_inches="tight")
    plt.show()
    print("Matriz guardada: matriz_confusion.png")

    # ── 5.5 Curvas ROC / AUC ──────────────────────────────────────────────
    y_test_bin = label_binarize(y_test, classes=list(range(NUM_CLASSES)))

    plt.figure(figsize=(9, 6))
    colores = ["#2196F3", "#4CAF50", "#FF9800", "#9C27B0", "#F44336"]

    for i, (nombre, color) in enumerate(zip(CLASS_NAMES, colores)):
        fpr, tpr, _ = roc_curve(y_test_bin[:, i], y_pred_proba[:, i])
        roc_auc     = auc(fpr, tpr)
        plt.plot(fpr, tpr, color=color, lw=2,
                 label=f"{nombre} (AUC = {roc_auc:.3f})")

    plt.plot([0, 1], [0, 1], "k--", lw=1, label="Clasificador aleatorio")
    plt.xlim([0.0, 1.0])
    plt.ylim([0.0, 1.05])
    plt.xlabel("Tasa de Falsos Positivos", fontsize=11)
    plt.ylabel("Tasa de Verdaderos Positivos", fontsize=11)
    plt.title("WasteNet — Curvas ROC por Clase", fontweight="bold")
    plt.legend(loc="lower right", fontsize=9)
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.savefig("curvas_roc.png", dpi=150, bbox_inches="tight")
    plt.show()
    print("Curvas ROC guardadas: curvas_roc.png")

    return y_pred, y_pred_proba


# ─── 6. INFERENCIA — PREDICCIÓN SOBRE UNA IMAGEN NUEVA ───────────────────────

def predecir_imagen(modelo, ruta_imagen: str):
    """
    Carga una imagen, la preprocesa y devuelve la clase predicha
    con su vector de probabilidades.
    """
    imagen = tf.io.read_file(ruta_imagen)
    imagen = tf.image.decode_jpeg(imagen, channels=3)
    imagen = tf.image.resize(imagen, IMG_SIZE)
    imagen = imagen / 255.0
    imagen = tf.expand_dims(imagen, 0)   # batch dimension

    probabilidades = modelo.predict(imagen, verbose=0)[0]
    clase_idx      = np.argmax(probabilidades)
    clase_nombre   = CLASS_NAMES[clase_idx]
    confianza      = probabilidades[clase_idx] * 100

    print(f"\nImagen analizada: {ruta_imagen}")
    print(f"Clase predicha  : {clase_nombre} ({confianza:.1f}% de confianza)")
    print("\nVector de probabilidades:")
    for nombre, prob in zip(CLASS_NAMES, probabilidades):
        barra = "█" * int(prob * 30)
        print(f"  {nombre:<20} {prob:.4f}  {barra}")

    return clase_nombre, probabilidades


# ─── 7. PIPELINE PRINCIPAL ────────────────────────────────────────────────────

def main():
    print("="*60)
    print("WasteNet — CNN para Detección de Residuos Sólidos Urbanos")
    print("UMSA — INF-335 Inteligencia Artificial")
    print("="*60)

    # 1. Cargar dataset
    print("\n[1/5] Cargando dataset TrashNet...")
    rutas, etiquetas = cargar_dataset(DATASET_PATH)

    # 2. Construir datasets de entrenamiento/validación/prueba
    print("\n[2/5] Construyendo datasets...")
    ds_train, ds_val, ds_test, r_test, y_test = construir_datasets(rutas, etiquetas)

    # 3. Construir modelo
    print("\n[3/5] Construyendo arquitectura WasteNet...")
    modelo = construir_wastenet()

    # 4. Entrenar
    print("\n[4/5] Iniciando entrenamiento...")
    historial = compilar_y_entrenar(modelo, ds_train, ds_val)
    graficar_historial(historial)

    # 5. Evaluar
    print("\n[5/5] Evaluando sobre conjunto de prueba...")
    evaluar_modelo(modelo, ds_test, y_test)

    # Ejemplo de inferencia sobre una imagen puntual
    # predecir_imagen(modelo, "mi_imagen_de_basura.jpg")

    print("\n✓ Pipeline completo. Modelo guardado en:", MODEL_PATH)


if __name__ == "__main__":
    main()