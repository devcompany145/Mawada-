import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function analyzeCompatibility(userA: any, userB: any) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        Analyze the compatibility for marriage between two individuals based on their profiles.
        Focus on cultural values, life goals, and personality traits.
        
        Profile A:
        - Gender: ${userA.gender}
        - Bio: ${userA.bio}
        - Values: ${userA.values?.join(', ')}
        - Goals: ${userA.goals}
        
        Profile B:
        - Gender: ${userB.gender}
        - Bio: ${userB.bio}
        - Values: ${userB.values?.join(', ')}
        - Goals: ${userB.goals}
        
        Provide a compatibility score (0-100) and a brief professional analysis in Arabic.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            analysis: { type: Type.STRING }
          },
          required: ["score", "analysis"]
        }
      }
    });
    
    return JSON.parse(response.text);
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return { score: 0, analysis: "عذراً، حدث خطأ أثناء تحليل التوافق." };
  }
}

export async function analyzeAssessment(assessment: any) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        Analyze the following personality assessment results for a marriage matchmaking platform.
        Provide a professional, encouraging, and insightful personality profile in Arabic.
        Focus on their strengths in a relationship and what kind of partner would complement them.
        
        Assessment Data:
        - Conflict Handling: ${assessment.conflictStyle}
        - Life Priority: ${assessment.lifePriority}
        - Financial View: ${assessment.financialView}
        - Social Preference: ${assessment.socialPreference}
        - Traditional Values: ${assessment.traditionalValues}
        
        Provide the response in JSON format with three fields:
        1. "profileTitle": A short, catchy title for their personality type (in Arabic).
        2. "detailedAnalysis": A detailed paragraph analyzing their traits and ideal partner (in Arabic).
        3. "readinessScore": A number from 0 to 100 representing their readiness for marriage based on their maturity and clarity of goals.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            profileTitle: { type: Type.STRING },
            detailedAnalysis: { type: Type.STRING },
            readinessScore: { type: Type.NUMBER }
          },
          required: ["profileTitle", "detailedAnalysis", "readinessScore"]
        }
      }
    });
    
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Assessment Analysis Error:", error);
    return { 
      profileTitle: "شخصية متوازنة", 
      detailedAnalysis: "تحليلك الشخصي قيد المعالجة حالياً. بناءً على إجاباتك، أنت شخص يسعى للاستقرار والتفاهم." 
    };
  }
}
