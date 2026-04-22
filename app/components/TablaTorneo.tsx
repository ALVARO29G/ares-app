'use client'

interface Equipo {
  id: string;
  nombre: string;
  pj: number;
  pg: number;
  pe: number;
  pp: number;
  gf: number;
  gc: number;
  puntos: number;
}

export default function TablaTorneo({ equipos }: { equipos: Equipo[] }) {
  const equiposOrdenados = [...equipos].sort((a, b) => {
    if (b.puntos !== a.puntos) return b.puntos - a.puntos;
    return (b.gf - b.gc) - (a.gf - a.gc);
  });

  return (
    <div className="w-full bg-black/20 rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl mt-4">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-black/40 text-[#10b981] text-[10px] font-black uppercase tracking-[0.2em]">
              <th className="px-6 py-4">Pos</th>
              <th className="px-6 py-4">Equipo</th>
              <th className="px-4 py-4 text-center">PJ</th>
              <th className="px-4 py-4 text-center">G/E/P</th>
              <th className="px-4 py-4 text-center">DG</th>
              <th className="px-6 py-4 text-right">PTS</th>
            </tr>
          </thead>
          <tbody className="text-white font-bold uppercase text-xs">
            {equiposOrdenados.map((eq, i) => (
              <tr key={eq.id} className={`border-b border-white/5 transition-colors hover:bg-[#10b981]/5 ${i === 0 ? 'bg-[#10b981]/10' : ''}`}>
                <td className="px-6 py-5 italic text-gray-500">#{i + 1}</td>
                <td className="px-6 py-5">
                  <span className="text-sm tracking-tight">{eq.nombre}</span>
                  {i === 0 && <span className="ml-2 text-[8px] bg-yellow-500 text-black px-1.5 py-0.5 rounded-full animate-pulse">Líder</span>}
                </td>
                <td className="px-4 py-5 text-center text-gray-400 font-mono">{eq.pj}</td>
                <td className="px-4 py-5 text-center text-gray-500 font-mono text-[10px]">{eq.pg}/{eq.pe}/{eq.pp}</td>
                <td className="px-4 py-5 text-center font-mono">{eq.gf - eq.gc > 0 ? `+${eq.gf - eq.gc}` : eq.gf - eq.gc}</td>
                <td className="px-6 py-5 text-right"><span className="text-[#10b981] text-lg font-black">{eq.puntos}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}