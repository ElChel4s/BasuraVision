import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured, supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!isSupabaseConfigured) {
      // Si no está configurado Supabase, el cliente usará su fallback local
      return NextResponse.json({ success: true, isDemo: true, reportes: [] });
    }

    if (code) {
      const { data, error } = await supabaseAdmin!
        .from('reportes')
        .select('*')
        .eq('codigo_seguimiento', code)
        .maybeSingle();

      if (error) throw error;
      return NextResponse.json({ success: true, reporte: data });
    } else {
      const { data, error } = await supabaseAdmin!
        .from('reportes')
        .select('*')
        .order('fecha_creacion', { ascending: false });

      if (error) throw error;
      return NextResponse.json({ success: true, reportes: data });
    }
  } catch (error: any) {
    console.error("Error en GET /api/reports:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { codigo_seguimiento, tracking_step, urgencia_dinamica } = body;

    if (!codigo_seguimiento) {
      return NextResponse.json({ success: false, error: "Falta el código de seguimiento" }, { status: 400 });
    }

    if (!isSupabaseConfigured) {
      return NextResponse.json({ success: true, isDemo: true });
    }

    const nextStep = parseInt(tracking_step, 10);
    const isResolved = nextStep === 3;

    // Si el reporte se marca como resuelto, eliminar la foto de Storage
    if (isResolved) {
      const { data: currentReport } = await supabaseAdmin!
        .from('reportes')
        .select('imagen_url')
        .eq('codigo_seguimiento', codigo_seguimiento)
        .maybeSingle();

      if (currentReport?.imagen_url) {
        const storagePath = getStoragePathFromUrl(currentReport.imagen_url, 'trash-images');
        if (storagePath) {
          const { error: deleteError } = await supabaseAdmin!.storage
            .from('trash-images')
            .remove([storagePath]);
          
          if (deleteError) {
            console.error("Error al borrar imagen de Storage:", deleteError);
          }
        }
      }
    }

    const updateFields: any = {
      tracking_step: nextStep,
    };

    if (urgencia_dinamica !== undefined && urgencia_dinamica !== null) {
      const parsedVal = parseFloat(urgencia_dinamica);
      if (!isNaN(parsedVal)) {
        updateFields.urgencia_dinamica = parsedVal;
      }
    }

    if (isResolved) {
      updateFields.imagen_url = null; // Remover link de base de datos
    }

    const { data, error } = await supabaseAdmin!
      .from('reportes')
      .update(updateFields)
      .eq('codigo_seguimiento', codigo_seguimiento)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, reporte: data });
  } catch (error: any) {
    console.error("Error en PATCH /api/reports:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Helper para extraer la ruta de almacenamiento de la URL pública de Supabase
function getStoragePathFromUrl(url: string, bucketName: string = 'trash-images'): string | null {
  if (!url) return null;
  const marker = `/public/${bucketName}/`;
  const index = url.indexOf(marker);
  if (index === -1) return null;
  return decodeURIComponent(url.substring(index + marker.length));
}
