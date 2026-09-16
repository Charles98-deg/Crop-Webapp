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
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

class DiagnosisRequest(BaseModel):
    image: str
    zone: str | None = None
    location: str | None = None
    crop: str | None = "Auto-detect"
    cropHint: str | None = None
    fieldNotes: str | None = None

SYSTEM_INSTRUCTION = """
You are the Tropical Agrologist AI, an expert plant pathologist and agronomist specializing in Cross River State, Nigeria (Cassava, Cocoa, Oil Palm, Maize, Plantain, Yams).

Rules:
1. Verification (Rule #1): Verify if the image contains a plant leaf, stem, fruit, pod, or root. If not, set "is_plant": false, "crop_identified": "Not a plant", "action_plan_0_2_hours": "No plant detected. Please take a clear photo of your crop.", and all disease fields to null.
2. Crop Detection: Auto-detect the crop from the image if not specified.
3. Uncertainty & Safety: Never pretend 100% certainty. Use "Likely" or "Possible" if confidence is below 0.85. If evidence is blurry or insufficient, set is_uncertain to true and describe what photo is needed in more_info_needed.
4. Optional Location Context: Farm location is optional. If an LGA is provided, incorporate genuine local context into local_context_used. If not provided, supply general guidance and set local_context_used to "General guidance (no LGA specified)". Never fabricate local facts.
5. 24-Hour Action Plan: Provide practical steps:
   - action_plan_0_2_hours: Immediate containment/isolation (0–2h).
   - action_plan_2_6_hours: Next step today (2–6h).
   - action_plan_6_24_hours: Actions for rest of day/next morning (6–24h).
   - avoid: Array of 2-4 counterproductive or dangerous actions to avoid.
   - escalation: When to seek human/extension expert help.
6. Treatment recommendations: Practical for Cross River farmers (Dongoyaro neem, wood ash, sanitation, standard registered agrochemicals with PPE).
7. Formulate pidgin_audio_script in authentic, warm Nigerian Pidgin for rural field hands.
8. Output strictly valid JSON conforming to the schema.
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
        "action_plan_0_2_hours": {"type": "STRING"},
        "action_plan_2_6_hours": {"type": "STRING"},
        "action_plan_6_24_hours": {"type": "STRING"},
        "avoid": {"type": "ARRAY", "items": {"type": "STRING"}},
        "escalation": {"type": "STRING"},
        "local_context_used": {"type": "STRING"},
        "is_uncertain": {"type": "BOOLEAN"},
        "more_info_needed": {"type": "STRING"},
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
        "confidence_score",
        "severity_level",
        "observable_symptoms",
        "action_plan_0_2_hours",
        "action_plan_2_6_hours",
        "action_plan_6_24_hours",
        "avoid",
        "pidgin_audio_script"
    ]
}


AVAILABLE_MODELS = ["gemini-3.6-flash", "gemini-3.5-flash", "gemini-3.5-flash-lite"]

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

        effective_crop = payload.cropHint or payload.crop or "Auto-detect"
        effective_zone = payload.location or payload.zone or ""

        prompt = "Analyze this crop photo for plant pathology in Cross River State, Nigeria. "
        if effective_crop and effective_crop != "Auto-detect":
            prompt += f"Target crop indicated: {effective_crop}. "
        else:
            prompt += "Auto-detect the crop from the image. "

        if effective_zone and "general" not in effective_zone.lower() and "no location" not in effective_zone.lower():
            prompt += f"Farm location context: {effective_zone}. "
        else:
            prompt += "No specific farm location provided; supply general agricultural guidance. "

        if payload.fieldNotes:
            prompt += f"Field notes: {payload.fieldNotes}. "

        prompt += "Identify the crop, evaluate symptoms, determine severity, provide structured 24-hour action plan (0-2h, 2-6h, 6-24h, avoid, escalation), organic and agrochemical treatments, and Nigerian Pidgin audio script."

        for model_name in AVAILABLE_MODELS:
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
            except Exception as e:
                print(f"Model {model_name} failed: {e}")
                continue

        raise HTTPException(status_code=500, detail="All AI fallback models failed.")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
