FROM python:3.11-slim
WORKDIR /app
RUN apt-get update && apt-get install -y ffmpeg libgl1 && rm -rf /var/lib/apt/lists/*
COPY apps/ml/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY apps/ml/ .
EXPOSE 8000
CMD ["uvicorn","main:app","--host","0.0.0.0","--port","8000"]
