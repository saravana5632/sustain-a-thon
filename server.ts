import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

function getAiClient() {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function generateWithSearchGrounding(prompt: string, systemInstruction: string) {
  const ai = getAiClient();
  const modelsToTry = ['gemini-3.5-flash', 'gemini-3.8-flash'];
  let lastError: unknown = null;

  for (const modelName of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          systemInstruction,
          tools: [{ googleSearch: {} }],
        },
      });
      return { response, modelUsed: modelName };
    } catch (err: unknown) {
      lastError = err;
      const message = err instanceof Error ? err.message : String(err);
      // If model not found (404) or unsupported, fallback to next model in list
      if (message.includes('404') || message.includes('NOT_FOUND') || message.includes('not found')) {
        continue;
      }
      throw err;
    }
  }

  throw lastError;
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // POST /api/search-grounding — Live Google Search Grounding for Buyer & Sector Intelligence
  app.post('/api/search-grounding', async (req, res) => {
    try {
      const { companyName, industry, location, customQuery, contextType } = req.body || {};

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({
          error:
            'GEMINI_API_KEY is not configured. Please check your API key in the Settings > Secrets panel.',
        });
      }

      const systemInstruction =
        'You are PaySure AI, a B2B trade credit and buyer payment confidence analyst for Indian and global businesses. ' +
        'Use Google Search to gather accurate, up-to-date public web intelligence, sector payment trends, MSME credit conditions, ' +
        'company news, and commercial risk indicators. Present your findings clearly in 3-4 concise bullet points plus a 1-sentence ' +
        'commercial safeguard takeaway. Always remain objective and frame insights as decision-support signals, never as a guarantee.';

      let prompt = '';
      if (customQuery && String(customQuery).trim().length > 0) {
        prompt = `Perform a grounded B2B commercial and payment risk research query for: "${String(
          customQuery
        ).trim()}". Focus on recent news, payment cycle reliability, sector credit risks, and actionable B2B supplier safeguards.`;
      } else if (contextType === 'market-pulse') {
        prompt = `What are the latest B2B trade credit, MSME payment cycle trends, and supply chain demand conditions in India for the ${
          industry || 'Manufacturing and Retail'
        } sector? Highlight recent regulatory updates, working capital trends, and commercial safeguards for suppliers.`;
      } else {
        prompt = `Search for recent public business information, news, presence, and industry credit conditions related to company "${
          companyName || 'B2B Buyer'
        }" operating in the "${industry || 'General B2B'}" sector in "${
          location || 'India'
        }". If the specific company is a private/local SME or not widely covered in public news, provide up-to-date grounded intelligence on current B2B payment cycles, credit risks, and demand trends in the ${
          industry || 'B2B'
        } industry in ${location || 'India'} so the supplier can evaluate commercial terms effectively.`;
      }

      const { response, modelUsed } = await generateWithSearchGrounding(
        prompt,
        systemInstruction
      );

      const text = response.text || 'No grounded summary generated.';
      const rawChunks =
        response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

      const sources: { uri: string; title: string }[] = [];
      const seenUris = new Set<string>();

      for (const chunk of rawChunks) {
        const uri = chunk?.web?.uri;
        const title = chunk?.web?.title || uri;
        if (uri && !seenUris.has(uri)) {
          seenUris.add(uri);
          sources.push({ uri, title: title || 'Web Source' });
        }
      }

      const searchQueries =
        response.candidates?.[0]?.groundingMetadata?.webSearchQueries || [];

      return res.json({
        summary: text,
        sources,
        searchQueries,
        modelUsed,
        timestamp: new Date().toISOString(),
      });
    } catch (error: unknown) {
      const errMessage =
        error instanceof Error ? error.message : 'Failed to fetch grounded search data.';
      console.error('Error in /api/search-grounding:', errMessage);
      return res.status(500).json({
        error: errMessage,
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PaySure AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
