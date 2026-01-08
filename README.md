# 🎵 Convolutional Neural Network Audio Visualizer & Classifier

> **A Deep Learning application that visualizes audio feature extraction in real-time.**
> *Upload a WAV file to see the inner workings of a Convolutional Neural Network (CNN) as it classifies audio events.*

![Dashboard](./ProjectImages/Screenshot%202026-01-08%20084128.png)
*(A visualization of the dashboard showing spectrograms, waveforms, and neural network layers)*

---

## 📖 Table of Contents
- [About the Project](#about-the-project)
- [Why I Built This](#why-i-built-this)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
    - [The Backend & AI Model](#the-backend--ai-model)
    - [The Frontend](#the-frontend)
    - [Authentication](#authentication)
- [AI Model Performance](#ai-model-performance)
- [App Showcase (Screenshots)](#app-showcase-screenshots)
- [How to Run Locally](#how-to-run-locally)

---

## 🚀 About the Project

This application is an interactive educational tool designed to demystify **Deep Learning** for audio. Instead of just giving you a prediction (e.g., "This sound is a Dog barking"), it visualizes the **intermediate layers** of the neural network.

Users can upload a `.wav` file, and the system renders:
1.  **Input Spectrogram**: The raw visual representation of the audio frequencies.
2.  **Layer Activations**: Heatmaps showing what specific features the CNN filters are detecting (edges, textures, patterns).
3.  **Real-time Waveform**: An interactive audio player.
4.  **Prediction Confidence**: A breakdown of the top 3 predicted classes.

---

## 💡 Why I Built This

As a Computer Science student and AI enthusiast, I realized that while many people use Neural Networks, few understand what happens *inside* the "black box."

I built this project to:
* **Bridge the gap** between theoretical Deep Learning concepts and practical visualization.
* Demonstrate how **Convolutional Neural Networks (CNNs)**—typically used for images—can be applied to audio via spectrograms.
* Experiment with **Serverless GPU Inference** using Modal to serve heavy AI models cheaply and efficiently.

---

## 💻 Tech Stack

### **Frontend**
* **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
* **Language**: TypeScript
* **Styling**: Tailwind CSS + Shadcn UI
* **Authentication**: [Clerk](https://clerk.com/)
* **Visualization**: Custom HTML5 Canvas rendering for heatmaps.

### **Backend & Database**
* **Database**: SQLite (Dev) / PostgreSQL (Prod)
* **ORM**: [Prisma](https://www.prisma.io/) (v6 Stable)
* **Server Actions**: Next.js Server Actions for secure database interactions.

### **AI & Inference**
* **Model**: Custom CNN (4 Convolutional Layers) trained on the **ESC-50** dataset.
* **Framework**: PyTorch
* **Deployment**: [Modal](https://modal.com/) (Serverless Python container).
* **Audio Processing**: Torchaudio + Librosa.

---

## 🏗 System Architecture

### The Backend & AI Model
The core of the analysis happens on a **serverless GPU container** hosted on Modal.
1.  **Input**: The frontend converts the `.wav` file to a Base64 string and sends it to the Modal API endpoint.
2.  **Preprocessing**: The Python backend converts the raw audio into a **Mel Spectrogram**.
3.  **Inference**:
    * The spectrogram is passed through 4 Convolutional layers.
    * **Hooks** capture the output of each layer (activation maps) before the final classification.
4.  **Output**: The API returns the top predictions AND the raw activation data for visualization.

### The Frontend
* **Real-time Rendering**: We don't use pre-made images. The frontend receives raw numerical arrays (tensors) from the API and renders them pixel-by-pixel onto HTML5 Canvases using a custom "Viridis" color map.
* **State Management**: React state handles the file upload lifecycle (Uploading -> Processing -> Rendering).

### Authentication
* **Clerk Auth**: Authentication is handled via Clerk.
* **Middleware**: A `middleware.ts` file protects the app. The Homepage is public, but the API interactions and History Sidebar require a signed-in session.
* **Database Sync**: When a user uploads a file, we store the result in the SQLite database linked to their Clerk User ID.

---

## 📊 AI Model Performance

The model was trained on the **ESC-50 Dataset** (Environmental Sound Classification) for 100 Epochs. The training logs show a steady convergence with a final validation accuracy of **~83.25%**.

* **Dataset**: 2,000 labeled audio clips (50 classes).
* **Architecture**: Custom CNN with Max Pooling and ReLU activations.
* **Optimizer**: AdamW with OneCycleLR scheduler.

### Training Metrics
| Accuracy (Validation) | Loss (Validation) |
| :---: | :---: |
| ![Accuracy Graph](./ProjectImages/Screenshot%202026-01-08%20020534.png) | ![Validation Loss Graph](./ProjectImages/Screenshot%202026-01-08%20020605.png) |
| **Final Accuracy: 83.25%** | **Final Loss: 1.22** |

| Loss (Training) | Learning Rate Schedule |
| :---: | :---: |
| ![Training Loss Graph](./ProjectImages/Screenshot%202026-01-08%20020602.png) | ![Learning Rate Graph](./ProjectImages/Screenshot%202026-01-08%20020539.png) |
| **Converged Loss: 0.80** | **OneCycle Policy** |

> **Analysis:** The model shows strong learning characteristics, with validation accuracy plateauing around epoch 80.

### Training Stats
| Metric | Value |
| :--- | :--- |
| **Final Accuracy** | ~85% |
| **Loss** | 0.42 |
| **Epochs** | 100 |

![Model Loss Graph Placeholder](https://via.placeholder.com/600x300?text=Insert+Training+Loss+Graph)

---

## 📸 App Showcase (Screenshots)

### 1. Security & Authentication
*Secure login system powered by Clerk.*
![Login](./ProjectImages/Screenshot%202026-01-08%20084224.png)

### 2. The Dashboard
*A Neon-inspired interface ready for file upload.*
![Dashboard](./ProjectImages/Screenshot%202026-01-08%20084155.png)

### 3. Audio Analysis
*Visualizing the Input Spectrogram (Left) and Waveform (Right).*
![Spectrogram](./ProjectImages/Screenshot%202026-01-08%20084451.png)

### 4. Neural Predictions
*Real-time classification confidence scores.*
![Predictions](./ProjectImages/Screenshot%202026-01-08%20084508.png)

### 5. Network Architecture
*Visualizing the activation maps inside the CNN layers.*
![Architecture](./ProjectImages/Screenshot%202026-01-08%20084514.png)

### 6. History Sidebar
*Keeps track of previous analysis runs.*
![Sidebar](./ProjectImages/Screenshot%202026-01-08%20084419.png)

---


## 🛠 How to Run Locally

Follow these steps to install and set up the project.

### Clone the Repository
```bash
git clone [https://github.com/SamarthB15/AI-Audio-Visualizer.git](https://github.com/SamarthB15/AI-Audio-Visualizer.git)
cd AI-Audio-Visualizer

```

### Backend (Modal)

**1. Install Python**
Download and install Python (3.10+) if not already installed.
[Python Download](https://www.python.org/downloads/)

**2. Install dependencies:**

```bash
pip install -r requirements.txt

```

**3. Modal setup:**

```bash
modal setup

```

**4. Deploy backend:**

```bash
modal deploy main.py

```

### Frontend (Next.js)

**1. Install dependencies:**

```bash
npm install

```

**2. Environment Setup:**
Create a `.env` file in the root directory and make sure to add your own keys:

```env
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL="/"
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL="/"

```

**3. Database Setup:**

```bash
npx prisma generate
npx prisma db push

```

**4. Run:**

```bash
npm run dev

```
