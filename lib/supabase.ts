import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const isSupabaseConfigured =
  supabaseUrl.trim() !== '' &&
  supabaseAnonKey.trim() !== '' &&
  supabaseUrl !== 'YOUR_SUPABASE_URL'; // Evitar placeholders

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Cliente administrativo para operaciones del servidor (como subir fotos o bypass RLS si es necesario)
export const supabaseAdmin = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

export interface Reporte {
  id?: number;
  codigo_seguimiento: string;
  latitud: number;
  longitud: number;
  tipo_basura: string;
  urgencia_base: number;
  urgencia_dinamica: number;
  mensaje_ciudadano: string;
  tracking_step: number; // 0: Reportado, 1: En Proceso, 2: En Limpieza, 3: Resuelto
  imagen_url?: string;
  fecha_creacion?: string;
  clases_softmax?: { clase: string, prob: number }[] | null;
}

// Datos semilla de ejemplo para el modo demo
export const MOCK_REPORTES_INICIALES: Reporte[] = [
  {
    id: 1,
    codigo_seguimiento: "GAMLP-94821",
    latitud: -16.5008,
    longitud: -68.1215,
    tipo_basura: "Plásticos y botellas de refresco acumulados en la acera",
    urgencia_base: 5,
    urgencia_dinamica: 5.0,
    mensaje_ciudadano: "Hay una gran cantidad de botellas plásticas obstruyendo el paso peatonal en la Av. Arce, cerca del Monoblock.",
    tracking_step: 0,
    imagen_url: "https://images.unsplash.com/photo-1618477388954-7852f32655ec?auto=format&fit=crop&w=600&q=80",
    fecha_creacion: new Date(Date.now() - 4 * 3600000).toISOString(), // hace 4 horas
    clases_softmax: null
  },
  {
    id: 2,
    codigo_seguimiento: "GAMLP-38291",
    latitud: -16.4955,
    longitud: -68.1388,
    tipo_basura: "Escombros de construcción y madera",
    urgencia_base: 8,
    urgencia_dinamica: 9.0,
    mensaje_ciudadano: "Dejaron escombros de una remodelación en la calle Murillo. Es peligroso para los autos de noche.",
    tracking_step: 1,
    imagen_url: "https://images.unsplash.com/photo-1595278069441-2cf29f8a22d4?auto=format&fit=crop&w=600&q=80",
    fecha_creacion: new Date(Date.now() - 24 * 3600000).toISOString(), // hace 1 día
    clases_softmax: null
  },
  {
    id: 3,
    codigo_seguimiento: "GAMLP-10492",
    latitud: -16.5122,
    longitud: -68.1288,
    tipo_basura: "Desechos orgánicos y restos de comida",
    urgencia_base: 7,
    urgencia_dinamica: 7.0,
    mensaje_ciudadano: "Vecinos tiraron bolsas de basura orgánica y los perros las rompieron. Huele muy mal.",
    tracking_step: 2,
    imagen_url: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80",
    fecha_creacion: new Date(Date.now() - 48 * 3600000).toISOString(), // hace 2 días
    clases_softmax: null
  },
  {
    id: 4,
    codigo_seguimiento: "GAMLP-85731",
    latitud: -16.5245,
    longitud: -68.1092,
    tipo_basura: "Llantas usadas y chatarra metálica",
    urgencia_base: 6,
    urgencia_dinamica: 6.0,
    mensaje_ciudadano: "Hay 5 llantas viejas abandonadas en la esquina de la plaza de Calacoto.",
    tracking_step: 3,
    imagen_url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80",
    fecha_creacion: new Date(Date.now() - 72 * 3600000).toISOString(), // hace 3 días
    clases_softmax: []
  }
];

// Métodos auxiliares para simular base de datos usando localStorage en cliente
export function getLocalReports(): Reporte[] {
  if (typeof window === 'undefined') return MOCK_REPORTES_INICIALES;
  const stored = localStorage.getItem('basuravision_reports');
  if (!stored) {
    localStorage.setItem('basuravision_reports', JSON.stringify(MOCK_REPORTES_INICIALES));
    return MOCK_REPORTES_INICIALES;
  }
  return JSON.parse(stored);
}

export function saveLocalReport(reporte: Reporte): Reporte {
  if (typeof window === 'undefined') return reporte;
  const reports = getLocalReports();
  const newReport = {
    ...reporte,
    id: reports.length > 0 ? Math.max(...reports.map(r => r.id || 0)) + 1 : 1,
    fecha_creacion: reporte.fecha_creacion || new Date().toISOString(),
    clases_softmax: reporte.clases_softmax || null
  };
  reports.unshift(newReport); // Añadir al inicio
  localStorage.setItem('basuravision_reports', JSON.stringify(reports));
  return newReport;
}
export function updateLocalReport(codigo: string, updates: Partial<Reporte>): Reporte | null {
  if (typeof window === 'undefined') return null;
  const reports = getLocalReports();
  const idx = reports.findIndex(r => r.codigo_seguimiento === codigo);
  if (idx === -1) return null;
  
  if (updates.tracking_step !== undefined) reports[idx].tracking_step = updates.tracking_step;
  if (updates.urgencia_dinamica !== undefined) reports[idx].urgencia_dinamica = updates.urgencia_dinamica;
  if (updates.clases_softmax !== undefined) reports[idx].clases_softmax = updates.clases_softmax;
  
  if (updates.tracking_step === 3) {
    reports[idx].imagen_url = ""; // Limpiar imagen al resolver
    reports[idx].clases_softmax = []; // Limpiar Softmax
  }
  
  localStorage.setItem('basuravision_reports', JSON.stringify(reports));
  return reports[idx];
}
