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
    const { image, mimeType = 'image/jpeg', cropHint, location, fieldNotes } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'No image provided for diagnosis.' });
    }

    const ai = getGeminiClient();

    // Clean base64 string if data url prefix is present
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');

    const systemInstruction = `You are an expert plant pathologist and agronomist specializing in West African tropical agriculture, specifically crops prevalent in Cross River State, Nigeria: Cassava (Manihot esculenta), Cocoa (Theobroma cacao), Oil Palm (Elaeis guineensis), Maize (Zea mays), Plantain (Musa paradisiaca), and Yams (Dioscorea spp.).

Your task is to analyze user-uploaded photos of crop leaves, stems, roots, pods, or fruits, diagnose any disease, pest infestation, or nutrient deficiency, and provide accurate, actionable management protocols.

Follow these strict operational rules:
1. Verification:
   First determine if the image is a plant (crop leaf, stem, fruit, pod, trunk, tuber, root, or whole plant).
   If the image is NOT a plant (e.g. an animal, person, tool, vehicle, household item, screenshot of text):
   - Set "is_plant": false
   - Set "crop_identified": "Not a plant"
   - Set "health_status": "Unknown"
   - Set "pathology_name": null
   - Set "confidence_score": 0.0
   - Set "severity_level": "None"
   - Set "observable_symptoms": []
   - Set "immediate_containment_step": null
   - Set "organic_local_remedy": null
   - Set "standard_chemical_treatment": null
   - Set "prevention_future": null
   - Set "pidgin_audio_script": "Dis picture no be plant o. Abeg snap clean photo of your crop leaf, stem, fruit, or yam mound wey you wan make we inspect."

2. Cross River Agricultural Context:
   If the image IS a plant, assess it strictly within the agronomic and pathological reality of Cross River State, Nigeria (including the Cocoa belt of Ikom, Etung, and Boki; the Grain & Yam zones of Ogoja, Yala, and Obudu; the Oil Palm & Cassava belts of Akamkpa, Biase, Obubra, and Calabar).
   Identify specific diseases (e.g., Cassava Mosaic Disease, Cassava Bacterial Blight, Cassava Green Mite; Cocoa Black Pod / Phytophthora megakarya, Cocoa Mirids / Sahlbergella; Maize Fall Armyworm / Spodoptera frugiperda, Maize Southern Rust, Maize Stalk Borer; Plantain Black Sigatoka / Pseudocercospora fijiensis, Banana Bunchy Top Virus; Oil Palm Orange Frond Spotting / Magnesium deficiency, Anthracnose, Basal Stem Rot; Yam Anthracnose / Colletotrichum dieback, Yam Mosaic Virus, Yam Beetle / Heteroligus).
   If the crop is completely healthy, set health_status to "Healthy", pathology_name to "None / Healthy Plant", severity_level to "None", and provide maintenance tips.

   Provide practical treatments available in Nigeria:
   - "organic_local_remedy": Emphasize accessible organic remedies such as neem leaf/seed extract (Dongoyaro) boiled or steeped with local black soap, wood ash dusting, phytosanitary pruning/de-trashing, rogueing and burning/burying diseased tissue, crop spacing, crop rotation, and botanical extracts.
   - "standard_chemical_treatment": Recommend real, registered agrochemicals commonly stocked in Nigerian farm input stores (e.g., Ridomil Gold [Mefenoxam + Mancozeb], Nordox/Kocide [Copper oxide/hydroxide], Lamdex/Karate [Lambda-cyhalothrin], Ampligo, systemic fungicides like Carbendazim/Propiconazole). Mention safety: PPE, gloves, boots, and withholding periods.
   - "immediate_containment_step": Urgent first 24-hour action (e.g. cut and burn infected pod, quarantine row, stop overhead watering).
   - "prevention_future": Resistant varieties (e.g., IITA TME 419 cassava, Oba Super maize, certified yam minisett), spacing, drainage.

3. Nigerian Pidgin Audio Script:
   - "pidgin_audio_script": Formulate a clear, direct, warm, and authentic explanation in Nigerian Pidgin so that rural field hands and smallholder farmers can listen to and understand the instructions instantly via Text-to-Speech.
   - Begin with a friendly rural greeting ("Farmer well done o! Wetin we dey look so na...").
   - Clearly state the problem, how bad it is, the first thing to do today, the free or cheap organic remedy using local materials, the agrochemical option if serious, and words of encouragement.

4. Output Schema:
   Return strictly typed JSON conforming exactly to the schema. Do not output markdown codeblocks.`;

    let promptText = `Analyze this agricultural field image for crop pathology in Cross River State, Nigeria.`;
    if (cropHint && cropHint !== 'Auto-detect') {
      promptText += ` The farmer indicated this crop is likely: ${cropHint}.`;
    }
    if (location) {
      promptText += ` Field location: ${location}, Cross River State.`;
    }
    if (fieldNotes) {
      promptText += ` Field hand notes: ${fieldNotes}.`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
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
              description: 'Pathologist confidence score between 0.0 and 1.0',
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
            immediate_containment_step: {
              type: Type.STRING,
              nullable: true,
              description: 'Immediate quarantine or containment action required within 24 hours',
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
            'pidgin_audio_script',
          ],
        },
      },
    });

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
