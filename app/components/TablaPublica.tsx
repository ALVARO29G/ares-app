// components/TablaPublica.tsx
'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function TablaPublica({ torneoId }: { torneoId: string }) {
  const [equipos, setEquipos] = useState<any[]>([])

  useEffect(() => {
    const fetchDatos = async () => {
      const { data } = await supabase
        .from('equipos')
        .select('*')
        .eq('torneo_id', torneoId)
        .order('puntos', { ascending: false })
      setEquipos(data || [])
    }
    fetchDatos()
  }, [torneoId])

  return (
    <table className="w-full text-left">
      <thead>
        <tr className="text-[#10b981] text-[10px] font-black uppercase tracking-widest border-b border-white/10">
          <th className="py-4">Pos</th>
          <th className="py-4">Equipo</th>
          <th className="py-4 text-right">Pts</th>
        </tr>
      </thead>
      <tbody>
        {equipos.map((eq, i) => (
          <tr key={eq.id} className="border-b border-white/5">
            <td className="py-4 font-bold italic">{i + 1}</td>
            <td className="py-4 font-black uppercase">{eq.nombre}</td>
            <td className="py-4 text-right font-black text-xl text-[#10b981]">{eq.puntos}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}