import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { isSupabaseConfigured, supabaseAdmin, Reporte } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const mensaje = formData.get('mensaje') as string || '';
    const latitudStr = formData.get('latitud') as string || '0';
    const longitudStr = formData.get('longitud') as string || '0';
    
    const latitud = parseFloat(latitudStr);
    const longitud = parseFloat(longitudStr);

    // Generar código de seguimiento tipo GAMLP-XXXXX
    const randNum = Math.floor(10000 + Math.random() * 90000);
    const codigoSeguimiento = `GAMLP-${randNum}`;

    // Comprobar variables de entorno
    const geminiApiKey = process.env.GEMINI_API_KEY || '';
    const useRealAI = geminiApiKey.trim() !== '' && isSupabaseConfigured;

    if (!useRealAI) {
      // Simular latencia de red en modo Demo
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Clasificación mock basada en palabras clave del mensaje
      let tipoBasura = "Desechos mezclados y bolsas plásticas";
      let urgenciaBase = 5;
      
      const msgLower = mensaje.toLowerCase();
      if (msgLower.includes('botella') || msgLower.includes('plástico') || msgLower.includes('envase')) {
        tipoBasura = "Plásticos acumulados, botellas PET y envolturas plásticas en vía pública";
        urgenciaBase = 4;
      } else if (msgLower.includes('comida') || msgLower.includes('basura orgánica') || msgLower.includes('olor') || msgLower.includes('perro') || msgLower.includes('podrido')) {
        tipoBasura = "Desechos orgánicos en descomposición y desperdicios sanitarios";
        urgenciaBase = 8;
      } else if (msgLower.includes('escombro') || msgLower.includes('ladrillo') || msgLower.includes('cemento') || msgLower.includes('madera')) {
        tipoBasura = "Escombros de construcción y restos de remodelación civil";
        urgenciaBase = 6;
      } else if (msgLower.includes('llanta') || msgLower.includes('metal') || msgLower.includes('fierro') || msgLower.includes('chatarra')) {
        tipoBasura = "Llantas usadas, chatarra metálica abandonada y piezas mecánicas";
        urgenciaBase = 5;
      } else if (msgLower.includes('peligroso') || msgLower.includes('químico') || msgLower.includes('jeringa') || msgLower.includes('batería') || msgLower.includes('hospital')) {
        tipoBasura = "Residuos peligrosos, baterías de plomo y material con riesgo infeccioso";
        urgenciaBase = 9;
      }

      const mockReporte: Reporte = {
        codigo_seguimiento: codigoSeguimiento,
        latitud,
        longitud,
        tipo_basura: tipoBasura,
        urgencia_base: urgenciaBase,
        urgencia_dinamica: urgenciaBase,
        mensaje_ciudadano: mensaje || "Sin mensaje adicional del ciudadano.",
        tracking_step: 0,
        fecha_creacion: new Date().toISOString(),
        imagen_url: "" // El frontend guardará la foto temporalmente en localStorage en modo demo
      };
      
      return NextResponse.json({
        success: true,
        isDemo: true,
        reporte: mockReporte
      });
    }

    if (!file) {
      return NextResponse.json({ success: false, error: "No se proporcionó ninguna imagen." }, { status: 400 });
    }

    // 1. Subir la imagen a Supabase Storage
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const filePath = `reportes/${codigoSeguimiento}.${fileExtension}`;
    
    const { data: uploadData, error: uploadError } = await supabaseAdmin!.storage
      .from('trash-images')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true
      });

    if (uploadError) {
      console.error("Error en subida de Storage:", uploadError);
      return NextResponse.json({ 
        success: false, 
        error: `Error al guardar la imagen en el almacenamiento: ${uploadError.message || JSON.stringify(uploadError)}` 
      }, { status: 500 });
    }

    // Obtener la URL pública de la imagen
    const { data: { publicUrl } } = supabaseAdmin!.storage
      .from('trash-images')
      .getPublicUrl(filePath);

    // 2. Analizar con Gemini usando el SDK @google/genai
    const ai = new GoogleGenAI({ apiKey: geminiApiKey });
    const base64Image = buffer.toString('base64');

    const prompt = `Analiza imagen de basura urbana. Devuelve JSON: {"tipo_basura":"descripción breve","urgencia_base":N,"mensaje_ciudadano":"texto"}.
N es 1-10. 
Si NO es basura: N=1, mensaje="Estimado vecino, imagen sin residuos. Use la plataforma solo para limpieza."
Si basura leve (1-3): mensaje="Agradecemos reporte. Deposite en contenedor próximo."
Media (4-6): mensaje="Reporte ingresado. Unidad programada para recolección."
Alta (7-10): mensaje="ALERTA: Peligro. Mantenga distancia. Cuadrilla despachada."`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          inlineData: {
            mimeType: file.type,
            data: base64Image
          }
        },
        {
          text: prompt
        }
      ],
      config: {
        responseMimeType: "application/json"
      }
    });

    let aiResult = { 
      tipo_basura: "Residuos no especificados", 
      urgencia_base: 5,
      mensaje_ciudadano: "Reporte ingresado al Sistema Integral de Limpieza."
    };

    try {
      const responseText = response.text || '';
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      if (parsed.tipo_basura) aiResult.tipo_basura = parsed.tipo_basura;
      if (parsed.urgencia_base) aiResult.urgencia_base = parsed.urgencia_base;
      if (parsed.mensaje_ciudadano) aiResult.mensaje_ciudadano = parsed.mensaje_ciudadano;
    } catch (parseError) {
      console.error("Error parseando JSON de Gemini, usando fallback:", parseError);
    }

    // 3. Registrar el reporte en Supabase
    const nuevoReporte: Reporte = {
      codigo_seguimiento: codigoSeguimiento,
      latitud,
      longitud,
      tipo_basura: aiResult.tipo_basura,
      urgencia_base: aiResult.urgencia_base,
      urgencia_dinamica: aiResult.urgencia_base, // Dinámica inicia igual a base
      mensaje_ciudadano: aiResult.mensaje_ciudadano,
      tracking_step: 0, // Inicia en fase 0 (Reportado)
      imagen_url: publicUrl
    };

    const { data: dbData, error: dbError } = await supabaseAdmin!
      .from('reportes')
      .insert([nuevoReporte])
      .select()
      .single();

    if (dbError) {
      console.error("Error al registrar en DB de Supabase:", dbError);
      return NextResponse.json({ 
        success: false, 
        error: `Error al registrar el reporte en la base de datos: ${dbError.message || JSON.stringify(dbError)}` 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      isDemo: false,
      reporte: dbData
    });

  } catch (error: any) {
    console.error("Error interno en api/classify:", error);
    return NextResponse.json({ success: false, error: error.message || "Error interno del servidor." }, { status: 500 });
  }
}
