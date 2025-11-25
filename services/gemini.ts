
import { GoogleGenAI, Type } from "@google/genai";
import { PredictionResult, CrashPredictionResult, MinesPredictionResult } from '../types';

const GRID_COLS = 5;

// Initialize the Gemini client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generatePrediction = async (rowCount: number, difficulty: string): Promise<PredictionResult> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
        Analyze the pattern for an 'Apple of Fortune' style probability grid (${rowCount} rows, ${GRID_COLS} columns).
        The Difficulty Setting is: ${difficulty.toUpperCase()}.
        ${difficulty === 'Hard' ? 'Assume high density of traps. Look for deviations and non-linear paths.' : ''}
        ${difficulty === 'Easy' ? 'Assume lower trap density. Prioritize central safe zones.' : ''}
        
        The goal is to select one safe column (0-4) for each row from bottom (row 0) to top (row ${rowCount - 1}).
        Generate a winning path sequence based on probability simulation.
        Also provide a short, cool, tactical analysis string explaining the pattern (e.g. "Vertical bias detected on left sector").
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            path: {
              type: Type.ARRAY,
              items: { type: Type.INTEGER },
              description: `An array of exactly ${rowCount} integers, each between 0 and ${GRID_COLS - 1}. Index 0 is the bottom row, Index ${rowCount - 1} is the top row.`,
            },
            confidence: {
              type: Type.NUMBER,
              description: "A confidence percentage between 75 and 99.",
            },
            analysis: {
              type: Type.STRING,
              description: "A short, technical sounding analysis of the prediction.",
            }
          },
          required: ["path", "confidence", "analysis"],
        },
      },
    });

    const result = JSON.parse(response.text || '{}');

    // Validation to ensure the model returned valid grid coordinates
    const path = Array.isArray(result.path) 
      ? result.path.slice(0, rowCount).map((p: number) => Math.max(0, Math.min(GRID_COLS - 1, Number(p))))
      : Array(rowCount).fill(-1);
    
    // Ensure we have correct number of items if the model shorted us (fallback)
    while (path.length < rowCount) {
        path.push(-1);
    }

    return {
      path: path,
      confidence: result.confidence || 85.5,
      analysis: result.analysis || "Pattern recognition sequence complete.",
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      path: Array(rowCount).fill(-1),
      confidence: 0,
      analysis: "API Connection Failed - No Path Generated",
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
  }
};

export const generateCrashPrediction = async (): Promise<CrashPredictionResult> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
        Simulate a "Crash" gambling game algorithm analysis. 
        1. Generate a sequence of 5 hypothetical "recent history" multipliers. They MUST be floats between 1.00 and 3.00 (e.g., 1.20, 2.45, 1.10, 2.80).
        2. Based on this history, predict the NEXT crash point (float). The prediction MUST be strictly between 1.00 and 3.00.
        3. Suggest a "Safe Cashout" point slightly lower than the prediction.
        4. Provide a technical analysis string (e.g., "Trend reversal detected at 2.4x median").
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            history: {
              type: Type.ARRAY,
              items: { type: Type.NUMBER },
              description: "5 recent float multipliers between 1.00 and 3.00",
            },
            predictedCrash: {
              type: Type.NUMBER,
              description: "The predicted crash point (e.g. 2.45), between 1.00 and 3.00",
            },
            safeCashout: {
              type: Type.NUMBER,
              description: "A safe exit point (e.g. 2.20)",
            },
            confidence: {
              type: Type.NUMBER,
              description: "Confidence percentage between 60 and 95",
            },
            analysis: {
              type: Type.STRING,
              description: "Technical analysis text",
            }
          },
          required: ["history", "predictedCrash", "safeCashout", "confidence", "analysis"],
        },
      },
    });

    const result = JSON.parse(response.text || '{}');
    
    // Enforce logic constraint: Prediction between 1.00 and 3.00
    let predictedCrash = result.predictedCrash || 2.00;
    predictedCrash = Math.max(1.00, Math.min(3.00, predictedCrash));

    return {
      predictedCrash: predictedCrash,
      safeCashout: result.safeCashout || 1.80,
      history: result.history || [1.2, 2.4, 1.1, 2.0, 1.5],
      confidence: result.confidence || 80,
      analysis: result.analysis || "Market volatility stable.",
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };

  } catch (error) {
    console.error("Gemini API Error (Crash):", error);
    return {
      predictedCrash: 0,
      safeCashout: 0,
      history: [],
      confidence: 0,
      analysis: "Connection Failed",
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
  }
};

export const generateMinesPrediction = async (mineCount: number): Promise<MinesPredictionResult> => {
    // Calculate total safe spots based on the user's selected mine count.
    // E.g., if there are 25 cells and user says 20 mines, we need to show 5 safe spots.
    const safeSpotCount = Math.max(1, 25 - mineCount);

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `
              Analyze a "Mines" probability grid (5x5, 25 cells total).
              There are ${mineCount} mines hidden on the board.
              Based on RNG seed analysis patterns, predict exactly ${safeSpotCount} SAFE spots to click.
              The prediction must reveal all safe cells, meaning you must return ${safeSpotCount} distinct indices.
              Return indices 0-24 (where 0 is top-left, 4 is top-right, 24 is bottom-right).
            `,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        safeSpots: {
                            type: Type.ARRAY,
                            items: { type: Type.INTEGER },
                            description: `Array of exactly ${safeSpotCount} distinct integers between 0 and 24 representing safe cells.`,
                        },
                        confidence: {
                            type: Type.NUMBER,
                            description: "Confidence percentage between 70 and 99.",
                        },
                        analysis: {
                            type: Type.STRING,
                            description: "Brief tactical analysis of the mine distribution.",
                        }
                    },
                    required: ["safeSpots", "confidence", "analysis"],
                }
            }
        });

        const result = JSON.parse(response.text || '{}');
        const safeSpots = Array.isArray(result.safeSpots) ? result.safeSpots : [];

        // Fallback if the AI returns weird data
        if (safeSpots.length === 0 && safeSpotCount > 0) {
             for (let i = 0; i < safeSpotCount; i++) {
                 safeSpots.push(i);
             }
        }

        return {
            safeSpots: safeSpots,
            confidence: result.confidence || 88,
            analysis: result.analysis || "Cluster analysis suggests clear sectors.",
            id: crypto.randomUUID()
        };

    } catch (error) {
        console.error("Gemini API Error (Mines):", error);
        return {
            safeSpots: [],
            confidence: 0,
            analysis: "Prediction unavailable.",
            id: crypto.randomUUID()
        };
    }
};
      
