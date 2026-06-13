import { NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { GoogleGenAI } from '@google/genai';

export async function POST(request: Request) {
  try {
    const { codigo_seguimiento, tipo_basura } = await request.json();

    if (!codigo_seguimiento || !tipo_basura) {
      return NextResponse.json({ success: false, error: 'Faltan parámetros: codigo_seguimiento o tipo_basura' }, { status: 400 });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return NextResponse.json({ success: false, error: 'No hay API Key de Gemini configurada' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey: geminiApiKey });

    const prompt = `Como capa final CNN, basado en detección "${tipo_basura}", genera vector Softmax JSON. Probabilidades suman 1.0. Estructura: {"clases_softmax":[{"clase":"PLÁSTICOS","prob":0.0},{"clase":"METALES","prob":0.0},{"clase":"ORGÁNICOS","prob":0.0},{"clase":"PAPEL/CARTÓN","prob":0.0},{"clase":"RES. MIXTOS","prob":0.0}]}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.1,
        responseMimeType: "application/json"
      }
    });

    let clasesSoftmax = null;

    try {
      const responseText = response.text || '';
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      
      if (parsed.clases_softmax && Array.isArray(parsed.clases_softmax)) {
        clasesSoftmax = parsed.clases_softmax.sort((a: any, b: any) => b.prob - a.prob);
      } else {
        throw new Error('Estructura Softmax inválida');
      }
    } catch (parseError) {
      console.error("Error parseando JSON de Gemini:", parseError);
      return NextResponse.json({ success: false, error: 'La IA devolvió un formato inválido.' }, { status: 500 });
    }

    // Actualizar en Supabase si está configurado
    if (isSupabaseConfigured && supabaseAdmin) {
      const { error } = await supabaseAdmin
        .from('reportes')
        .update({ clases_softmax: clasesSoftmax })
        .eq('codigo_seguimiento', codigo_seguimiento);

      if (error) {
        console.error("Error guardando en Supabase:", error);
        // Fallback silently if DB column is missing
      }
    }

    return NextResponse.json({ success: true, clases_softmax: clasesSoftmax });

  } catch (error) {
    console.error("Error en API /infer:", error);
    return NextResponse.json({ success: false, error: 'Error procesando la solicitud' }, { status: 500 });
  }
}
