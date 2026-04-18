'use client'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// --- ESTE ES EL CAMBIO CLAVE ---
// Definimos el nuevo icono personalizado (balón de fútbol)
const footballIcon = new L.Icon({
  iconUrl: '/ball.png', // <--- Ruta a tu imagen en la carpeta public
  iconRetinaUrl: '/ball.png',
  iconSize: [40, 40],     // <--- Tamaño del balón [ancho, alto] en pixeles
  iconAnchor: [20, 40],   // <--- Punto de anclaje (mitad inferior para que el pin 'toque' el mapa)
  popupAnchor: [0, -40],  // <--- Dónde aparece el globo de información respecto al balón
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png', // Sombra opcional
  shadowSize: [41, 41],
  shadowAnchor: [12, 41]
});
// ------------------------------

// Definimos la estructura de datos (para que TypeScript no marque error)
interface Sede {
  id: number;
  nombre: string;
  ubicacion_texto: string;
  latitud: number;
  longitud: number;
}

export default function Map({ sedes }: { sedes: Sede[] }) {
  // Coordenadas centrales por defecto (ej: Ciudad de México)
  const centerPosition: [number, number] = [19.4326, -99.1332];

  return (
    <div className="h-[450px] w-full rounded-3xl overflow-hidden shadow-2xl mb-10 border-4 border-white">
      <MapContainer 
        center={centerPosition} 
        zoom={12} 
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        scrollWheelZoom={false} // Evita zoom accidental al hacer scroll en la página
      >
        <TileLayer 
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
        />
        
        {sedes.map((sede) => (
          <Marker 
            key={sede.id} 
            position={[sede.latitud, sede.longitud]} 
            icon={footballIcon} // <--- ¡AQUÍ USAMOS EL NUEVO ICONO!
          >
            <Popup>
              <div className="text-black p-1 text-center">
                <p className="font-extrabold text-lg text-green-800 uppercase tracking-tighter">{sede.nombre}</p>
                <p className="text-xs text-gray-600 mb-2 italic">📍 {sede.ubicacion_texto}</p>
                <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-1 rounded-full">Sede Activa</span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}