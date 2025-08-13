from fastapi import FastAPI, UploadFile, File
app = FastAPI()

@app.get("/health")
def health():
    return {"ok": True}

@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    # TODO: run YOLO, return stub for now
    return {"dogs": {"count": 0, "boxes": []}, "garbage": {"present": False, "score": 0.0}}

@app.post("/blur")
async def blur(file: UploadFile = File(...)):
    # TODO: detect faces/plates and return blurred file URL (S3)
    return {"blurredUrl": "s3://...", "faces": 0, "plates": 0}
