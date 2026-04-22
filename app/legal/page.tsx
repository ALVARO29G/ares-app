import React from 'react'

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-[#051a14] text-white font-sans p-6 md:p-20">
      <div className="max-w-4xl mx-auto">
        <a href="/" className="text-[#10b981] font-black text-[10px] uppercase tracking-[0.4em] mb-20 inline-block border border-[#10b981]/30 px-6 py-2 rounded-full hover:bg-[#10b981] hover:text-black transition-all">
          ← VOLVER AL SISTEMA
        </a>

        <header className="mb-20">
          <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-none mb-4">
            Protocolo Legal <span className="text-[#10b981]">ARES</span>
          </h1>
          <p className="text-white/40 font-mono text-xs uppercase tracking-widest">Versión 1.0.26 // Última actualización: Abril 2026</p>
        </header>

        <section className="space-y-16">
          {/* POLÍTICA DE PRIVACIDAD */}
          <div className="bg-white/5 border-l-2 border-[#10b981] p-10 backdrop-blur-sm">
            <h2 className="text-[#10b981] font-black uppercase tracking-[0.3em] mb-6 text-sm">01. Política de Privacidad</h2>
            <div className="text-white/70 text-sm leading-relaxed space-y-4 font-light">
              <p>
                En <strong>ARES FUTBOL LEÓN</strong>, la privacidad de los datos es tratada con rigor técnico. Este sistema utiliza <strong>Supabase</strong> para el almacenamiento de datos e indexación de sedes.
              </p>
              <p>
                <strong>Datos Recolectados:</strong> El radar registra métricas de interacción (clicks) de forma anónima para generar el ranking de "Hits". No almacenamos nombres, tarjetas bancarias o datos personales sensibles dentro de nuestro núcleo.
              </p>
              <p>
                <strong>Enlaces de Terceros:</strong> Al utilizar el botón de "WhatsApp", usted es redirigido a una plataforma externa. ARES no se hace responsable del manejo de datos dentro de la infraestructura de Meta/WhatsApp.
              </p>
              <p>
                <strong>Eliminación de Datos:</strong> Los socios pueden eliminar en cualquier momento los equipos, torneos y goleadores desde su panel de control. Si un jugador desea ser removido de una tabla pública, deberá contactar directamente al administrador de la sede. Para la eliminación total de una sede del radar, el socio puede solicitarlo a través del contacto oficial.
              </p>
            </div>
          </div>

          {/* TÉRMINOS Y CONDICIONES */}
          <div className="bg-white/5 border-l-2 border-white/20 p-10 backdrop-blur-sm">
            <h2 className="text-white font-black uppercase tracking-[0.3em] mb-6 text-sm">02. Términos de Servicio</h2>
            <div className="text-white/70 text-sm leading-relaxed space-y-4 font-light">
              <p>
                <strong>Naturaleza del Servicio:</strong> ARES es una plataforma de indexación y enlace. Facilitamos la conexión entre deportistas y administradores de sedes en León, Gto.
              </p>
              <p>
                <strong>Contenido de Socios:</strong> Los administradores de sedes ("Socios ARES") son los únicos responsables del contenido que publican, incluyendo nombres de torneos, equipos, jugadores, descripciones e imágenes. ARES se reserva el derecho de eliminar cualquier contenido que considere ofensivo, falso o que infrinja derechos de terceros, sin previo aviso.
              </p>
              <p>
                <strong>Datos de Jugadores:</strong> Los socios son responsables de obtener el consentimiento necesario para publicar los nombres de los jugadores en las tablas de goleo, especialmente en el caso de menores de edad. ARES actúa únicamente como plataforma de visualización.
              </p>
              <p>
                <strong>Deslinde de Responsabilidad:</strong> ARES no es propietario, operador, ni responsable de las instalaciones físicas. Cualquier incidente, lesión, cobro indebido o disputa ocurrida en la sede es responsabilidad exclusiva del administrador de dicha cancha y del usuario.
              </p>
              <p>
                <strong>Precisión de Datos:</strong> Aunque el radar busca la máxima precisión, los horarios, precios y disponibilidad mostrados son responsabilidad de cada sede. Recomendamos confirmar vía WhatsApp antes de asistir.
              </p>
              <p>
                <strong>Propiedad Intelectual:</strong> El diseño del radar, el código fuente y la identidad visual de ARES están protegidos. Queda prohibida la extracción de datos automatizada (scraping) de nuestras sedes verificadas. Las tablas de posiciones y goleo generadas por el sistema son de propiedad del socio que administra el torneo.
              </p>
              <p>
                <strong>Disponibilidad del Radar:</strong> ARES no garantiza la disponibilidad continua e ininterrumpida del servicio. No nos hacemos responsables por pérdidas de datos o interrupciones causadas por fallos en servidores de terceros (Supabase, Vercel) o mantenimientos programados.
              </p>
            </div>
          </div>

          <div className="py-10 border-t border-white/5 opacity-30 text-center">
            <p className="text-[9px] font-black uppercase tracking-[0.5em]">ARES DIGITAL SYSTEM © 2026 // LEÓN GTO MX</p>
          </div>
        </section>
      </div>
    </div>
  )
}