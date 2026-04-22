'use client'
import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { supabase } from '../lib/supabase'

const iconBall = new L.Icon({
  iconUrl: '/ball.png',
  iconSize: [44, 44],
  iconAnchor: [22, 44],
  popupAnchor: [0, -44]
})

// SOLUCIÓN AL ERROR: Desestructuramos lat y lng para que la dependencia sea estable
function CameraHelper({ center }: { center: {lat: number, lng: number} }) {
  const map = useMap()
  const { lat, lng } = center // <--- Extraemos los valores numéricos

  useEffect(() => {
    map.flyTo([lat, lng], 16, { animate: true, duration: 2 })
  }, [lat, lng, map]) // <--- Dependencias estables (números, no el objeto entero)
  
  return null
}

export default function Map({ sedes, center, isPicker, onLocationSelect, nombreSede, domicilioSede, onSedeInteraction }: any) {
  
  const registrarInteraccion = async (id: number, clicksActuales: number) => {
    const { error } = await supabase
      .from('sedes')
      .update({ clicks: (clicksActuales || 0) + 1 })
      .eq('id', id)
    
    if (!error && onSedeInteraction) {
      onSedeInteraction(); 
    }
  }

  return (
    <MapContainer 
      center={[center.lat, center.lng]} 
      zoom={14} 
      zoomControl={false} 
      style={{ height: '100%', width: '100%', filter: 'grayscale(0.1) contrast(1.05)' }}
    >
      <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
      <CameraHelper center={center} />
      
      {isPicker ? (
        <LocationPicker onLocationSelect={onLocationSelect} pos={center} nombre={nombreSede} domicilio={domicilioSede} />
      ) : (
        sedes?.map((s: any) => (
          <Marker 
            key={s.id} 
            position={[s.latitud, s.longitud]} 
            icon={iconBall}
            eventHandlers={{
              click: () => registrarInteraccion(s.id, s.clicks)
            }}
          >
            <Popup>
              <div className="p-3 text-center font-sans min-w-[160px]">
                <div className="bg-[#10b981] text-white text-[8px] font-black px-3 py-1 rounded-full inline-block uppercase tracking-[0.2em] mb-2 shadow-sm">
                  ARES Verified 2026
                </div>
                <h3 className="font-black text-gray-900 uppercase italic text-2xl tracking-tighter leading-none mt-2">
                  {s.nombre}
                </h3>
                <p className="text-gray-400 text-[9px] font-bold mt-2 uppercase border-t pt-2 border-gray-100">
                  {s.ubicacion_texto}
                </p>
                <a 
                  href={`/sede/${s.slug}`} 
                  className="block text-[10px] text-blue-500 mt-2 underline"
                  >
                    Ver detalles
                </a>
                <a 
                  href={`https://wa.me/52${s.contacto_whatsapp}`} 
                  target="_blank" 
                  className="bg-black text-white px-6 py-4 rounded-xl font-black text-[10px] uppercase block mt-4 shadow-xl active:scale-95 transition-all"
                >
                  Contactar por WhatsApp
                </a>
              </div>
            </Popup>
          </Marker>
        ))
      )}
    </MapContainer>
  )
}

function LocationPicker({ onLocationSelect, pos, nombre, domicilio }: any) {
  useMapEvents({ click(e) { onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng }) } })
  return (
    <Marker position={[pos.lat, pos.lng]} icon={iconBall}>
      <Popup autoPan={false}>
        <div className="p-3 text-center font-sans">
          <span className="text-orange-500 font-black text-[9px] uppercase tracking-widest">Selección de Sede</span>
          <h3 className="font-black text-gray-900 uppercase italic text-xl mt-2 leading-none">{nombre || "NUEVA UNIDAD"}</h3>
          <p className="text-gray-400 text-[9px] font-bold mt-2 uppercase">{domicilio || "GEO-POSICIONANDO..."}</p>
        </div>
      </Popup>
    </Marker>
  )
}