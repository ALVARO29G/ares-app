'use client' // Importante: ahora el usuario interactúa con la página
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import dynamic from 'next/dynamic';

const Map = dynamic(() => import('./components/Map'), { ssr: false });

export default function Home() {
  const [sedes, setSedes] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState('');

  // 1. Traer datos de Supabase al cargar
  useEffect(() => {
    async function cargarSedes() {
      const { data } = await supabase.from('sedes').select('*');
      if (data) setSedes(data);
    }
    cargarSedes();
  }, []);

  // 2. Lógica del filtro: comparamos lo que escribes con el nombre de la sede
  const sedesFiltradas = sedes.filter(sede => 
    sede.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    sede.ubicacion_texto.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <main className="flex min-h-screen flex-col items-center bg-green-900 text-white p-6">
      <h1 className="text-7xl font-black italic mb-2 tracking-tighter">ARES</h1>
      
      {/* BARRA DE BÚSQUEDA */}
      <div className="w-full max-w-4xl mb-8">
        <input 
          type="text"
          placeholder="Buscar torneo o zona (ej: Delta, Norte...)"
          className="w-full p-5 rounded-2xl text-black font-bold shadow-2xl outline-none focus:ring-4 focus:ring-green-400 transition-all"
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* MAPA (se actualiza solo con los pines filtrados) */}
      <div className="w-full max-w-4xl z-0">
        <Map sedes={sedesFiltradas} />
      </div>

      {/* LISTA DE TARJETAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mt-6">
        {sedesFiltradas.map((sede) => (
          <div key={sede.id} className="bg-white text-black p-6 rounded-3xl shadow-xl hover:scale-105 transition-all border-l-8 border-green-500">
            <h2 className="text-2xl font-bold uppercase">{sede.nombre}</h2>
            <p className="text-gray-500 mb-4 italic text-sm">📍 {sede.ubicacion_texto}</p>
            <a href={`https://wa.me/${sede.contacto_whatsapp}`} className="block text-center bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700">
              RESERVAR / INFO
            </a>
          </div>
        ))}
      </div>
      
      {sedesFiltradas.length === 0 && (
        <p className="mt-10 opacity-50 italic">No se encontraron sedes con ese nombre...</p>
      )}
    </main>
  );
}