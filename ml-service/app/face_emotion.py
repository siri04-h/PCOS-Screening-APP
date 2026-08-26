from deepface import DeepFace
import os

def predict_face_emotion(image_path: str):
    if not os.path.exists(image_path):
        return {
            "emotion": "unknown",
            "confidence": 0.0
        }

    try:
        result = DeepFace.analyze(
            img_path=image_path,
            actions=["emotion"],
            enforce_detection=False
        )

        if isinstance(result, list):
            result = result[0]

        return {
            "emotion": result["dominant_emotion"],
            "confidence": round(
                float(result["emotion"][result["dominant_emotion"]]) / 100,
                3
            )
        }

    except Exception:
        return {
            "emotion": "unknown",
            "confidence": 0.0
        }