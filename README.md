# 🐾 StraySafe

**StraySafe** is a humane, AI-powered mobile and web platform to help reduce street-dog conflicts in India.  
It enables citizens and field staff to report incidents, and helps municipalities and NGOs plan sterilization, vaccination, and sanitation work — with a focus on **non-harmful practices**.

---

## 🚀 Features

- **Incident Reporting**: Citizens and field staff can submit reports with location, photo, or video.
- **AI Detection**:
  - Detect dogs and estimate pack size.
  - Identify overflowing garbage spots.
  - Automatically blur human faces and vehicle number plates before storage.
- **Hotspot Mapping**: Visualize risk areas to prioritize interventions.
- **High-Risk Alerts**: Schools, hospitals, and other sensitive areas can get alerts for nearby incidents.
- **Duplicate Control**: AI compares new reports with recent ones to reduce spam.
- **Privacy First**: All personal details and identifiable features are hidden from operators and the public.

---

## 🛠 Tech Stack

### **Mobile App**
- React Native (Android first)
- Camera capture, background uploads, push notifications

### **Backend API**
- Node.js (Express)
- MongoDB (GeoJSON + 2dsphere indexes)
- Redis + BullMQ for background jobs
- MinIO (S3-compatible storage)

### **AI/ML Service**
- Python (FastAPI)
- PyTorch + Ultralytics/YOLO for detection
- OpenCV for image processing
- MediaPipe/RetinaFace for face & plate detection
- LightGBM/XGBoost for risk scoring

### **Operations Dashboard**
- React
- Map views, routing, and KPI tracking

### **Infrastructure**
- Docker + Docker Compose
- Nginx reverse proxy
- Optional Grafana for metrics

---

## ⚙️ Setup & Development

### **1. Clone the Repository**

git clone https://github.com/umitkhanna/StraySafe.git
cd StraySafe

### **2. Copy .env.example to .env and update the following**
DOMAIN=localhost
NODE_ENV=development
API_PORT=3000
ML_PORT=8000
JWT_SECRET=your_secret_key

MONGO_URI=mongodb://mongo:27017/straysafe
REDIS_URL=redis://redis:6379

S3_ENDPOINT=http://minio:9000
S3_BUCKET=straysafe-media
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_USE_SSL=false

PUBLIC_BASE_URL=http://localhost
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin

### **3. Run the following command in terminal**
make up

### **1. Access the services using the following URL's**
Web Dashboard → http://localhost

API → http://localhost/api

ML Service → http://localhost/ml

MinIO Console → http://localhost/console
(login with MINIO_ROOT_USER / MINIO_ROOT_PASSWORD)