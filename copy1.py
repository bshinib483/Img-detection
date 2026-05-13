import json
import cv2
import torch
import numpy as np

from PIL import Image
from ultralytics import YOLO

from torchvision import transforms
from torchvision import models

import torch.nn as nn

# =====================================
# DEVICE
# =====================================

device = torch.device(
    "cuda" if torch.cuda.is_available()
    else "cpu"
)

# =====================================
# LOAD YOLO
# =====================================

detector = YOLO(
    "detector/best.pt"
)

# =====================================
# LOAD CLASS NAMES
# =====================================

with open(
    "classifier/class_names.json",
    "r"
) as f:

    class_names = json.load(f)

# =====================================
# LOAD CLASSIFIER
# =====================================

classifier = models.efficientnet_b0(
    pretrained=False
)

classifier.classifier[1] = nn.Linear(
    classifier.classifier[1].in_features,
    len(class_names)
)

classifier.load_state_dict(
    torch.load(
        "classifier/aircraft_classifier_efficientnet.pth",
        map_location=device
    )
)

classifier = classifier.to(device)

classifier.eval()

# =====================================
# IMAGE TRANSFORM
# =====================================

transform = transforms.Compose([

    transforms.Resize((224,224)),

    transforms.ToTensor()
])

# =====================================
# LOAD IMAGE
# =====================================

image_path = "test_images/test3.jpg"

image = cv2.imread(image_path)

results = detector(image_path)

# =====================================
# LOOP DETECTIONS
# =====================================

for result in results:

    boxes = result.boxes

    for box in boxes:

        x1, y1, x2, y2 = map(
            int,
            box.xyxy[0]
        )

        confidence = float(box.conf[0])

        # Crop aircraft
        crop = image[y1:y2, x1:x2]

        # Convert to PIL
        crop_pil = Image.fromarray(
            cv2.cvtColor(
                crop,
                cv2.COLOR_BGR2RGB
            )
        )

        # Transform
        input_tensor = transform(
            crop_pil
        ).unsqueeze(0).to(device)

        # Classification
        with torch.no_grad():

            outputs = classifier(
                input_tensor
            )

            _, predicted = torch.max(
                outputs,
                1
            )

        predicted_class = class_names[
            predicted.item()
        ]

        # Draw box
        cv2.rectangle(
            image,
            (x1, y1),
            (x2, y2),
            (0,255,0),
            2
        )

        # Put label
        text = f"{predicted_class} {confidence:.2f}"

        cv2.putText(
            image,
            text,
            (x1, y1 - 10),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.8,
            (0,255,0),
            2
        )

# =====================================
# SAVE RESULT
# =====================================

output_path = "prediction.jpg"

cv2.imwrite(
    output_path,
    image
)
predicted_class = class_names[
    predicted.item()
]

print("\n====================")
print(f"Detected Aircraft: {predicted_class}")
print(f"Confidence: {confidence:.2f}")
print(f"Bounding Box: ({x1}, {y1}), ({x2}, {y2})")
print("====================")