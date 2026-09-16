import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

// Load .env.local first (matching README instructions), then fall back to .env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

// Middleware for body parsing with large image payload support (25mb)
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Lazy initializer for Gemini client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set in environment secrets.');
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// Plant Pathology Diagnosis endpoint
app.post('/api/diagnose', async (req, res) => {
  try {
    const {
      image,
      mimeType = 'image/jpeg',
      cropHint,
      crop,
      location,
      zone,
      fieldNotes,
    } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'No image provided for diagnosis.' });
    }

    const effectiveCrop = cropHint || crop || 'Auto-detect';
    const effectiveLocation = location || zone || '';

    const ai = getGeminiClient();

    // Clean base64 string if data url prefix is present
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');

    const systemInstruction = `You are an expert plant pathologist and agronomist specializing in West African tropical agriculture, specifically crops prevalent in Cross River State, Nigeria: Cassava (Manihot esculenta), Cocoa (Theobroma cacao), Oil Palm (Elaeis guineensis), Maize (Zea mays), Plantain (Musa paradisiaca), and Yams (Dioscorea spp.).

Your task is to analyze photos of crop leaves, stems, roots, pods, or fruits, auto-detect the crop, assess any pathology, pest, or nutrient deficiency, and provide a clear, practical 24-HOUR ACTION PLAN for the farmer.

Follow these strict operational and product rules:

1. Verification (Rule #1):
   First determine if the image contains a plant (crop leaf, stem, fruit, pod, trunk, tuber, root, or whole plant).
   If the image is NOT a plant (e.g. an animal, person, tool, vehicle, household item, screenshot of text):
   - Set "is_plant": false
   - Set "crop_identified": "Not a plant"
   - Set "health_status": "Unknown"
   - Set "pathology_name": null
   - Set "confidence_score": 0.0
   - Set "severity_level": "None"
   - Set "observable_symptoms": []
   - Set "immediate_containment_step": null
   - Set "action_plan_0_2_hours": "No plant tissue detected. Please take a clear photo of your crop leaf, stem, or fruit."
   - Set "action_plan_2_6_hours": null
   - Set "action_plan_6_24_hours": null
   - Set "avoid": ["Do not upload photos of tools, machinery, or buildings.", "Do not apply agricultural interventions to non-crop items."]
   - Set "escalation": null
   - Set "local_context_used": null
   - Set "organic_local_remedy": null
   - Set "standard_chemical_treatment": null
   - Set "prevention_future": null
   - Set "pidgin_audio_script": "Dis picture no be plant o. Abeg snap clean photo of your crop leaf, stem, fruit, or yam mound wey you wan make we inspect."

2. Crop Auto-Detection:
   Auto-detect the crop from the image. If the farmer did not supply a crop hint, identify the crop accurately based on visible morphology.

3. Uncertainty & Diagnostic Safety (Never Pretend False Certainty):
   - Never claim "100% confirmed diagnosis" or "100% accurate".
   - If confidence is moderate (between 0.60 and 0.84), prefix pathology_name with "Likely: " or "Possible: ".
   - If evidence is insufficient, blurry, or poor quality (confidence < 0.60), set "is_uncertain": true, state "Possible issue: [Condition]", and populate "more_info_needed" specifying what photo is needed (e.g. "Take a closer photo of the leaf underside showing lesions clearly").
   - Never recommend aggressive chemical cocktails when diagnosis is uncertain.

4. Optional Location Context (Never Fabricate):
   - Farm location is OPTIONAL. If a specific Local Government Area (LGA) or zone in Cross River was provided, incorporate relevant local agricultural context (e.g. Cocoa belt in Ikom/Etung/Boki, Yam hub in Ogoja/Yala, Palm in Akamkpa) and state what was used in "local_context_used".
   - If NO LGA was provided (or "General Guidance"), provide sound, general Cross River/tropical West African guidance. Set "local_context_used" to "General guidance (no LGA specified)". NEVER invent fake local facts or dealers.

5. Practical 24-Hour Action Plan (Critical):
   Break down the response into concrete chronological steps:
   - "immediate_containment_step": Urgent triage action within the first hours.
   - "action_plan_0_2_hours": Immediate field containment (0-2 hours): e.g. rogueing, physical isolation, bag infected pods.
   - "action_plan_2_6_hours": Next action today (2-6 hours): e.g. preparing organic neem wash, sifting wood ash, checking border rows.
   - "action_plan_6_24_hours": Rest of the 24 hours (6-24 hours): e.g. dusk/dawn spraying, checking morning dew spread, acquiring inputs.
   - "avoid": Array of 2 to 4 specific dangerous or counterproductive actions (e.g. "Do not spray during rain", "Do not cut healthy upper leaves", "Do not use unsterilized cutlasses").
   - "escalation": Practical conditions requiring an extension officer, cooperative leader, or agronomist.

6. Nigerian Pidgin Audio Script:
   - Formulate clear, direct, warm Nigerian Pidgin instructions.
   - Summarize what may be happening, how serious it looks, what to do now, what to do in the next 24 hours, and what to avoid.

7. Output Schema:
   Return strictly valid JSON conforming to the schema.`;

    let promptText = `Analyze this agricultural field image for crop pathology in Cross River State, Nigeria.`;
    if (effectiveCrop && effectiveCrop !== 'Auto-detect') {
      promptText += ` The farmer indicated this crop is likely: ${effectiveCrop}.`;
    } else {
      promptText += ` The crop was not specified; please auto-detect the crop from the visual evidence.`;
    }
    if (
      effectiveLocation &&
      effectiveLocation.trim() &&
      !effectiveLocation.toLowerCase().includes('general') &&
      !effectiveLocation.toLowerCase().includes('no location')
    ) {
      promptText += ` Optional farm location provided: ${effectiveLocation}, Cross River State. Apply local agricultural context if relevant.`;
    } else {
      promptText += ` No specific LGA provided; provide high-quality general West African agricultural guidance.`;
    }
    if (fieldNotes) {
      promptText += ` Field notes from farmer: ${fieldNotes}.`;
    }

    const candidateModels = ['gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3.5-flash-lite'];
    let response: any = null;
    let lastError: any = null;

    for (const modelName of candidateModels) {
      try {
        response = await ai.models.generateContent({
          model: modelName,
          contents: {
            parts: [
              {
                inlineData: {
                  data: base64Data,
                  mimeType: mimeType || 'image/jpeg',
                },
              },
              {
                text: promptText,
              },
            ],
          },
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                is_plant: {
                  type: Type.BOOLEAN,
                  description: 'Whether the image contains a plant or crop part',
                },
                crop_identified: {
                  type: Type.STRING,
                  description: 'Name of the crop identified or "Not a plant"',
                },
                health_status: {
                  type: Type.STRING,
                  enum: ['Healthy', 'Diseased', 'Pest Infested', 'Nutrient Deficient', 'Unknown'],
                  description: 'Overall health condition of the crop',
                },
                pathology_name: {
                  type: Type.STRING,
                  nullable: true,
                  description: 'Specific common or scientific name of the disease, pest, or deficiency (or null if not plant)',
                },
                confidence_score: {
                  type: Type.NUMBER,
                  description: 'Pathologist confidence score between 0.0 and 1.0. Calibrate responsibly, avoid claiming 100% certainty.',
                },
                is_uncertain: {
                  type: Type.BOOLEAN,
                  description: 'True if visual evidence is blurry, obscured, or insufficient for certain diagnosis',
                },
                more_info_needed: {
                  type: Type.STRING,
                  nullable: true,
                  description: 'Specific instructions on what part of crop or clearer angle is needed if uncertain',
                },
                severity_level: {
                  type: Type.STRING,
                  enum: ['None', 'Low', 'Moderate', 'Critical'],
                  description: 'Urgency and damage level',
                },
                observable_symptoms: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'List of visible pathological signs and lesions',
                },
                action_plan_0_2_hours: {
                  type: Type.STRING,
                  nullable: true,
                  description: 'Step 1: Immediate containment or isolation action within first 2 hours',
                },
                action_plan_2_6_hours: {
                  type: Type.STRING,
                  nullable: true,
                  description: 'Step 2: Field triage, organic preparation, or treatment within 2-6 hours',
                },
                action_plan_6_24_hours: {
                  type: Type.STRING,
                  nullable: true,
                  description: 'Step 3: Farm-wide inspection, protective barriers, or monitoring within 6-24 hours',
                },
                avoid: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'What the farmer must NOT do today (harmful practices)',
                },
                escalation: {
                  type: Type.STRING,
                  nullable: true,
                  description: 'When and how to escalate to local ADP extension officer or community leader',
                },
                local_context_used: {
                  type: Type.STRING,
                  nullable: true,
                  description: 'Cross River LGA agro-ecological context used, or "General guidance (No LGA specified)"',
                },
                immediate_containment_step: {
                  type: Type.STRING,
                  nullable: true,
                  description: 'Same as action_plan_0_2_hours for backward compatibility',
                },
                organic_local_remedy: {
                  type: Type.STRING,
                  nullable: true,
                  description: 'Accessible local organic treatments (neem, wood ash, pruning, etc.) available in Nigeria',
                },
                standard_chemical_treatment: {
                  type: Type.STRING,
                  nullable: true,
                  description: 'Commercial agrochemicals available in Nigerian agro-dealer shops with safety warnings',
                },
                prevention_future: {
                  type: Type.STRING,
                  nullable: true,
                  description: 'Long-term agronomic prevention, resistant varieties, and soil management',
                },
                pidgin_audio_script: {
                  type: Type.STRING,
                  description: 'Clear, direct instructions spoken in authentic Nigerian Pidgin for rural field hands',
                },
              },
              required: [
                'is_plant',
                'crop_identified',
                'health_status',
                'confidence_score',
                'severity_level',
                'observable_symptoms',
                'action_plan_0_2_hours',
                'action_plan_2_6_hours',
                'action_plan_6_24_hours',
                'avoid',
                'pidgin_audio_script',
              ],
            },
          },
        });
        if (response?.text) break;
      } catch (err: any) {
        console.warn(`Model ${modelName} attempt failed:`, err?.message || err);
        lastError = err;
      }
    }

    if (!response?.text) {
      throw lastError || new Error('All Gemini model candidates failed to respond.');
    }

    const textOutput = response.text?.trim() || '{}';
    let parsedResult;
    try {
      parsedResult = JSON.parse(textOutput);
    } catch {
      // Clean possible stray formatting
      const cleaned = textOutput.replace(/^```json\s*/, '').replace(/```$/, '').trim();
      parsedResult = JSON.parse(cleaned);
    }

    // Ensure all schema fields exist according to rules
    if (!parsedResult.is_plant) {
      parsedResult.is_plant = false;
      parsedResult.pathology_name = null;
      parsedResult.immediate_containment_step = null;
      parsedResult.action_plan_0_2_hours = 'No plant tissue detected. Please photograph a crop leaf, stem, or fruit.';
      parsedResult.action_plan_2_6_hours = null;
      parsedResult.action_plan_6_24_hours = null;
      parsedResult.avoid = ['Do not upload non-plant objects.', 'Do not apply chemicals to non-crop items.'];
      parsedResult.escalation = null;
      parsedResult.local_context_used = null;
      parsedResult.organic_local_remedy = null;
      parsedResult.standard_chemical_treatment = null;
      parsedResult.prevention_future = null;
      if (!parsedResult.observable_symptoms) {
        parsedResult.observable_symptoms = [];
      }
    }

    res.json(parsedResult);
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Diagnosis error:', error);
    res.status(500).json({
      error: error.message || 'Failed to complete agricultural pathology diagnosis.',
    });
  }
});

// TTS proxy endpoint using Gemini TTS if requested
app.post('/api/tts', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text required' });
    }

    const ai = getGeminiClient();
    const ttsResponse = await ai.models.generateContent({
      model: 'gemini-3.1-flash-tts-preview',
      contents: [{ parts: [{ text: `Speak in a clear, friendly West African cadence: ${text}` }] }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return res.json({ audioBase64: base64Audio, mimeType: 'audio/wav' });
    }
    res.status(500).json({ error: 'No audio generated' });
  } catch (err: unknown) {
    const error = err as Error;
    console.warn('TTS API error (client will fallback to SpeechSynthesis):', error.message);
    res.status(500).json({ error: error.message, fallback: true });
  }
});

async function startServer() {
  // Serve public static assets (videos, posters, icons) with proper MIME types and range headers
  app.use(express.static(path.join(process.cwd(), 'public')));

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: { port: 24679 },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Cross River Agronomist server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
