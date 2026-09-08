import os
import base64
import json
import time
from io import BytesIO
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from google import genai
from google.genai import types
from PIL import Image

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY not found in environment variables.")

ai_client = genai.Client(api_key=api_key)

app = FastAPI(title="AgriScan Cross River API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001"],
    allow_methods=["POST"],
    allow_headers=["Content-Type"],
)

class DiagnosisRequest(BaseModel):
    image: str
    zone: str = "Cross River State"
    crop: str = "Auto-detect"

SYSTEM_INSTRUCTION = """
You are the Tropical Agrologist AI, an expert plant pathologist and agronomist specializing in Cross River State, Nigeria (Cassava, Cocoa, Oil Palm, Maize, Plantain, Yams).

Rules:
1. Verify if the image contains a plant leaf, stem, or fruit. If not, set "is_plant": false and set all disease fields to null.
2. Treatment recommendations must be practical for Cross River farmers: emphasize accessible local remedies (Dongoyaro/neem extracts, wood ash, sanitation) alongside registered agrochemicals.
3. Formulate "pidgin_audio_script" in authentic, conversational Nigerian Pidgin for rural field hands.
4. If you are less than 85% confident, set needs_clarification to true and generate a single multiple-choice question to ask the farmer. Populate "clarification_question" with the question and "options" with 2-4 plausible choices. If confidence is 85% or higher, set needs_clarification to false.
5. Output strictly valid JSON conforming to the requested schema.
"""

DIAGNOSIS_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "is_plant": {"type": "BOOLEAN"},
        "crop_identified": {"type": "STRING"},
        "health_status": {"type": "STRING"},
        "pathology_name": {"type": "STRING"},
        "confidence_score": {"type": "NUMBER"},
        "severity_level": {"type": "STRING"},
        "observable_symptoms": {"type": "ARRAY", "items": {"type": "STRING"}},
        "immediate_containment_step": {"type": "STRING"},
        "organic_local_remedy": {"type": "STRING"},
        "standard_chemical_treatment": {"type": "STRING"},
        "prevention_future": {"type": "STRING"},
        "pidgin_audio_script": {"type": "STRING"},
        "needs_clarification": {"type": "BOOLEAN"},
        "clarification_question": {"type": "STRING"},
        "options": {"type": "ARRAY", "items": {"type": "STRING"}}
    },
    "required": [
        "is_plant",
        "crop_identified",
        "health_status",
        "pathology_name",
        "confidence_score",
        "severity_level",
        "observable_symptoms",
        "immediate_containment_step",
        "organic_local_remedy",
        "standard_chemical_treatment",
        "prevention_future",
        "pidgin_audio_script",
        "needs_clarification",
        "clarification_question",
        "options"
    ]
}


# Configured to use active 2026 models
MODELS_TO_TRY = [
    "gemini-3.5-flash",
    "gemini-2.5-flash"
]

@app.get("/")
def health_check():
    return {"status": "online", "system": "AgriScan Cross River AI"}

@app.post("/api/diagnose")
async def diagnose(payload: DiagnosisRequest):
    try:
        raw_b64 = payload.image
        if "," in raw_b64:
            raw_b64 = raw_b64.split(",")[1]

        image_bytes = base64.b64decode(raw_b64)
        image = Image.open(BytesIO(image_bytes))

        prompt = (
            f"Analyze this crop photo from the {payload.zone} zone in Cross River State. "
            f"Target crop: {payload.crop}. "
            "Identify the crop, diagnose any pathology or pest damage, evaluate severity, "
            "and provide immediate containment, organic treatment, and the pidgin voice script."
        )

        last_error = None

        for model_name in MODELS_TO_TRY:
            try:
                response = ai_client.models.generate_content(
                    model=model_name,
                    contents=[image, prompt],
                    config=types.GenerateContentConfig(
                        system_instruction=SYSTEM_INSTRUCTION,
                        temperature=0.2,
                        response_mime_type="application/json",
                        response_schema=DIAGNOSIS_SCHEMA
                    )
                )
                return json.loads(response.text)
            except Exception as err:
                last_error = err
                time.sleep(1)
                continue

        raise last_error if last_error else Exception("All models failed.")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
