import io
import json
import cv2
import torch
import numpy as np
import base64
from PIL import Image
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
from torchvision import transforms, models
import torch.nn as nn

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print("Loading YOLO detector...")
detector = YOLO("detector/best.pt")

print("Loading classifier...")
with open("classifier/class_names.json", "r") as f:
    class_names = json.load(f)

# Use weights=None to avoid warnings in newer torchvision versions
classifier = models.efficientnet_b0(weights=None)
classifier.classifier[1] = nn.Linear(classifier.classifier[1].in_features, len(class_names))
classifier.load_state_dict(torch.load("classifier/aircraft_classifier_efficientnet.pth", map_location=device))
classifier = classifier.to(device)
classifier.eval()

transform = transforms.Compose([
    transforms.Resize((224,224)),
    transforms.ToTensor()
])

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    # Keep a copy for drawing
    output_image = image.copy()

    results = detector(image)
    
    detections = []

    for result in results:
        boxes = result.boxes
        for box in boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            confidence = float(box.conf[0])
            
            crop = image[y1:y2, x1:x2]
            # Handle empty crop
            if crop.size == 0:
                continue
                
            crop_pil = Image.fromarray(cv2.cvtColor(crop, cv2.COLOR_BGR2RGB))
            input_tensor = transform(crop_pil).unsqueeze(0).to(device)
            
            with torch.no_grad():
                outputs = classifier(input_tensor)
                _, predicted = torch.max(outputs, 1)
                
            predicted_class = class_names[predicted.item()]
            
            # Draw tactical box
            cv2.rectangle(output_image, (x1, y1), (x2, y2), (178, 255, 0), 2)  # BGR for #00FFB2
            label = f"{predicted_class} ({confidence:.2f})"
            # Tactical label background
            (w, h), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 1)
            cv2.rectangle(output_image, (x1, y1 - 25), (x1 + w, y1), (178, 255, 0), -1)
            cv2.putText(output_image, label, (x1, y1 - 8), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (5, 5, 5), 2)
            
            detections.append({
                "model": predicted_class,
                "confidence": confidence,
                "bbox": [x1, y1, x2, y2]
            })

    # Encode output image to base64
    _, buffer = cv2.imencode('.jpg', output_image)
    image_base64 = base64.b64encode(buffer).decode('utf-8')

    if not detections:
        return {"model": "No Aircraft Detected", "confidence": 0, "image_base64": image_base64}
    
    best_detection = max(detections, key=lambda x: x["confidence"])
    model_name = best_detection["model"]
    
    return {
        "model": model_name,
        "confidence": best_detection["confidence"],
        "image_base64": image_base64
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
