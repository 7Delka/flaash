import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import NavBar from '../components/NavBar'
import ContactFooter from '../components/ContactFooter'
import { useLanguage } from '../contexts/LanguageContext'
import { useCart } from '../contexts/CartContext'
import { formatMXN } from '../lib/money'

export interface Product {
  id: string
  qty: number
  name: string
  nameEn?: string
  priceMXN?: number
  photos?: string[]
  zoom?: number
  features?: string[]
  featuresEn?: string[]
  category: string
  searchTags?: string[]
}

interface MayoristaItem {
  id: string
  name: string
  nameEn: string
  photo?: string
  searchTags: string[]
}

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

export const MAYORISTA_ITEMS: MayoristaItem[] = [
  { id: 'vinos', name: 'Vinos Premium', nameEn: 'Premium Wines', photo: '/bsm/wine-1.jpg', searchTags: ['vino', 'wine', 'malbec', 'torrontes', 'alcohol', 'bebida', 'copa', 'botella', 'tinto', 'blanco', 'espumante'] },
  { id: 'gin', name: 'Gin Artesanal', nameEn: 'Craft Gin', photo: '/bsm/gin dorado.jpeg', searchTags: ['gin', 'ginebra', 'artesanal', 'botanical', 'botanico', 'licor', 'bebida', 'alcohol'] },
  { id: 'tequila', name: 'Tequila Reposado', nameEn: 'Tequila Reposado', searchTags: ['tequila', 'mezcal', 'agave', 'reposado', 'alcohol', 'bebida', 'licor'] },
  { id: 'alfajores', name: 'Alfajores', nameEn: 'Alfajores', photo: '/bsm/alfajor.jpg', searchTags: ['alfajor', 'alfajores', 'dulce', 'chocolate', 'golosina', 'snack', 'cookie', 'galleta', 'dulces', 'confiteria'] },
  { id: 'fertilizantes', name: 'Fertilizantes', nameEn: 'Fertilizers', photo: '/bsm/fertilizer-1.jpeg', searchTags: ['fertilizante', 'fertilizer', 'abono', 'agro', 'agricultura', 'planta', 'cultivo', 'jardin', 'huerto', 'tierra'] },
]

export const CATEGORIES: { id: string; es: string; en: string }[] = [
  { id: 'security', es: 'Seguridad y Cámaras', en: 'Security & Cameras' },
  { id: 'lighting', es: 'Iluminación', en: 'Lighting' },
  { id: 'automotive', es: 'Automotriz y Herramientas', en: 'Automotive & Tools' },
  { id: 'home', es: 'Hogar y Cocina', en: 'Home & Kitchen' },
  { id: 'clocks', es: 'Relojes y Clima', en: 'Clocks & Weather' },
  { id: 'health', es: 'Salud y Control de Plagas', en: 'Health & Pest Control' },
  { id: 'electronics', es: 'Electrónica y Conectividad', en: 'Electronics & Connectivity' },
  { id: 'travel', es: 'Viaje y Moda', en: 'Travel & Fashion' },
]

export const PLACEHOLDER_IMG = 'data:image/svg+xml,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#C9A227" stroke-width="1.4">
    <path d="M21 8L12 3 3 8l9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/>
  </svg>`,
)

const PH = (name: string) => `/bsm/Products/${name}`

const CHARGER_PHOTOS = [
  PH('WhatsApp Image 2026-08-25 at 13.45.23.jpeg'),
  PH('WhatsApp Image 2026-08-25 at 13.45.23 (1).jpeg'),
  PH('WhatsApp Image 2026-08-25 at 13.45.24.jpeg'),
  PH('WhatsApp Image 2026-08-25 at 13.45.24 (1).jpeg'),
  PH('WhatsApp Image 2026-08-25 at 13.45.24 (2).jpeg'),
  PH('WhatsApp Image 2026-08-25 at 13.45.24 (3).jpeg'),
  PH('WhatsApp Image 2026-08-25 at 13.45.24 (4).jpeg'),
]

const FLASHLIGHT_PHOTOS = [
  PH('WhatsApp Image 2026-08-25 at 14.29.05.jpeg'),
  PH('WhatsApp Image 2026-08-25 at 14.29.05 (1).jpeg'),
  PH('WhatsApp Image 2026-08-25 at 14.29.06.jpeg'),
  PH('WhatsApp Image 2026-08-25 at 14.29.06 (1).jpeg'),
  PH('WhatsApp Image 2026-08-25 at 14.29.06 (2).jpeg'),
  PH('WhatsApp Image 2026-08-25 at 14.29.06 (3).jpeg'),
  PH('WhatsApp Image 2026-08-25 at 14.29.06 (4).jpeg'),
]

const LED_CLOCK_PHOTOS = [
  PH('WhatsApp Image 2026-08-25 at 14.54.15.jpeg'),
  PH('WhatsApp Image 2026-08-25 at 14.54.15 (1).jpeg'),
]

const IP_CAMERA_PHOTOS = [
  PH('WhatsApp Image 2026-08-25 at 15.09.04.jpeg'),
  PH('WhatsApp Image 2026-08-25 at 15.09.04 (1).jpeg'),
  PH('WhatsApp Image 2026-08-25 at 15.09.04 (2).jpeg'),
  PH('WhatsApp Image 2026-08-25 at 15.09.05.jpeg'),
  PH('WhatsApp Image 2026-08-25 at 15.09.05 (1).jpeg'),
]

const BIG_CAMERA_360_PHOTOS = [
  PH('WhatsApp Image 2026-08-25 at 15.16.13.jpeg'),
  PH('WhatsApp Image 2026-08-25 at 15.16.13 (1).jpeg'),
  PH('WhatsApp Image 2026-08-25 at 15.16.13 (2).jpeg'),
  PH('WhatsApp Image 2026-08-25 at 15.16.13 (3).jpeg'),
  PH('WhatsApp Image 2026-08-25 at 15.16.14.jpeg'),
  PH('WhatsApp Image 2026-08-25 at 15.16.14 (1).jpeg'),
  PH('WhatsApp Image 2026-08-25 at 15.16.14 (2).jpeg'),
]

const BEACON_PHOTOS = [
  PH('WhatsApp Image 2026-08-25 at 19.33.33.jpeg'),
  PH('WhatsApp Image 2026-08-25 at 19.33.33 (1).jpeg'),
]

const NECK_PILLOW_PHOTOS = [
  PH('WhatsApp Image 2026-08-25 at 19.42.42.jpeg'),
  PH('WhatsApp Image 2026-08-25 at 19.42.42 (1).jpeg'),
  PH('WhatsApp Image 2026-08-25 at 19.42.42 (2).jpeg'),
  PH('WhatsApp Image 2026-08-25 at 19.42.42 (3).jpeg'),
  PH('WhatsApp Image 2026-08-25 at 19.42.42 (4).jpeg'),
  PH('WhatsApp Image 2026-08-25 at 19.42.43.jpeg'),
  PH('WhatsApp Image 2026-08-25 at 19.42.43 (1).jpeg'),
]

const RATCHET_WRENCH_PHOTOS = [
  PH('WhatsApp Image 2026-08-27 at 16.37.35.jpeg'),
  PH('WhatsApp Image 2026-08-27 at 16.37.35 (1).jpeg'),
  PH('WhatsApp Image 2026-08-27 at 16.37.36.jpeg'),
  PH('WhatsApp Image 2026-08-27 at 16.37.36 (1).jpeg'),
  PH('WhatsApp Image 2026-08-27 at 16.37.36 (2).jpeg'),
  PH('WhatsApp Image 2026-08-27 at 16.37.36 (3).jpeg'),
  PH('WhatsApp Image 2026-08-27 at 16.37.36 (4).jpeg'),
  PH('WhatsApp Image 2026-08-27 at 16.37.37.jpeg'),
]

const WIRELESS_CAMERA_PHOTOS = [
  PH('WhatsApp Image 2026-08-28 at 10.09.35.jpeg'),
  PH('WhatsApp Image 2026-08-28 at 10.09.35 (1).jpeg'),
  PH('WhatsApp Image 2026-08-28 at 10.09.35 (2).jpeg'),
  PH('WhatsApp Image 2026-08-28 at 10.09.36.jpeg'),
  PH('WhatsApp Image 2026-08-28 at 10.09.36 (1).jpeg'),
  PH('WhatsApp Image 2026-08-28 at 10.09.36 (2).jpeg'),
]

const SMART_TRASH_BIN_PHOTOS = [
  PH('WhatsApp Image 2026-08-28 at 10.22.13.jpeg'),
  PH('WhatsApp Image 2026-08-28 at 10.22.13 (1).jpeg'),
  PH('WhatsApp Image 2026-08-28 at 10.22.14.jpeg'),
  PH('WhatsApp Image 2026-08-28 at 10.22.14 (1).jpeg'),
  PH('WhatsApp Image 2026-08-28 at 10.22.14 (2).jpeg'),
  PH('WhatsApp Image 2026-08-28 at 10.22.14 (3).jpeg'),
  PH('WhatsApp Image 2026-08-28 at 10.22.14 (4).jpeg'),
  PH('WhatsApp Image 2026-08-28 at 10.22.15.jpeg'),
]

const MINI_FRIDGE_PHOTOS = [
  PH('WhatsApp Image 2026-08-28 at 16.03.51.jpeg'),
  PH('WhatsApp Image 2026-08-28 at 16.03.51 (1).jpeg'),
  PH('WhatsApp Image 2026-08-28 at 16.03.51 (2).jpeg'),
  PH('WhatsApp Image 2026-08-28 at 16.03.51 (3).jpeg'),
  PH('WhatsApp Image 2026-08-28 at 16.03.52.jpeg'),
  PH('WhatsApp Image 2026-08-28 at 16.03.52 (1).jpeg'),
  PH('WhatsApp Image 2026-08-28 at 16.03.52 (2).jpeg'),
  PH('WhatsApp Image 2026-08-28 at 16.03.52 (3).jpeg'),
  PH('WhatsApp Image 2026-08-28 at 16.03.52 (4).jpeg'),
]

const WEATHER_STATION_PHOTOS = [
  PH('WhatsApp Image 2026-08-28 at 16.16.29.jpeg'),
  PH('WhatsApp Image 2026-08-28 at 16.16.30.jpeg'),
  PH('WhatsApp Image 2026-08-28 at 16.16.30 (1).jpeg'),
  PH('WhatsApp Image 2026-08-28 at 16.16.30 (2).jpeg'),
  PH('WhatsApp Image 2026-08-28 at 16.16.30 (3).jpeg'),
  PH('WhatsApp Image 2026-08-28 at 16.16.30 (4).jpeg'),
]

const FIRE_TV_STICK_PHOTOS = [
  PH('WhatsApp Image 2026-08-28 at 16.18.55.jpeg'),
  PH('WhatsApp Image 2026-08-28 at 16.18.55 (1).jpeg'),
]

const SNEAKERS_PHOTOS = [
  PH('WhatsApp Image 2026-08-28 at 16.23.19.jpeg'),
  PH('WhatsApp Image 2026-08-28 at 16.23.19 (1).jpeg'),
]

const BULLET_DOME_CAMERA_PHOTOS = [
  PH('WhatsApp Image 2026-08-28 at 20.45.29.jpeg'),
  PH('WhatsApp Image 2026-08-28 at 20.45.29 (1).jpeg'),
  PH('WhatsApp Image 2026-08-28 at 20.45.30.jpeg'),
  PH('WhatsApp Image 2026-08-28 at 20.45.30 (1).jpeg'),
  PH('WhatsApp Image 2026-08-28 at 20.45.30 (2).jpeg'),
  PH('WhatsApp Image 2026-08-28 at 20.45.30 (3).jpeg'),
  PH('WhatsApp Image 2026-08-28 at 20.45.30 (4).jpeg'),
  PH('WhatsApp Image 2026-08-28 at 20.45.31.jpeg'),
  PH('WhatsApp Image 2026-08-28 at 20.45.31 (1).jpeg'),
  PH('WhatsApp Image 2026-08-28 at 20.45.31 (2).jpeg'),
  PH('WhatsApp Image 2026-08-28 at 20.45.31 (3).jpeg'),
  PH('WhatsApp Image 2026-08-28 at 20.45.31 (4).jpeg'),
]

const MICRO_CAMERA_PHOTOS = [
  PH('WhatsApp Image 2026-08-28 at 20.49.56.jpeg'),
  PH('WhatsApp Image 2026-08-28 at 20.49.56 (1).jpeg'),
  PH('WhatsApp Image 2026-08-28 at 20.49.56 (2).jpeg'),
  PH('WhatsApp Image 2026-08-28 at 20.49.56 (3).jpeg'),
  PH('WhatsApp Image 2026-08-28 at 20.49.56 (4).jpeg'),
  PH('WhatsApp Image 2026-08-28 at 20.49.57.jpeg'),
  PH('WhatsApp Image 2026-08-28 at 20.49.57 (1).jpeg'),
]

const RECHARGEABLE_WORKLIGHT_PHOTOS = [
  PH('WhatsApp Image 2026-08-28 at 21.00.47.jpeg'),
  PH('WhatsApp Image 2026-08-28 at 21.00.47 (1).jpeg'),
  PH('WhatsApp Image 2026-08-28 at 21.00.47 (2).jpeg'),
  PH('WhatsApp Image 2026-08-28 at 21.00.48.jpeg'),
]

const VEHICLE_CHARGER_PHOTOS = [
  PH('WhatsApp Image 2026-08-28 at 21.08.54.jpeg'),
  PH('WhatsApp Image 2026-08-28 at 21.08.54 (1).jpeg'),
  PH('WhatsApp Image 2026-08-28 at 21.08.54 (2).jpeg'),
  PH('WhatsApp Image 2026-08-28 at 21.08.54 (3).jpeg'),
  PH('WhatsApp Image 2026-08-28 at 21.08.55.jpeg'),
  PH('WhatsApp Image 2026-08-28 at 21.08.55 (1).jpeg'),
  PH('WhatsApp Image 2026-08-28 at 21.08.55 (2).jpeg'),
  PH('WhatsApp Image 2026-08-28 at 21.08.55 (3).jpeg'),
]

const CAMPING_LANTERN_PHOTOS = [
  PH('WhatsApp Image 2026-08-28 at 21.14.37.jpeg'),
  PH('WhatsApp Image 2026-08-28 at 21.14.37 (1).jpeg'),
  PH('WhatsApp Image 2026-08-28 at 21.14.37 (2).jpeg'),
]

const ANTI_SNORING_PHOTOS = [
  PH('WhatsApp Image 2026-08-28 at 21.18.16.jpeg'),
  PH('WhatsApp Image 2026-08-28 at 21.18.16 (1).jpeg'),
  PH('WhatsApp Image 2026-08-28 at 21.18.16 (2).jpeg'),
  PH('WhatsApp Image 2026-08-28 at 21.18.16 (3).jpeg'),
  PH('WhatsApp Image 2026-08-28 at 21.18.16 (4).jpeg'),
  PH('WhatsApp Image 2026-08-28 at 21.18.17.jpeg'),
  PH('WhatsApp Image 2026-08-28 at 21.18.17 (1).jpeg'),
]

const PEST_REPELLER_PHOTOS = [
  PH('WhatsApp Image 2026-08-28 at 21.21.04.jpeg'),
  PH('WhatsApp Image 2026-08-28 at 21.22.47.jpeg'),
  PH('WhatsApp Image 2026-08-28 at 21.22.47 (1).jpeg'),
  PH('WhatsApp Image 2026-08-28 at 21.22.47 (2).jpeg'),
  PH('WhatsApp Image 2026-08-28 at 21.22.47 (3).jpeg'),
  PH('WhatsApp Image 2026-08-28 at 21.22.47 (4).jpeg'),
  PH('WhatsApp Image 2026-08-28 at 21.22.48.jpeg'),
]

const SOAP_DISPENSER_BLACK_PHOTOS = [
  PH('WhatsApp Image 2026-08-28 at 21.27.01.jpeg'),
  PH('WhatsApp Image 2026-08-28 at 21.27.01 (1).jpeg'),
  PH('WhatsApp Image 2026-08-28 at 21.27.01 (2).jpeg'),
  PH('WhatsApp Image 2026-08-28 at 21.27.02.jpeg'),
  PH('WhatsApp Image 2026-08-28 at 21.27.02 (1).jpeg'),
  PH('WhatsApp Image 2026-08-28 at 21.27.02 (2).jpeg'),
]

const MIRROR_LED_CLOCK_PHOTOS = [
  PH('WhatsApp Image 2026-08-28 at 21.52.19.jpeg'),
  PH('WhatsApp Image 2026-08-28 at 21.52.19 (1).jpeg'),
  PH('WhatsApp Image 2026-08-28 at 21.52.19 (2).jpeg'),
  PH('WhatsApp Image 2026-08-28 at 21.52.20.jpeg'),
  PH('WhatsApp Image 2026-08-28 at 21.52.20 (1).jpeg'),
  PH('WhatsApp Image 2026-08-28 at 21.52.20 (2).jpeg'),
]

const ELECTRIC_CLEANER_PHOTOS = [
  PH('WhatsApp Image 2026-08-28 at 21.57.17.jpeg'),
  PH('WhatsApp Image 2026-08-28 at 21.57.17 (1).jpeg'),
  PH('WhatsApp Image 2026-08-28 at 21.57.17 (2).jpeg'),
  PH('WhatsApp Image 2026-08-28 at 21.57.18.jpeg'),
  PH('WhatsApp Image 2026-08-28 at 21.57.18 (1).jpeg'),
  PH('WhatsApp Image 2026-08-28 at 21.57.18 (2).jpeg'),
]

const TOILET_PAPER_HOLDER_PHOTOS = [
  PH('WhatsApp Image 2026-08-28 at 22.19.26.jpeg'),
  PH('WhatsApp Image 2026-08-28 at 22.19.26 (1).jpeg'),
  PH('WhatsApp Image 2026-08-28 at 22.19.26 (2).jpeg'),
  PH('WhatsApp Image 2026-08-28 at 22.19.26 (3).jpeg'),
  PH('WhatsApp Image 2026-08-28 at 22.19.27.jpeg'),
  PH('WhatsApp Image 2026-08-28 at 22.19.27 (1).jpeg'),
  PH('WhatsApp Image 2026-08-28 at 22.19.27 (2).jpeg'),
  PH('WhatsApp Image 2026-08-28 at 22.19.27 (3).jpeg'),
  PH('WhatsApp Image 2026-08-28 at 22.19.27 (4).jpeg'),
]

const MODEM_4G_PHOTOS = [
  PH('WhatsApp Image 2026-08-28 at 22.29.07.jpeg'),
  PH('WhatsApp Image 2026-08-28 at 22.29.08.jpeg'),
  PH('WhatsApp Image 2026-08-28 at 22.29.08 (1).jpeg'),
]

const KEY_FINDER_PHOTOS = [
  PH('WhatsApp Image 2026-08-28 at 22.34.22.jpeg'),
  PH('WhatsApp Image 2026-08-28 at 22.34.22 (1).jpeg'),
  PH('WhatsApp Image 2026-08-28 at 22.34.22 (2).jpeg'),
  PH('WhatsApp Image 2026-08-28 at 22.34.22 (3).jpeg'),
  PH('WhatsApp Image 2026-08-28 at 22.34.22 (4).jpeg'),
]

const TRAVEL_ADAPTER_PHOTOS = [
  PH('WhatsApp Image 2026-08-28 at 22.37.41.jpeg'),
  PH('WhatsApp Image 2026-08-28 at 22.37.41 (1).jpeg'),
  PH('WhatsApp Image 2026-08-28 at 22.37.42.jpeg'),
  PH('WhatsApp Image 2026-08-28 at 22.37.42 (1).jpeg'),
  PH('WhatsApp Image 2026-08-28 at 22.37.42 (2).jpeg'),
  PH('WhatsApp Image 2026-08-28 at 22.37.42 (3).jpeg'),
]

const GEL_PAD_PHOTOS = [
  PH('WhatsApp Image 2026-08-28 at 22.39.26.jpeg'),
  PH('WhatsApp Image 2026-08-28 at 22.39.27.jpeg'),
  PH('WhatsApp Image 2026-08-28 at 22.39.27 (1).jpeg'),
  PH('WhatsApp Image 2026-08-28 at 22.39.27 (2).jpeg'),
]

const MOSQUITO_TRAP_PHOTOS = [
  PH('WhatsApp Image 2026-08-28 at 22.43.26.jpeg'),
  PH('WhatsApp Image 2026-08-28 at 22.43.26 (1).jpeg'),
  PH('WhatsApp Image 2026-08-28 at 22.43.26 (2).jpeg'),
  PH('WhatsApp Image 2026-08-28 at 22.43.26 (3).jpeg'),
]

const PINK_MOSQUITO_VORTEX_PHOTOS = [
  PH('WhatsApp Image 2026-08-28 at 22.48.46 (1).jpeg'),
  PH('WhatsApp Image 2026-08-28 at 22.48.46 (2).jpeg'),
  PH('WhatsApp Image 2026-08-28 at 22.48.47.jpeg'),
  PH('WhatsApp Image 2026-08-28 at 22.48.47 (1).jpeg'),
  PH('WhatsApp Image 2026-08-28 at 22.48.47 (2).jpeg'),
  PH('WhatsApp Image 2026-08-28 at 22.48.47 (3).jpeg'),
  PH('WhatsApp Image 2026-08-28 at 22.48.46.jpeg'),
]

const DRILL_BRUSHES_PHOTOS = [
  PH('WhatsApp Image 2026-08-28 at 22.50.38.jpeg'),
  PH('WhatsApp Image 2026-08-28 at 22.50.39.jpeg'),
  PH('WhatsApp Image 2026-08-28 at 22.50.39 (1).jpeg'),
  PH('WhatsApp Image 2026-08-28 at 22.50.39 (2).jpeg'),
  PH('WhatsApp Image 2026-08-28 at 22.50.39 (3).jpeg'),
  PH('WhatsApp Image 2026-08-28 at 22.50.39 (4).jpeg'),
]

export const PRODUCTS: Product[] = [
  { id: 'cargador-baterias',      qty: 1,  name: 'Cargador Amarillo de Baterías', photos: CHARGER_PHOTOS,
    features: ['Voltaje de salida: 12V CC — corriente de carga hasta 12A, modo de flotación de mantenimiento incluido', 'Pantalla LCD digital: muestra voltaje (V), corriente (A), capacidad acumulada (Ah) y potencia (W) en tiempo real', 'Modos de carga: precarga suave → carga rápida → absorción → flotación (mantenimiento)', 'Compatible con baterías de plomo-ácido selladas AGM, GEL y MF de 12V para autos, motos y lanchas', 'Protecciones integradas: inversión de polaridad, cortocircuito, sobrecarga y sobrecalentamiento', 'Indicadores LED de estado: cargando (rojo), carga completa (verde), error de conexión (parpadeante)', 'Cable de enchufe 110-240V incluido + pinzas caimán de acero cromado de alta conductividad'], category: 'automotive', nameEn: 'Yellow Battery Charger', featuresEn: ['Output: 12V DC — up to 12A charging current, float/maintenance mode included', 'LCD digital display: shows voltage (V), current (A), accumulated capacity (Ah) and power (W) in real time', 'Charging stages: soft precharge → bulk → absorption → float maintenance', 'Compatible with 12V sealed lead-acid AGM, GEL and MF batteries for cars, motorcycles and boats', 'Built-in protections: reverse polarity, short circuit, overload and overtemperature', 'LED status indicators: charging (red), full charge (green), connection error (flashing)', 'AC cable 110-240V included + high-conductivity chrome steel alligator clamps'],
    searchTags: ['bateria', 'carga', 'auto', 'moto', 'arrancar', 'voltaje', 'battery', 'charger', 'car'], priceMXN: 999 },
  { id: 'arrancador-vehiculos',   qty: 1,  name: 'Cargador de Baterías Inteligente para Autos y Motos, con Pantalla Digital', photos: VEHICLE_CHARGER_PHOTOS,
    features: ['Cargador inteligente de 7 etapas: desulfatación → precarga → carga principal → absorción → ecualización → flotación → pulso de mantenimiento', 'Compatible con baterías 12V y 6V: plomo-ácido estándar, AGM, GEL y de Calcio/MF', 'Selector de modo en pantalla digital: Normal / AGM / MF — evita daños por carga incorrecta', 'Pantalla LCD: porcentaje de carga (%), voltaje actual (V) y temperatura de la batería', 'Protecciones: sobrecalentamiento, cortocircuito, inversión de polaridad y sobreintensidad', 'Pinzas caimán niqueladas de alta conductividad incluidas — cables de 1.5 metros de largo', 'Certificación CE/RoHS, seguro para uso continuo sin supervisión (ideal para talleres)'], category: 'automotive', nameEn: 'Smart Battery Charger for Cars and Motorcycles, with Digital Display', featuresEn: ['7-stage smart charger: desulfation → precharge → bulk → absorption → equalization → float → pulse maintenance', 'Compatible with 6V and 12V batteries: standard lead-acid, AGM, GEL and Calcium/MF', 'Mode selector on digital display: Normal / AGM / MF — prevents damage from incorrect charging', 'LCD display: charge percentage (%), current voltage (V) and battery temperature', 'Protections: overtemperature, short circuit, reverse polarity and overcurrent', 'High-conductivity nickel-plated alligator clamps included — 1.5-meter cables', 'CE/RoHS certified, safe for continuous unattended use (ideal for workshops)'],
    searchTags: ['bateria', 'carga', 'auto', 'moto', 'arrancar', 'inteligente', 'battery', 'charger', 'smart'], priceMXN: 1299 },
  { id: 'mini-flashlight',        qty: 70, name: 'Mini Portable Flash Light — Lámparas', photos: FLASHLIGHT_PHOTOS,
    features: ['Modelo MX-X41: cuerpo de aleación de zinc y aluminio CNC con rueda giratoria antiestrés integrada', 'LED de alta luminosidad de hasta 800 lúmenes en modo turbo — visible a más de 200 metros', '3 modos de iluminación: Turbo (800lm) → Alto (400lm) → Bajo (100lm) — cambio por pulsación doble', 'Recargable por USB-C: batería integrada de 500mAh, carga completa en 45 minutos', 'Autonomía: 60 min en modo turbo / 2h en alto / 6h en bajo — indicador LED de batería integrado', 'Tamaño ultra-compacto: 7cm × 4cm, peso 80g — incluye mosquetón y clip de bolsillo metálicos', 'Resistencia a caídas de hasta 1 metro — carcasa resistente a salpicaduras IPX4'], category: 'lighting', nameEn: 'Mini Portable Flash Light — Lamps', featuresEn: ['MX-X41 model: CNC zinc alloy and aluminum body with integrated anti-stress spinning wheel', 'High-output LED up to 800 lumens in turbo mode — visible over 200 meters away', '3 lighting modes: Turbo (800lm) → High (400lm) → Low (100lm) — switched by double press', 'USB-C rechargeable: integrated 500mAh battery, full charge in 45 minutes', 'Runtime: 60 min turbo / 2h high / 6h low — integrated LED battery indicator', 'Ultra-compact: 7cm × 4cm, 80g — includes metal carabiner and pocket clip', 'Drop-resistant up to 1 meter — splash-resistant body IPX4'],
    searchTags: ['linterna', 'lampara', 'luz', 'flashlight', 'torch', 'llavero', 'bolsillo', 'led'], priceMXN: 299 },
  { id: 'lampara-recargable-powerbank', qty: 1, name: 'Lámpara LED Recargable Multifunción con Power Bank (Foco, Luz COB y USB Tipo-C)', photos: RECHARGEABLE_WORKLIGHT_PHOTOS,
    features: ['3 funciones en 1: foco spot LED concentrado (300lm), panel difuso COB (200lm) y power bank para cargar dispositivos', 'Batería de litio integrada de 10,000mAh — autonomía: foco 8h / panel COB 5h / carga completa de smartphone (1 vez)', 'Puerto USB-A de salida 5V/2A: carga teléfonos, tablets y cualquier dispositivo USB mientras ilumina', 'Carga de entrada por USB Tipo-C 5V/2A: carga completa en aproximadamente 4 horas', 'Indicador de batería de 4 barras LED en el lateral: nivel visible de un vistazo sin encender la lámpara', 'Gancho superior giratorio 360°: se cuelga en barras, carpas, mangueras — o se despliega como soporte trípode', 'Resistencia IPX4 a salpicaduras: apto para trabajo bajo lluvia ligera, taller y camping'], category: 'lighting', nameEn: 'Multifunction Rechargeable LED Lamp with Power Bank (Spotlight, COB Light and USB-C)', featuresEn: ['3-in-1: concentrated LED spotlight (300lm), COB diffuse panel (200lm) and USB power bank for charging devices', 'Integrated 10,000mAh lithium battery — runtime: spotlight 8h / COB panel 5h / one full smartphone charge', 'USB-A output port 5V/2A: charges phones, tablets and any USB device while illuminating', 'Input charge via USB-C 5V/2A: full charge in approximately 4 hours', '4-bar LED battery indicator on the side: level visible at a glance without turning on the lamp', '360° rotating top hook: hang on bars, tents, pipes — or unfold as a tripod stand', 'IPX4 splash resistance: suitable for light rain, workshop and camping use'],
    searchTags: ['linterna', 'lampara', 'luz', 'led', 'recargable', 'powerbank', 'foco', 'flashlight', 'lamp'], priceMXN: 1199 },
  { id: 'camara-bullet-dome',     qty: 1,  name: 'Cámara de Vigilancia Triple Lente (2 Bullet + 1 Domo), WiFi con Visión Nocturna Inteligente', photos: BULLET_DOME_CAMERA_PHOTOS,
    features: ['Sistema de 3 cámaras en 1 dispositivo: 2 bullet IP66 fijos (ángulo 90°) + 1 domo PTZ giratorio (pan 355° / tilt 90°)', 'Resolución Full HD 1080P (2MP) por cada lente — imagen nítida día y noche en las 3 vistas simultáneas', 'Visión nocturna inteligente dual: LEDs IR para modo silencioso + LEDs blancos para imagen a color de noche', 'Triple conectividad: WiFi 2.4GHz / Bluetooth para configuración inicial / Ethernet RJ45 para instalación fija', 'App gratuita iOS y Android: visualización en vivo, reproducción de grabaciones y alertas push de movimiento', 'Detección de movimiento con zonas de exclusión personalizables — reduce falsas alarmas por viento o animales', 'Grado de protección IP66: resistente a lluvia fuerte, polvo y temperatura -10°C a +50°C'], category: 'security', nameEn: 'Triple-Lens Security Camera (2 Bullet + 1 Dome), WiFi with Smart Night Vision', featuresEn: ['3-camera system in one device: 2 IP66 fixed bullet cameras (90° angle) + 1 PTZ rotating dome (pan 355° / tilt 90°)', 'Full HD 1080P (2MP) resolution per lens — sharp image day and night across all 3 simultaneous views', 'Dual smart night vision: IR LEDs for silent mode + white LEDs for full-color night image', 'Triple connectivity: WiFi 2.4GHz / Bluetooth for initial setup / Ethernet RJ45 for fixed installation', 'Free iOS and Android app: live view, recording playback and push motion alerts', 'Motion detection with customizable exclusion zones — reduces false alarms from wind or animals', 'IP66 protection: resistant to heavy rain, dust and temperatures from -10°C to +50°C'],
    searchTags: ['camara', 'vigilancia', 'seguridad', 'cctv', 'domo', 'bullet', 'nocturna', 'wifi', 'camera', 'security', 'surveillance', 'night'], priceMXN: 2599 },
  { id: 'pest-repeller',          qty: 1,  name: 'Repelente Electrónico Ultrasónico de Plagas (Ratones, Insectos y Arañas)', photos: PEST_REPELLER_PHOTOS,
    features: ['Frecuencia ultrasónica variable 20,000–65,000Hz: cambia automáticamente para evitar que las plagas se adapten', 'Doble emisor de ultrasonido: cubre hasta 120m² (dos habitaciones medianas o una sala grande)', 'Repele: ratones, ratas, mosquitos, arañas, cucarachas, hormigas y polillas — sin veneno ni químicos', 'Completamente seguro para humanos, perros, gatos y pájaros — no afecta a mascotas comunes', 'Consumo eléctrico mínimo: 4W — compatible con enchufes de 110V y 220V (adaptador incluido)', 'LED indicador de funcionamiento en color ámbar: visible para confirmar que está activo', 'Modo nocturno: desactiva el LED sin apagar el ultrasonido — no molesta al dormir'], category: 'health', nameEn: 'Electronic Ultrasonic Pest Repeller (Mice, Insects and Spiders)', featuresEn: ['Variable ultrasonic frequency 20,000–65,000Hz: automatically changes to prevent pest adaptation', 'Dual ultrasound emitter: covers up to 120m² (two medium rooms or one large living area)', 'Repels: mice, rats, mosquitoes, spiders, cockroaches, ants and moths — no poison or chemicals', 'Completely safe for humans, dogs, cats and birds — does not affect common household pets', 'Minimal power consumption: 4W — compatible with 110V and 220V outlets (adapter included)', 'Amber LED operation indicator: visible confirmation that the device is active', 'Night mode: disables the LED without turning off the ultrasound — no sleep disturbance'],
    searchTags: ['plaga', 'raton', 'rata', 'insecto', 'cucaracha', 'hormiga', 'araña', 'ultrasónico', 'pest', 'mice', 'rat', 'bug', 'repeller'], priceMXN: 349 },
  { id: 'linterna-camping-lifegear', qty: 1, name: 'Linterna de Campamento LED Life Gear, con Luz de Emergencia Roja', photos: CAMPING_LANTERN_PHOTOS,
    features: ['Marca Life Gear — fabricante especializado en iluminación de emergencia y equipamiento outdoor', 'Luz blanca LED principal: 250 lúmenes, autonomía 8 horas en modo normal', 'Luz roja de emergencia perimetral: modo continuo y SOS — señal visible hasta 1km de distancia', 'Panel solar incorporado en la tapa + carga por USB como fuente de respaldo adicional', 'Batería recargable de 2000mAh incluida: carga completa en 4h por USB — nunca sin luz en emergencias', 'Asa metálica superior plegable para colgar en tiendas de campaña, refugios o postes', 'IPX4 resistente a salpicaduras: apto para lluvia ligera, uso marino y expediciones'], category: 'lighting', nameEn: 'Life Gear LED Camping Lantern, with Red Emergency Light', featuresEn: ['Life Gear brand — specialist in emergency lighting and outdoor equipment', 'White LED main light: 250 lumens, 8-hour runtime in normal mode', 'Red emergency perimeter light: continuous mode and SOS — signal visible up to 1km away', 'Built-in solar panel on lid + USB charging as additional backup', '2000mAh rechargeable battery included: full charge in 4h via USB — never without light in emergencies', 'Foldable metal top handle for hanging in tents, shelters or poles', 'IPX4 splash resistant: suitable for light rain, marine use and expeditions'],
    searchTags: ['linterna', 'lampara', 'luz', 'camping', 'emergencia', 'led', 'lantern', 'torch', 'outdoor'], priceMXN: 749 },
  { id: 'reloj-led-anaranjado',   qty: 5,  name: 'Relojes de LEDs Anaranjados (1 Rosa) para Habitación, con Control de Apagado', photos: LED_CLOCK_PHOTOS,
    features: ['Pantalla LED naranja de alto contraste: dígitos de 3cm visibles desde toda la habitación — 1 unidad en rosa', 'Muestra: hora (12h/24h), día de la semana, temperatura interior en °C/°F y fecha completa (día/mes)', 'Doble alarma independiente: dos horarios de despertar distintos con función snooze de 5 minutos', 'Apagado automático programable: la pantalla se oscurece sola en el horario que configures', 'Ajuste de brillo en 3 niveles: brillante (día) / medio / atenuado (para dormir)', 'Alimentación: enchufe DC 5V + batería de respaldo CR2032 para mantener la hora sin luz', 'Superficie espejada de panel frontal: refleja el entorno y da sensación de mayor profundidad al ambiente'], category: 'clocks', nameEn: 'Orange LED Clocks (1 Pink) for Bedroom, with Auto Shut-Off', featuresEn: ['High-contrast orange LED display: 3cm digits visible from across the room — 1 unit in pink', 'Shows: time (12h/24h), day of the week, indoor temperature in °C/°F and full date (day/month)', 'Dual independent alarm: two different wake-up times with 5-minute snooze function', 'Programmable auto shut-off: screen dims automatically at the time you set', 'Brightness adjustment in 3 levels: bright (day) / medium / dim (for sleeping)', 'Power: DC 5V plug + CR2032 backup battery to keep time during power outages', 'Mirror-finish front panel: reflects the surroundings and adds depth to the room'],
    searchTags: ['reloj', 'despertador', 'alarma', 'hora', 'temperatura', 'led', 'habitacion', 'clock', 'alarm', 'bedroom'], priceMXN: 499 },
  { id: 'camara-ip',              qty: 10, name: 'Cámaras IP de Vigilancia', photos: IP_CAMERA_PHOTOS,
    features: ['Sensor CMOS 1080P Full HD: imagen de 2MP nítida en color durante el día y en blanco/negro de noche', 'Visión nocturna infrarroja: 6 LEDs IR de 940nm (invisibles), alcance hasta 5 metros en total oscuridad', 'Audio bidireccional: micrófono omnidireccional + altavoz integrado para hablar en tiempo real desde la app', 'WiFi 2.4GHz: configuración por código QR en menos de 2 minutos con la app V380 Pro (iOS y Android)', 'Almacenamiento: ranura microSD hasta 128GB en grabación continua o solo al detectar movimiento', 'Diseño ultra-compacto: 4.5cm × 4.5cm × 4cm, peso 50g — se oculta en cualquier rincón', 'Detección de movimiento con alerta push y clip de video enviado al teléfono en tiempo real'], category: 'security', nameEn: 'IP Security Cameras', featuresEn: ['1080P Full HD CMOS sensor: 2MP sharp color image by day and black/white by night', 'Infrared night vision: 6x 940nm IR LEDs (invisible), range up to 5 meters in complete darkness', 'Two-way audio: omnidirectional microphone + integrated speaker for real-time app conversation', 'WiFi 2.4GHz: QR code setup in under 2 minutes using V380 Pro app (iOS and Android)', 'Storage: microSD slot up to 128GB for continuous recording or motion-triggered only', 'Ultra-compact design: 4.5cm × 4.5cm × 4cm, 50g — hides in any corner', 'Motion detection with push alert and video clip sent to your phone in real time'],
    searchTags: ['camara', 'vigilancia', 'seguridad', 'ip', 'wifi', 'mini', 'espia', 'nocturna', 'camera', 'security', 'surveillance', 'spy'], priceMXN: 549 },
  { id: 'baliza-giratoria',       qty: 1,  name: 'Baliza LED Giratoria Roja con Zumbador 12/24V', photos: BEACON_PHOTOS,
    features: ['Marca Qlight — fabricante coreano líder en señalización industrial, certificado ISO 9001', 'LED rojo de alta potencia con cabezal rotativo a 360° a velocidad constante y uniforme', 'Compatible con sistemas eléctricos de 12V DC y 24V DC: autos, camionetas, camiones y maquinaria pesada', 'Zumbador piezoeléctrico integrado: sonido de alerta de 80dB — activable de forma independiente a la luz', 'Carcasa de policarbonato resistente a impactos, rayos UV y temperatura extrema', 'Montaje por tornillo M20 + base metálica con 2 agujeros de fijación incluidos — instalación permanente', 'Temperatura de operación: -20°C a +50°C — certificaciones CE para uso industrial y vehicular'], category: 'automotive', nameEn: 'Red Rotating LED Beacon with 12/24V Buzzer', featuresEn: ['Qlight brand — Korean leader in industrial signaling, ISO 9001 certified', 'High-power red LED with 360° rotating head at constant, uniform speed', 'Compatible with 12V DC and 24V DC electrical systems: cars, trucks and heavy machinery', 'Integrated piezoelectric buzzer: 80dB alert sound — independently switchable from the light', 'Polycarbonate housing resistant to impacts, UV rays and extreme temperatures', 'M20 bolt mounting + metal base with 2 fixing holes included — permanent installation', 'Operating temperature: -20°C to +50°C — CE certified for industrial and vehicle use'],
    searchTags: ['baliza', 'luz', 'giratoria', 'emergencia', 'zumbador', 'auto', 'beacon', 'light', 'rotating', 'emergency'], priceMXN: 1999 },
  { id: 'almohada-cuello',        qty: 1,  name: 'Almohada de Viaje para Cuello con Memory Foam y Gel', photos: NECK_PILLOW_PHOTOS,
    features: ['Core de memory foam viscoelástico de alta densidad (60 kg/m³): se adapta a la curva del cuello en segundos', 'Panel de gel de enfriamiento integrado: absorbe el calor corporal y regula la temperatura superficial', 'Dimensiones: 30cm × 30cm × 10cm — cubre cuello, nuca y laterales para evitar que la cabeza caiga', 'Funda exterior de terciopelo suave removible y lavable a 30°C en lavadora', 'Solapas laterales con cierre de velcro: se ajusta a la silla del avión, auto o tren sin resbalar', 'Diseño cerrado tipo herradura: soporte firme en ambos lados del cuello sin presionar la barbilla', 'Comprimible y empaquetable: incluye bolsa de compresión para reducir el volumen a la mitad'], category: 'travel', nameEn: 'Memory Foam and Gel Neck Travel Pillow', featuresEn: ['High-density viscoelastic memory foam core (60 kg/m³): conforms to neck curve in seconds', 'Integrated cooling gel panel: absorbs body heat and regulates surface temperature', 'Dimensions: 30cm × 30cm × 10cm — covers neck, nape and sides to prevent head from dropping', 'Soft velvet outer cover, removable and machine washable at 30°C', 'Side flaps with velcro closure: attaches to airplane, car or train seat without sliding', 'Closed horseshoe design: firm support on both sides of the neck without pressing the chin', 'Compressible and packable: includes compression bag to reduce volume by half'],
    searchTags: ['almohada', 'cuello', 'viaje', 'descanso', 'avion', 'pillow', 'neck', 'travel', 'foam', 'gel'], priceMXN: 549 },
  { id: 'palancas-llantas',       qty: 2,  name: 'Llave de Matraca para Birlos, 13.4 Pulgadas con Reversa', photos: RATCHET_WRENCH_PHOTOS,
    features: ['Longitud total: 13.4 pulgadas (34cm) — palanca suficiente para aflojar birlos de alta torque sin esfuerzo excesivo', 'Material: acero al cromo-vanadio (Cr-V) tratado térmicamente, dureza HRC 40-45 — no se deforma ni rompe', 'Función de reversión integrada: cambia dirección de giro sin retirar la llave del birlo', 'Torque máximo: 2000 kg·cm (196 Nm) — suficiente para birlos de llantas en SUVs y camionetas', 'Cabezas intercambiables: compatible con birlos de 17mm, 19mm, 21mm y 23mm (los tamaños más comunes)', 'Mango antideslizante con grip de goma bicolor: seguro con manos mojadas, engrasadas o con guantes', 'Acabado superficial niquelado brillante: resistente a la oxidación y corrosión por humedad'], category: 'automotive', nameEn: 'Lug Nut Ratchet Wrench, 13.4 Inches with Reverse', featuresEn: ['Total length: 13.4 inches (34cm) — enough leverage to loosen high-torque lug nuts without excessive effort', 'Material: heat-treated chrome-vanadium (Cr-V) steel, hardness HRC 40-45 — no bending or breaking', 'Integrated reverse function: changes rotation direction without removing the wrench from the lug nut', 'Maximum torque: 2000 kg·cm (196 Nm) — sufficient for lug nuts on SUVs and pickup trucks', 'Interchangeable sockets: fits 17mm, 19mm, 21mm and 23mm lug nuts (most common sizes)', 'Two-tone rubber grip handle: safe with wet, greasy or gloved hands', 'Bright nickel-plated finish: rust and corrosion resistant'],
    searchTags: ['llave', 'matraca', 'llanta', 'neumatico', 'birlo', 'herramienta', 'auto', 'wrench', 'tool', 'tire'], priceMXN: 649 },
  { id: 'camara-wireless',        qty: 1,  name: 'Cámara de Vigilancia Triple Lente 5K, WiFi con App (Pan 355° / Tilt 90°)', photos: WIRELESS_CAMERA_PHOTOS,
    features: ['Triple lente independiente: angular 4MP (150°) + zoom 4MP (90°) + detección 4MP — resolución combinada equivalente a 5K', 'Movimiento motorizado: Pan horizontal 355° sin punto ciego / Tilt vertical 90° — control remoto desde la app', 'Visión nocturna a color completa: tecnología StarLight con LEDs blancos activos + IR de respaldo', 'Audio bidireccional con cancelación de ruido activa: micrófono de alta sensibilidad + altavoz integrado', 'App gratuita iOS/Android: vista triple en 3 ventanas simultáneas, control PTZ y zoom digital 12x', 'Alertas push inteligentes: detección de movimiento con zonas configurables y diferenciación humano/vehículo', 'WiFi dual band 2.4GHz/5GHz + puerto Ethernet RJ45 — conexión estable incluso en exteriores'], category: 'security', nameEn: 'Triple-Lens 5K Security Camera, WiFi with App (Pan 355° / Tilt 90°)', featuresEn: ['3 independent lenses: wide 4MP (150°) + zoom 4MP (90°) + detection 4MP — combined resolution equivalent to 5K', 'Motorized movement: 355° horizontal Pan with no blind spot / 90° vertical Tilt — remote app control', 'Full-color night vision: StarLight technology with active white LEDs + IR backup', 'Two-way audio with active noise cancellation: high-sensitivity microphone + integrated speaker', 'Free iOS/Android app: triple window view, PTZ control and 12x digital zoom', 'Smart push alerts: motion detection with configurable zones and human/vehicle classification', 'Dual band WiFi 2.4GHz/5GHz + Ethernet RJ45 port — stable connection even outdoors'],
    searchTags: ['camara', 'vigilancia', 'seguridad', 'wifi', '5k', 'nocturna', 'movimiento', 'camera', 'security', 'surveillance', 'wireless', 'motion'], priceMXN: 2999 },
  { id: 'camara-355',             qty: 1,  name: 'Cámara de Vigilancia Grande 355° de Cobertura', photos: BIG_CAMERA_360_PHOTOS,
    features: ['Doble lente de alta resolución: 4MP principal (zoom óptico 12x) + 4MP gran angular (110°) — equivalente a 8K/16MP combinado', 'Cobertura horizontal 355° sin punto ciego gracias al sistema de doble cámara integrado en un solo cuerpo', 'Almacenamiento local: microSD hasta 128GB en modo loop + nube (FTP/NAS) compatible', 'Dos antenas WiFi externas de 5dBi: señal estable hasta 30 metros del router, penetra paredes', 'Luz de baliza LED integrada: modo disuasión activa con flash blanco/rojo + sirena de alarma 100dB', 'Visión nocturna 4 en 1: LEDs IR + LEDs a color + modo smart (selección automática según la luz)', 'IP66 impermeable: instalación en exterior, lluvia directa, polvo y temperatura -30°C a +60°C'], category: 'security', nameEn: 'Large Security Camera, 355° Coverage', featuresEn: ['Dual high-resolution lens: 4MP main (12x optical zoom) + 4MP wide angle (110°) — equivalent to 8K/16MP combined', '355° horizontal coverage with no blind spot thanks to the dual-camera system in one body', 'Local storage: microSD up to 128GB in loop mode + cloud (FTP/NAS) compatible', 'Two 5dBi external WiFi antennas: stable signal up to 30 meters from router, wall-penetrating', 'Integrated LED beacon light: active deterrence mode with white/red flash + 100dB alarm siren', 'Quad night vision: IR LEDs + color LEDs + smart mode (automatic selection based on light)', 'IP66 waterproof: outdoor installation, direct rain, dust and temperatures -30°C to +60°C'],
    searchTags: ['camara', 'vigilancia', 'seguridad', '8k', 'zoom', 'wifi', 'grande', 'camera', 'security', 'surveillance', '360'], priceMXN: 2799 },
  { id: 'camara-micro',           qty: 1,  name: 'Micro Cámara Espía WiFi con Detección de Movimiento y Alertas a la App', photos: MICRO_CAMERA_PHOTOS,
    features: ['Resolución 1080P Full HD: lente de 3.6mm con campo visual de 90° — imagen nítida en espacios pequeños', 'Detección de movimiento: graba automáticamente y envía foto + notificación push al celular en tiempo real', 'Almacenamiento local: microSD hasta 32GB en grabación en loop (no incluida) — sin costos de nube', 'WiFi 2.4GHz: configuración por código QR en menos de 2 minutos, sin necesidad de técnico', 'Visión nocturna IR: LEDs infrarrojos de 850nm con alcance de 3 metros en total oscuridad', 'Diseño discreto tipo adaptador USB/cargador: prácticamente invisible integrado en un tomacorriente', 'Incluye: cable USB, adaptador de corriente 5V, soporte de montaje y manual en español'], category: 'security', nameEn: 'WiFi Spy Micro Camera with Motion Detection and App Alerts', featuresEn: ['1080P Full HD resolution: 3.6mm lens with 90° field of view — sharp image in small spaces', 'Motion detection: automatically records and sends photo + push notification to phone in real time', 'Local storage: microSD up to 32GB in loop recording (not included) — no cloud subscription costs', 'WiFi 2.4GHz: QR code setup in under 2 minutes, no technician needed', 'IR night vision: 850nm infrared LEDs with 3-meter range in complete darkness', 'Discreet USB adapter/charger design: practically invisible plugged into an outlet', 'Includes: USB cable, 5V power adapter, mounting bracket and Spanish manual'],
    searchTags: ['camara', 'espia', 'spy', 'mini', 'micro', 'oculta', 'vigilancia', 'seguridad', 'movimiento', 'camera', 'security', 'hidden', 'motion'], priceMXN: 1099 },
  { id: 'bote-basura-electronico',qty: 2,  name: 'Bote de Basura Inteligente con Sensor de Apertura Automática (Blanco/Gris y Blanco/Negro)', photos: SMART_TRASH_BIN_PHOTOS,
    features: ['Sensor infrarrojo de presencia: apertura automática en 0.3 segundos al acercarse a 30cm — sin tocar la tapa', 'Cierre suave (soft-close): la tapa baja lenta y silenciosamente (<35dB) para no molestar', 'Capacidades: 12 litros (Blanco/Gris) y 8 litros (Blanco/Negro) — incluye aro para bolsa estándar', 'Material ABS de alta resistencia, sin BPA, superficie antibacteriana fácil de limpiar con paño húmedo', 'Alimentación: 4 pilas AA (incluidas) — autonomía hasta 12 meses de uso normal doméstico', 'Patas antideslizantes de goma en la base: no se desplaza al abrir/cerrar ni en pisos lisos', 'Compatible con bolsas de basura estándar de supermercado — no requiere bolsas especiales'], category: 'home', nameEn: 'Smart Trash Can with Automatic Sensor Lid (White/Gray and White/Black)', featuresEn: ['Infrared proximity sensor: automatic opening in 0.3 seconds when approaching within 30cm — hands-free', 'Soft-close lid: drops slowly and quietly (<35dB) so it does not disturb', 'Capacities: 12 liters (White/Gray) and 8 liters (White/Black) — includes standard bag ring', 'BPA-free ABS material, antibacterial surface easy to clean with a damp cloth', 'Power: 4 AA batteries (included) — up to 12 months runtime with normal domestic use', 'Non-slip rubber feet on base: stays in place when opening/closing on smooth floors', 'Compatible with standard supermarket trash bags — no special bags required'], priceMXN: 799 },
  { id: 'mini-refrigerador',      qty: 1,  name: 'Mini Refrigerador Portátil para Insulina, con Pantalla Digital de Temperatura', photos: MINI_FRIDGE_PHOTOS, zoom: 1.35,
    features: ['Rango de temperatura regulable: 2°C a 18°C (enfriamiento) o 20°C a 65°C (calentamiento) según necesidad', 'Tecnología Peltier sin compresor: enfriamiento silencioso (<25dB), sin vibración, sin gas refrigerante', 'Capacidad interna: hasta 10 viales de insulina de 10ml o 6 plumas de insulina tipo KwikPen', 'Batería de litio integrada 6000mAh: hasta 8 horas de autonomía sin enchufar — ideal para viajes y consultas', 'Alimentación triple: enchufe 110-240V / cable DC 12V para auto (encendedor) / batería interna', 'Modo AUTO: regula la temperatura automáticamente según el perfil de insulina configurado', 'Pantalla digital con control táctil: temperatura actual, temperatura objetivo e indicador de batería en barras'], category: 'home', nameEn: 'Portable Mini Fridge for Insulin, with Digital Temperature Display', featuresEn: ['Adjustable temperature range: 2°C to 18°C (cooling) or 20°C to 65°C (warming) as needed', 'Compressor-free Peltier technology: silent cooling (<25dB), no vibration, no refrigerant gas', 'Internal capacity: up to 10x 10ml insulin vials or 6 KwikPen-style insulin pens', 'Integrated 6000mAh lithium battery: up to 8 hours without plugging in — ideal for travel and appointments', 'Triple power: 110-240V outlet / 12V DC car cable (cigarette lighter) / internal battery', 'AUTO mode: automatically regulates temperature based on configured insulin profile', 'Digital display with touch control: current temp, target temp and battery level bars'], priceMXN: 2499 },
  { id: 'reloj-weather-station',  qty: 1,  name: 'Estación Meteorológica Inalámbrica con Reloj, Sensor Exterior y Pronóstico del Tiempo', photos: WEATHER_STATION_PHOTOS, zoom: 1.15,
    features: ['Sensor exterior inalámbrico con alcance de 60m (sin obstáculos) — transmite cada 60 segundos', 'Pronóstico del tiempo a 12-24h basado en algoritmo barométrico interno — 5 iconos de clima', 'Datos en pantalla: hora, día, mes, año, temperatura interior/exterior (°C/°F) y humedad relativa (%)', 'Fase lunar: 8 fases representadas gráficamente — ciclo lunar completo en pantalla', 'Pantalla de 5" con retroiluminación blanca activada por toque (se apaga automáticamente)', 'Sincronización de hora por radio DCF/WWVB en zonas compatibles — hora siempre exacta', 'Batería del sensor exterior: 2 pilas AA, autonomía 18 meses — no requiere carga'], category: 'clocks', nameEn: 'Wireless Weather Station with Clock, Outdoor Sensor and Forecast', featuresEn: ['Wireless outdoor sensor with 60m range (unobstructed) — transmits every 60 seconds', '12-24h weather forecast based on internal barometric algorithm — 5 weather icons', 'On-screen data: time, day, month, year, indoor/outdoor temperature (°C/°F) and relative humidity (%)', 'Moon phase: 8 phases displayed graphically — full lunar cycle on screen', '5" display with touch-activated white backlight (auto-off)', 'DCF/WWVB radio time sync in compatible zones — always accurate time', 'Outdoor sensor battery: 2 AA batteries, 18-month runtime — no charging required'], priceMXN: 1299 },
  { id: 'fire-tv-stick',          qty: 2,  name: 'Fire TV Stick Lite, Marca Amazon, con Control Remoto', photos: FIRE_TV_STICK_PHOTOS, zoom: 1.1,
    features: ['Procesador quad-core 1.7GHz + GPU PowerVR GE8300: navegación fluida entre apps sin tirones', 'Resolución Full HD 1080P a 60fps con soporte HDR10 y HDR10+ — imagen nítida en cualquier TV Full HD', 'WiFi 802.11 a/b/g/n/ac dual band 2.4GHz y 5GHz — Bluetooth 5.0 para gamepads y audífonos', 'Control remoto por voz Alexa: busca por voz en Netflix, Prime Video, YouTube, Disney+, HBO Max y más', 'Más de 1 millón de películas y series disponibles + apps de música, juegos y deportes', 'Memoria RAM 1GB / Almacenamiento interno 8GB — sin tarjeta de memoria adicional', 'Incluye: adaptador de corriente, cable HDMI extensor, pilas del control remoto — listo para usar'], category: 'electronics', nameEn: 'Fire TV Stick Lite, Amazon Brand, with Remote', featuresEn: ['1.7GHz quad-core processor + PowerVR GE8300 GPU: smooth app navigation without lag', 'Full HD 1080P resolution at 60fps with HDR10 and HDR10+ support — sharp image on any Full HD TV', 'WiFi 802.11 a/b/g/n/ac dual band 2.4GHz and 5GHz — Bluetooth 5.0 for gamepads and headphones', 'Alexa voice remote: search by voice on Netflix, Prime Video, YouTube, Disney+, HBO Max and more', 'Over 1 million movies and series + music, games and sports apps', '1GB RAM / 8GB internal storage — no additional memory card needed', 'Includes: power adapter, HDMI extender cable, remote batteries — ready to use out of the box'], priceMXN: 999 },
  { id: 'tenis-jordan',           qty: 1,  name: 'Tenis Deportivos Negro con Dorado, Talla 45', photos: SNEAKERS_PHOTOS,
    features: ['Material superior: malla transpirable con refuerzos de cuero sintético en puntera y talón', 'Suela exterior de goma vulcanizada con tread multidireccional para agarre en superficies mixtas', 'Entresuela EVA de alta densidad con cámara de aire centralizada — amortiguación de impacto en cada paso', 'Diseño: negro mate con detalles dorados en lengüeta, cordones, logo lateral y suela', 'Talla: 45 EU / 12 US / 11 UK — verificar tabla de tallas antes de ordenar', 'Peso por par: 650g — perfil medio alto para soporte de tobillo en entrenamientos', 'Recomendado para: running de baja intensidad, gym, uso casual y training en cancha'], category: 'travel', nameEn: 'Black and Gold Sport Sneakers, Size 45', featuresEn: ['Upper material: breathable mesh with synthetic leather reinforcements at toe and heel', 'Vulcanized rubber outsole with multidirectional tread pattern for grip on mixed surfaces', 'High-density EVA midsole with centralized air chamber — impact cushioning with every step', 'Design: matte black with gold details on tongue, laces, side logo and sole', 'Size: 45 EU / 12 US / 11 UK — check size chart before ordering', 'Weight per pair: 650g — mid-high profile for ankle support during training', 'Recommended for: low-intensity running, gym, casual wear and court training'], priceMXN: 799 },
  { id: 'modem-4g',               qty: 1,  name: 'Módem Inalámbrico 4G Blue Telecomm, Multi-SIM (Telcel, AT&T, Movistar)', photos: MODEM_4G_PHOTOS,
    features: ['Tecnología LTE Cat-4: velocidades teóricas hasta 150Mbps de descarga / 50Mbps de subida', 'Bandas LTE compatibles: B1/B3/B7/B28/B41 — Telcel (B28), AT&T (B7) y Movistar (B3) incluidos', 'Crea red WiFi privada para hasta 10 dispositivos simultáneos con contraseña personalizable', 'Ranura nano-SIM: inserta cualquier chip 4G/LTE desbloqueado — sin contrato con operador fijo', 'Indicadores LED de estado: encendido, intensidad de señal (1-5 barras), WiFi activo y datos en transmisión', 'Antena externa de alta ganancia desmontable incluida: mejora la recepción en zonas de señal débil', 'Alimentación: micro-USB 5V/2A — funciona con power bank para uso portátil fuera de casa'], category: 'electronics', nameEn: 'Blue Telecomm 4G Wireless Modem, Multi-SIM (Telcel, AT&T, Movistar)', featuresEn: ['LTE Cat-4 technology: theoretical speeds up to 150Mbps download / 50Mbps upload', 'Compatible LTE bands: B1/B3/B7/B28/B41 — Telcel (B28), AT&T (B7) and Movistar (B3) included', 'Creates a private WiFi network for up to 10 simultaneous devices with customizable password', 'Nano-SIM slot: insert any unlocked 4G/LTE SIM — no fixed carrier contract', 'LED status indicators: power, signal strength (1-5 bars), active WiFi and data transmission', 'Removable high-gain external antenna included: improves reception in weak signal areas', 'Power: micro-USB 5V/2A — works with a power bank for portable use away from home'], priceMXN: 1199 },
  { id: 'portarrollos-bano',      qty: 1,  name: 'Portarrollos de Papel Higiénico Impermeable, con Cajón de Almacenamiento', photos: TOILET_PAPER_HOLDER_PHOTOS,
    features: ['Material ABS y PP 100% impermeable: no se oxida ni deforma con la humedad constante del baño', 'Cajón inferior deslizante de 21 × 15 × 4cm: almacena toallas sanitarias, artículos de higiene o medicamentos', 'Tapa superior abatible con clip de seguridad magnético: no se abre sola con la humedad o vibración', 'Compatible con rollos estándar hasta 12cm de diámetro y 15cm de largo — sin restricción de marca', 'Instalación por tornillos de acero inoxidable incluidos: funciona en paredes de concreto, yeso o cerámica', 'Dimensiones totales: 21 × 21.5 × 11cm — perfil compacto, no interfiere con el uso del inodoro', 'Color blanco neutro universal: combina con cualquier estilo de baño clásico o moderno'], category: 'home', nameEn: 'Waterproof Toilet Paper Holder with Storage Drawer', featuresEn: ['100% waterproof ABS and PP material: no rust or deformation with constant bathroom humidity', 'Sliding bottom drawer 21 × 15 × 4cm: stores sanitary pads, hygiene items or medications', 'Magnetic safety clip on hinged top lid: does not open on its own from humidity or vibration', 'Compatible with standard rolls up to 12cm diameter and 15cm long — no brand restriction', 'Installation with included stainless steel screws: works on concrete, drywall or ceramic tile walls', 'Total dimensions: 21 × 21.5 × 11cm — compact profile, does not interfere with toilet use', 'Universal white color: matches any classic or modern bathroom style'], priceMXN: 399 },
  { id: 'limpiador-cocina',       qty: 1,  name: 'Limpiador Eléctrico Giratorio para Cocina, con Cabezales Intercambiables', photos: ELECTRIC_CLEANER_PHOTOS,
    features: ['Motor de 2500 RPM: limpieza profunda en segundos sin esfuerzo manual — ideal para juntas, azulejos y ollas', '3 cabezales intercambiables por clip universal: cepillo de cerdas suaves (azulejos), esponja (superficies delicadas) y cepillo de alambre (óxido/suciedad dura)', 'Batería de litio 2000mAh: 60 minutos de uso continuo por carga completa (2.5h vía USB)', 'IPX4 resistente al agua: seguro para operar bajo el grifo y en superficies mojadas sin riesgo', 'Mango ergonómico de 180mm con grip antideslizante y botón de encendido de fácil acceso', 'Peso total con cabezal: 350g — ligero para uso prolongado sin fatiga en brazo o muñeca', 'Compatible con cabezales de repuesto del mercado (sistema de clip estándar de 5mm)'], category: 'home', nameEn: 'Electric Spin Scrubber for the Kitchen, with Interchangeable Heads', featuresEn: ['2500 RPM motor: deep cleaning in seconds without manual effort — ideal for grout, tiles and pots', '3 interchangeable clip-on heads: soft bristle brush (tiles), sponge (delicate surfaces) and wire brush (rust/tough grime)', '2000mAh lithium battery: 60 minutes continuous use per full charge (2.5h via USB)', 'IPX4 water resistant: safe to use under running water and on wet surfaces without risk', '180mm ergonomic handle with non-slip grip and easy-access power button', 'Total weight with head: 350g — lightweight for extended use without arm or wrist fatigue', 'Compatible with market-standard replacement heads (5mm standard clip system)'], priceMXN: 849 },
  { id: 'dispensador-liquido-neg',qty: 1,  name: 'Dispensador Electrónico de Líquido para Lavar Manos, Negro, con Hora y Temperatura', photos: SOAP_DISPENSER_BLACK_PHOTOS,
    features: ['Sensor infrarrojo de mano: dosificación automática sin contacto a 3-5cm — higiene total en la cocina o baño', 'Capacidad del depósito: 280ml visible desde ventana translúcida lateral — sin desmontarlo para ver el nivel', 'Pantalla digital frontal: hora (HH:MM), temperatura ambiente (°C) y nivel de líquido en barras', 'Alerta de nivel bajo: icono parpadeante cuando queda menos del 10% de jabón o gel', 'Volumen de dosis ajustable: 0.8ml (ahorro) o 1.5ml (mayor limpieza) según producto y preferencia', 'Alimentación dual: 4 pilas AA (incluidas) o cable USB-C (incluido) — nunca se queda sin energía', 'Material ABS negro mate sin huellas, compatible con jabón líquido, gel hidroalcohólico y desinfectante'], category: 'home', nameEn: 'Electronic Soap Dispenser, Black, with Clock and Temperature', featuresEn: ['Infrared hand sensor: touchless dispensing at 3-5cm — total hygiene in the kitchen or bathroom', '280ml tank capacity visible through lateral translucent window — no need to remove it to check level', 'Front digital display: time (HH:MM), ambient temperature (°C) and liquid level in bars', 'Low level alert: blinking icon when less than 10% of soap or gel remains', 'Adjustable dose volume: 0.8ml (save) or 1.5ml (more cleaning) depending on product and preference', 'Dual power: 4 AA batteries (included) or USB-C cable (included) — never runs out of power', 'Fingerprint-free matte black ABS, compatible with liquid soap, hand gel and disinfectant'], priceMXN: 649 },
  { id: 'reloj-led-espejo',       qty: 1,  name: 'Reloj Despertador LED con Espejo, Temperatura y Humedad', photos: MIRROR_LED_CLOCK_PHOTOS,
    features: ['Pantalla espejo inteligente: actúa como espejo normal cuando está apagada — encendida muestra datos sin opacarlo', 'Dígitos LED blancos de 2cm de alto: hora principal en gran tamaño, temperatura y humedad en zona inferior verde', 'Temperatura: rango -10°C a +50°C, precisión ±1°C / Humedad relativa: 20-90% HR, precisión ±5%', 'Alarma única configurable con función snooze de 5 minutos — activación por botón en la parte trasera', 'Actualización de temperatura y humedad cada 30 segundos — datos siempre precisos', 'Alimentación: cable USB 5V incluido + batería de respaldo CR2032 para no perder hora', 'Dimensiones: 23cm × 7cm × 3.5cm — formato horizontal perfecto para mesita de noche o escritorio'], category: 'clocks', nameEn: 'Mirror-Finish LED Alarm Clock with Temperature and Humidity', featuresEn: ['Smart mirror display: works as a normal mirror when off — shows data without darkening when on', 'White LED digits 2cm tall: large main time, temperature and humidity in green lower zone', 'Temperature: range -10°C to +50°C, ±1°C accuracy / Relative humidity: 20-90% RH, ±5% accuracy', 'Single configurable alarm with 5-minute snooze — activated by button on the back', 'Temperature and humidity update every 30 seconds — always accurate data', 'Power: included USB 5V cable + CR2032 backup battery to keep time during outages', 'Dimensions: 23cm × 7cm × 3.5cm — horizontal format perfect for nightstand or desk'], priceMXN: 799 },
  { id: 'antironquidos',          qty: 1,  name: 'Dispositivo Electrónico Antironquidos, con Dilatadores Nasales de Silicona', photos: ANTI_SNORING_PHOTOS,
    features: ['Modelo ZHQ-008: combina dilatadores nasales de silicona médica + micro-estimulador de bio-corriente', 'Dilatadores nasales: abren los conductos nasales mecánicamente, mejoran flujo de aire hasta un 38%', 'Micro-estimulador: detecta el sonido del ronquido por micrófono y activa estimulación muscular de baja intensidad (imperceptible al dormir)', 'No invasivo, sin efectos secundarios: aprobado para uso personal, sin medicamentos ni cirugía', 'Batería recargable por USB-C: autonomía de 15-20 noches por carga completa (carga en 1.5h)', 'Indicador LED de batería y estado de operación — fácil de monitorear en la oscuridad', 'Incluye: 2 almohadillas de silicona de repuesto + cable USB + estuche protector rígido'], category: 'health', nameEn: 'Electronic Anti-Snoring Device with Silicone Nasal Dilators', featuresEn: ['ZHQ-008 model: combines medical-grade silicone nasal dilators + bio-current micro-stimulator', 'Nasal dilators: mechanically open nasal passages, improving airflow by up to 38%', 'Micro-stimulator: detects snoring sound via microphone and activates low-intensity muscle stimulation (imperceptible while sleeping)', 'Non-invasive, no side effects: approved for personal use, no medication or surgery', 'USB-C rechargeable battery: 15-20 nights runtime per full charge (charges in 1.5h)', 'LED battery and operation indicator — easy to monitor in the dark', 'Includes: 2 replacement silicone pads + USB cable + hard protective case'], priceMXN: 999 },
  { id: 'cepillos-taladro',       qty: 5,  name: 'Kit de Cepillos para Taladro, Limpieza, Amarillos (6 Piezas con Extensión)', photos: DRILL_BRUSHES_PHOTOS,
    features: ['Kit de 6 piezas: cepillo redondo 75mm, cepillo 50mm, cepillo plano 100mm, cepillo cónico, cepillo de esquina y vara extensora de 15cm', 'Cerdas de nilón amarillo de alta resistencia: soporte hasta 3000 RPM sin deformación ni pérdida de cerdas', 'Vástago hexagonal de 6mm universal: encaja en cualquier taladro o atornillador de 3/8" o 1/2" sin adaptador', 'Usos: desengrase de tapicería de auto, limpieza de llantas, juntas de azulejos, rejillas, sillones y alfombras', 'Resistente a agua, jabón, desengrasantes y solventes de limpieza domésticos comunes', 'Vara extensora de 15cm: alcanza esquinas profundas, bajo los asientos y zonas difíciles de acceder', 'Tubo organizador de almacenamiento incluido para guardar los 6 cabezales juntos y protegerlos'], category: 'automotive', nameEn: 'Drill Brush Cleaning Kit, Yellow (6 Pieces with Extension)', featuresEn: ['6-piece kit: 75mm round brush, 50mm brush, 100mm flat brush, cone brush, corner brush and 15cm extension rod', 'Yellow nylon bristles: withstand up to 3000 RPM without deformation or bristle loss', 'Universal 6mm hex shank: fits any 3/8" or 1/2" drill or driver without adapter', 'Uses: car upholstery degreasing, wheel cleaning, tile grout, grilles, sofas and carpets', 'Resistant to water, soap, degreasers and common household cleaning solvents', '15cm extension rod: reaches deep corners, under seats and hard-to-access areas', 'Storage tube included to keep all 6 heads together and protected'], priceMXN: 449 },
  { id: 'mosquitero-rosa',        qty: 1,  name: 'Trampa de Mosquitos por Vórtice, Rosa, con Caja Atrapa-Mosquitos', photos: PINK_MOSQUITO_VORTEX_PHOTOS,
    features: ['Motor de succión por vórtice: genera corriente de aire a 1.2 m/s que atrapa insectos sin matarlos instantáneamente', 'Doble conducto de entrada en la base: aumenta 40% la zona de captura vs diseños de un solo orificio', 'Luz UV de 365nm: longitud de onda más atractiva para mosquitos hembra (las que pican) y polillas nocturnas', 'Caja contenedora desmontable y transparente: ve los mosquitos atrapados sin abrir el aparato', 'Sin veneno, sin químicos, sin olor: 100% física y ecológica, segura para niños, embarazadas y mascotas', 'Potencia: 5W, alimentación USB 5V/1A — compatible con cualquier cargador, TV o power bank', 'Dimensiones: 128 × 125 × 218mm, peso 350g — portátil, colgable desde el asa superior'], category: 'health', nameEn: 'Vortex Mosquito Trap, Pink, with Catch Box', featuresEn: ['Vortex suction motor: generates 1.2 m/s airflow that traps insects without instantly killing them', 'Dual bottom air intake: 40% larger capture zone vs single-intake designs', '365nm UV light: most attractive wavelength for female mosquitoes (the ones that bite) and nocturnal moths', 'Removable transparent catch box: see trapped mosquitoes without opening the device', 'No poison, no chemicals, no odor: 100% physical and ecological, safe for children, pregnant women and pets', 'Power: 5W, USB 5V/1A — compatible with any charger, TV or power bank', 'Dimensions: 128 × 125 × 218mm, weight 350g — portable, hangable from the top handle'], priceMXN: 649 },
  { id: 'trampa-mosquitos-usb',   qty: 1,  name: 'Trampa de Mosquitos USB con Luz UV', photos: MOSQUITO_TRAP_PHOTOS,
    features: ['Luz UV de 395nm: longitud de onda óptima para atraer mosquitos, polillas, jejenes y mosquitas de fruta', 'Malla electrizante de alta tensión 750V: elimina insectos al contacto de forma instantánea y silenciosa', 'Sin olores, sin líquidos, sin productos químicos — 100% seguro para ambientes cerrados con bebés y mascotas', 'Rango de cobertura efectiva: hasta 25m² (habitaciones medianas, dormitorios y salas)', 'Bandeja inferior desmontable y lavable: recoge los insectos para una limpieza higiénica y fácil', 'Alimentación USB 5V, 5W: conectar a cualquier adaptador, TV, computadora o power bank', 'Nivel de ruido prácticamente nulo (<25dB): no interrumpe el sueño — funciona toda la noche'], category: 'health', nameEn: 'USB Mosquito Trap with UV Light', featuresEn: ['395nm UV light: optimal wavelength to attract mosquitoes, moths, gnats and fruit flies', '750V high-voltage electrocuting grid: instantly and silently kills insects on contact', 'No odors, no liquids, no chemicals — 100% safe for enclosed spaces with babies and pets', 'Effective coverage range: up to 25m² (medium rooms, bedrooms and living areas)', 'Removable washable bottom tray: collect insects for hygienic and easy cleaning', 'USB 5V, 5W power: connect to any adapter, TV, computer or power bank', 'Near-silent noise level (<25dB): does not interrupt sleep — runs all night'], priceMXN: 449 },
  { id: 'caja-gel-auto',          qty: 1,  name: 'Gel Pad de Nanotecnología, Reutilizable, para Fijar el Celular en Cualquier Superficie', photos: GEL_PAD_PHOTOS,
    features: ['Superficie de silicona nanométrica: se adhiere y desprende cientos de veces sin dejar residuo ni dañar la pintura', 'Incluye 2 formas: circular (Ø10cm) y cuadrada (10×10cm) — para distintos formatos de celular', 'Carga máxima: hasta 500g por pad — soporta cualquier smartphone, incluidos con funda gruesa', 'Compatible con: tablero de auto, salpicadera, espejo, madera, vidrio, metal, cerámica y plástico', 'Lavable con agua fría: recupera el 100% de capacidad adhesiva al secarse naturalmente', 'Sin pegamento, sin acetona, sin residuos: superficie de contacto limpia siempre que se lave', 'Transparente y discreto: prácticamente invisible integrado en el tablero o pared'], category: 'automotive', nameEn: 'Reusable Nano Gel Pad, Sticks Your Phone to Any Surface', featuresEn: ['Nanometric silicone surface: adheres and releases hundreds of times without residue or paint damage', 'Includes 2 shapes: circular (Ø10cm) and square (10×10cm) — for different phone formats', 'Maximum load: up to 500g per pad — supports any smartphone, including with thick cases', 'Compatible with: car dashboard, visor, mirror, wood, glass, metal, ceramic and plastic', 'Washable with cold water: recovers 100% adhesive capacity when naturally dried', 'No glue, no acetone, no residue: contact surface stays clean after each wash', 'Transparent and discreet: virtually invisible on dashboard or wall'], priceMXN: 299 },
  { id: 'cargador-universal',     qty: 1,  name: 'Adaptador Universal de Viaje con Protector de Sobrevoltaje (UK/US/Europa/AUS)', photos: TRAVEL_ADAPTER_PHOTOS,
    features: ['Compatible con más de 150 países: clavijas UK (tipo G), US (A/B), Europa (C/E/F) y Australia (tipo I)', 'Protector de sobrevoltaje integrado (SPD): absorbe picos de hasta 2500V — protege laptops y cámaras', 'Capacidad máxima: 6A / 100-250V AC — carga laptops, tablets, secadoras y smartphones sin problema', 'Switch de seguridad mecánico: bloquea las clavijas para evitar cortocircuito accidental en el bolsillo', 'Certificaciones internacionales: CE, RoHS, FCC — cumple normativas de seguridad de UE, EE.UU. y China', 'Sin USB (adaptador puro): usar con el cargador original del dispositivo para mayor seguridad eléctrica', 'Dimensiones compactas: 5.8cm × 5.8cm × 6.2cm, peso 130g — cabe en cualquier neceser de viaje'], category: 'electronics', nameEn: 'Universal Travel Adapter with Surge Protector (UK/US/Europe/AUS)', featuresEn: ['Compatible with 150+ countries: UK (type G), US (A/B), Europe (C/E/F) and Australia (type I) plugs', 'Integrated surge protector (SPD): absorbs spikes up to 2500V — protects laptops and cameras', 'Maximum capacity: 6A / 100-250V AC — charges laptops, tablets, hair dryers and smartphones', 'Mechanical safety switch: locks pins to prevent accidental short circuit in a bag', 'International certifications: CE, RoHS, FCC — meets EU, US and China safety standards', 'No USB (pure adapter): use with device\'s original charger for maximum electrical safety', 'Compact dimensions: 5.8cm × 5.8cm × 6.2cm, 130g — fits in any travel toiletry bag'], priceMXN: 349 },
  { id: 'key-finder',             qty: 1,  name: 'Localizador de Llaves con Silbido, Key Finder', photos: KEY_FINDER_PHOTOS,
    features: ['Activación por silbido: responde a silbidos a más de 1.5 metros, frecuencia de detección 2500Hz', 'Alarma sonora de 85dB + LED rojo parpadeante: localización auditiva y visual simultánea', 'Alcance de respuesta efectivo: hasta 6 metros en ambientes con ruido ambiental moderado', 'Set de 4 llaveros: rojo, blanco, azul y negro — para diferenciar llaves de distintos usos', 'Alimentación: 2 pilas LR44 (incluidas) por llavero — autonomía 6-8 meses de uso normal', 'Usos: llaves, bolsos, mochilas, control remoto, cartera y collar de mascotas', 'Sin app, sin Bluetooth, sin configuración — funciona inmediatamente al encender con las pilas'], category: 'electronics', nameEn: 'Whistle-Activated Key Finder', featuresEn: ['Whistle activation: responds to whistles at over 1.5 meters, detection frequency 2500Hz', '85dB audible alarm + flashing red LED: simultaneous audio and visual location', 'Effective response range: up to 6 meters in moderate ambient noise environments', 'Set of 4 keyrings: red, white, blue and black — to differentiate keys for different uses', 'Power: 2x LR44 batteries (included) per keyring — 6-8 months runtime with normal use', 'Uses: keys, bags, backpacks, remote controls, wallets and pet collars', 'No app, no Bluetooth, no setup — works immediately when batteries are inserted'], priceMXN: 299 },
]

export const BoxIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4}
    strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 sm:w-12 sm:h-12" style={{ color: 'rgba(212,175,55,0.55)' }}>
    <path d="M21 8L12 3 3 8l9 5 9-5z" />
    <path d="M3 8v8l9 5 9-5V8" />
    <path d="M12 13v8" />
  </svg>
)

export const ChevronIcon = ({ dir }: { dir: 'left' | 'right' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
    strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d={dir === 'left' ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6'} />
  </svg>
)

export function PhotoCarousel({ photos, alt, zoom = 1 }: { photos: string[]; alt: string; zoom?: number }) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

  const onScroll = () => {
    const el = scrollerRef.current
    if (!el) return
    const idx = Math.round(el.scrollLeft / el.clientWidth)
    setActive(idx)
  }

  const goTo = (idx: number) => {
    const el = scrollerRef.current
    if (!el) return
    const clamped = Math.max(0, Math.min(photos.length - 1, idx))
    el.scrollTo({ left: clamped * el.clientWidth, behavior: 'smooth' })
  }

  return (
    <div className="relative w-full aspect-[4/5] flex-shrink-0 group overflow-hidden" style={{ background: '#FFFFFF' }}>
      <div
        ref={scrollerRef}
        onScroll={onScroll}
        className="w-full h-full flex overflow-x-auto no-scrollbar"
        style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}
      >
        {photos.map((src, i) => (
          <div key={i} className="w-full h-full flex-shrink-0 overflow-hidden" style={{ scrollSnapAlign: 'start' }}>
            <img src={src} alt={`${alt} ${i + 1}`} loading="lazy"
              className="w-full h-full object-contain"
              style={{ transform: zoom !== 1 ? `scale(${zoom})` : undefined }} />
          </div>
        ))}
      </div>
      {photos.length > 1 && (
        <>
          <button type="button" aria-label="Foto anterior"
            onClick={() => goTo(active - 1)}
            disabled={active === 0}
            className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-7 h-7 rounded-full transition-opacity duration-200 cursor-pointer sm:opacity-0 sm:group-hover:opacity-100"
            style={{ background: 'rgba(255,255,255,0.9)', color: '#0C0C0C', boxShadow: '0 1px 4px rgba(0,0,0,0.3)', opacity: active === 0 ? 0.35 : undefined }}>
            <ChevronIcon dir="left" />
          </button>
          <button type="button" aria-label="Foto siguiente"
            onClick={() => goTo(active + 1)}
            disabled={active === photos.length - 1}
            className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-7 h-7 rounded-full transition-opacity duration-200 cursor-pointer sm:opacity-0 sm:group-hover:opacity-100"
            style={{ background: 'rgba(255,255,255,0.9)', color: '#0C0C0C', boxShadow: '0 1px 4px rgba(0,0,0,0.3)', opacity: active === photos.length - 1 ? 0.35 : undefined }}>
            <ChevronIcon dir="right" />
          </button>
        </>
      )}
      {photos.length > 1 && (
        <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-1.5">
          {photos.map((_, i) => (
            <span key={i} className="rounded-full transition-all duration-200"
              style={{
                width: i === active ? '14px' : '5px', height: '5px',
                background: i === active ? '#D4AF37' : 'rgba(255,255,255,0.85)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
              }} />
          ))}
        </div>
      )}
    </div>
  )
}

export const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
    <path d="M20 6 9 17l-5-5" />
  </svg>
)

export const InfoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 flex-shrink-0">
    <circle cx="12" cy="12" r="9.25" />
    <path d="M12 11v5.5" /><circle cx="12" cy="8" r="0.5" fill="currentColor" />
  </svg>
)

export const TruckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 sm:w-[18px] sm:h-[18px] flex-shrink-0">
    <path d="M1 3h15v13H1z" /><path d="M16 8h4l3 3v5h-7V8z" />
    <circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
)

function ProductCard({ p, addLabel, addedLabel, pendingPriceLabel, stockLabel, freeShippingLabel, moreInfoLabel, lang }: {
  p: Product; addLabel: string; addedLabel: string; pendingPriceLabel: string; stockLabel: string; freeShippingLabel: string; moreInfoLabel: string; lang: string
}) {
  const { addItem } = useCart()
  const [justAdded, setJustAdded] = useState(false)
  const displayName = lang === 'en' && p.nameEn ? p.nameEn : p.name

  const handleAdd = () => {
    addItem({ id: p.id, name: displayName, image: p.photos?.[0] ?? PLACEHOLDER_IMG, unitPrice: p.priceMXN ?? 0 })
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1600)
  }

  return (
    <div className="group rounded-2xl overflow-hidden flex flex-col border transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-[1.015] hover:border-[rgba(212,175,55,0.55)] hover:shadow-[0_16px_36px_rgba(212,175,55,0.22)]"
      style={{ background: '#FFFFFF', borderColor: 'rgba(212,175,55,0.18)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
      {p.photos && p.photos.length > 0 ? (
        <div className="overflow-hidden">
          <div className="transition-transform duration-500 ease-out group-hover:scale-[1.06]">
            <PhotoCarousel photos={p.photos} alt={displayName} zoom={p.zoom} />
          </div>
        </div>
      ) : (
        <div className="w-full aspect-[4/5] flex items-center justify-center flex-shrink-0"
          style={{ background: '#FFFFFF' }}>
          <BoxIcon />
        </div>
      )}
      <div className="p-4 flex flex-col flex-1">
        <span className="text-[0.6rem] font-black uppercase tracking-widest mb-1" style={{ color: 'rgba(212,175,55,0.8)' }}>
          {stockLabel}: {p.qty}
        </span>
        <p className="text-sm font-semibold leading-snug mb-3 overflow-hidden"
          style={{ color: '#0C0C0C', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', height: '2.6rem' }}>
          {displayName}
        </p>
        <div className="mt-auto flex flex-col gap-1.5">
          <Link to={`/products/${p.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wide px-3 py-1.5 rounded-full w-fit transition-all duration-200 hover:scale-[1.04]"
            style={{ color: '#0C0C0C', background: 'linear-gradient(135deg, #f0d060 0%, #fff4c4 50%, #D4AF37 100%)', boxShadow: '0 2px 8px rgba(212,175,55,0.35)' }}>
            <InfoIcon />{moreInfoLabel}
          </Link>
          {p.priceMXN ? (
            <span className="text-base font-black" style={{ color: '#0C0C0C' }}>{formatMXN(p.priceMXN)}</span>
          ) : (
            <span className="text-xs font-bold uppercase tracking-wide" style={{ color: 'rgba(12,12,12,0.4)' }}>{pendingPriceLabel}</span>
          )}
          <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-black uppercase tracking-wide px-2.5 py-1 rounded-full w-fit"
            style={{ color: '#2E7D32', background: 'rgba(46,125,50,0.12)' }}>
            <TruckIcon />{freeShippingLabel}
          </span>

          <button type="button" onClick={handleAdd}
            className="mt-1.5 flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-200 hover:scale-[1.02] cursor-pointer"
            style={justAdded
              ? { background: '#2E7D32', color: '#fff', border: '1.5px solid #2E7D32' }
              : { border: '1.5px solid #D4AF37', color: '#0C0C0C', background: 'linear-gradient(135deg, #2b1d00 0%, #4a3400 22%, #f0d060 45%, #fff8dc 55%, #c89800 68%, #2a1c00 85%, #2b1d00 100%)' }}>
            {justAdded ? (<><CheckIcon />{addedLabel}</>) : addLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}
    strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" />
  </svg>
)

export default function ProductsPage() {
  const { t, lang } = useLanguage()
  const p = t.productsPage
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const catBarRef = useRef<HTMLDivElement>(null)
  const [catBarH, setCatBarH] = useState(46)

  useEffect(() => {
    const el = catBarRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setCatBarH(el.offsetHeight))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node
      if (suggestionsRef.current?.contains(target)) return
      if (inputRef.current?.contains(target)) return
      setSearchFocused(false)
      inputRef.current?.blur()
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('touchstart', handler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('touchstart', handler)
    }
  }, [])

  const q = norm(search.trim())

  const productMatches = (prod: Product) => {
    if (!q) return true
    const displayName = lang === 'en' && prod.nameEn ? prod.nameEn : prod.name
    if (norm(displayName).includes(q)) return true
    return (prod.searchTags ?? []).some(tag => norm(tag).includes(q))
  }

  const mayoristaMatches = (item: typeof MAYORISTA_ITEMS[0]) => {
    if (!q) return false
    const displayName = lang === 'en' ? item.nameEn : item.name
    if (norm(displayName).includes(q)) return true
    return item.searchTags.some(tag => norm(tag).includes(q))
  }

  const filtered = PRODUCTS.filter(prod => {
    const matchesCat = activeCategory === 'all' || prod.category === activeCategory
    return matchesCat && productMatches(prod)
  })

  const filteredMayorista = q ? MAYORISTA_ITEMS.filter(mayoristaMatches) : []

  return (
    <div style={{ background: '#F5F5F5', minHeight: '100vh' }}>
      <NavBar />

      {/* ── Search bar ── */}
      <div className="fixed left-0 right-0 z-40 flex items-center px-3 sm:px-8 gap-2"
        style={{ top: 64, height: 52, background: '#FFFFFF', borderBottom: '1px solid #EBEBEB' }}>
        <div className="relative flex-1 max-w-2xl mx-auto">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: '#999' }}>
            <SearchIcon />
          </span>
          <input
            ref={inputRef}
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onClick={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder={lang === 'en' ? 'Search products…' : 'Buscar productos…'}
            className="w-full pl-9 pr-4 py-2 rounded-full text-sm outline-none"
            style={{
              background: '#F5F5F5',
              border: '1.5px solid #E0E0E0',
              color: '#0C0C0C',
              fontSize: '0.85rem',
            }}
          />
        </div>
      </div>

      {/* ── Search suggestions panel (AliExpress style) ── */}
      {searchFocused && !search.trim() && (
        <>
        <div className="fixed left-0 right-0 z-50 flex justify-center px-3 sm:px-6"
          style={{ top: 116, pointerEvents: 'none' }}>
          <div ref={suggestionsRef} className="w-full max-w-4xl flex overflow-hidden rounded-2xl"
            onMouseDown={e => e.preventDefault()}
            style={{ pointerEvents: 'auto', maxHeight: 'calc(100vh - 114px)', background: '#FFFFFF', boxShadow: '0 12px 40px rgba(0,0,0,0.2)', border: '1px solid rgba(212,175,55,0.15)' }}>

            {/* Left: category list */}
            <div className="flex-shrink-0 overflow-y-auto" style={{ width: 160, background: '#FAFAFA', borderRight: '1px solid #EFEFEF' }}>
              {[{ id: 'all', es: 'Todos', en: 'All', icon: '🏪' },
                { id: 'security',    es: 'Seguridad',     en: 'Security',     icon: '📹' },
                { id: 'lighting',    es: 'Iluminación',   en: 'Lighting',     icon: '💡' },
                { id: 'automotive',  es: 'Automotriz',    en: 'Automotive',   icon: '🔧' },
                { id: 'home',        es: 'Hogar',         en: 'Home',         icon: '🏠' },
                { id: 'clocks',      es: 'Relojes',       en: 'Clocks',       icon: '⏱' },
                { id: 'health',      es: 'Salud',         en: 'Health',       icon: '🌿' },
                { id: 'electronics', es: 'Electrónica',   en: 'Electronics',  icon: '📱' },
                { id: 'travel',      es: 'Viaje y Moda',  en: 'Travel',       icon: '✈️' },
              ].map(cat => (
                <button key={cat.id} type="button"
                  onClick={() => { setActiveCategory(cat.id); setSearchFocused(false); inputRef.current?.blur() }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-xs font-medium cursor-pointer transition-colors"
                  style={{
                    background: activeCategory === cat.id ? 'rgba(212,175,55,0.12)' : 'transparent',
                    color: activeCategory === cat.id ? '#8B6200' : '#333',
                    borderLeft: activeCategory === cat.id ? '3px solid #D4AF37' : '3px solid transparent',
                  }}>
                  <span style={{ fontSize: '1rem' }}>{cat.icon}</span>
                  <span>{lang === 'en' ? cat.en : cat.es}</span>
                </button>
              ))}
            </div>

            {/* Right: popular products */}
            <div className="flex-1 overflow-y-auto p-4">
              <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: 'rgba(212,175,55,0.85)' }}>
                {lang === 'en' ? 'Popular Products' : 'Productos Populares'}
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {PRODUCTS.slice(0, 15).map(prod => (
                  <button key={prod.id} type="button"
                    onClick={() => { setSearch(lang === 'en' && prod.nameEn ? prod.nameEn : prod.name); setSearchFocused(false) }}
                    className="flex flex-col items-center gap-1 p-2 rounded-xl border text-center cursor-pointer transition-all hover:border-[rgba(212,175,55,0.5)] hover:shadow-sm"
                    style={{ borderColor: 'rgba(212,175,55,0.15)', background: '#FAFAFA' }}>
                    {prod.photos?.[0] && (
                      <img src={prod.photos[0]} alt="" className="w-full aspect-square object-contain rounded-lg" />
                    )}
                    <span className="text-[9px] font-medium leading-tight" style={{ color: '#0C0C0C', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {lang === 'en' && prod.nameEn ? prod.nameEn : prod.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
        </>
      )}

      {/* ── Category tabs ── */}
      <div ref={catBarRef} className="fixed left-0 right-0 z-40 flex flex-wrap items-center gap-1.5 px-3 sm:px-8 py-2"
        style={{ top: 116, background: '#FFFFFF', borderBottom: '1px solid rgba(212,175,55,0.18)' }}>
        <button type="button" onClick={() => setActiveCategory('all')}
          className="px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wide transition-all duration-200 cursor-pointer whitespace-nowrap"
          style={activeCategory === 'all'
            ? { background: '#D4AF37', color: '#0C0C0C', border: '1.5px solid #D4AF37' }
            : { background: 'transparent', color: '#555', border: '1.5px solid #ddd' }}>
          {p.allProducts}
        </button>
        {CATEGORIES.map(cat => (
          <button key={cat.id} type="button" onClick={() => setActiveCategory(cat.id)}
            className="px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wide transition-all duration-200 cursor-pointer whitespace-nowrap"
            style={activeCategory === cat.id
              ? { background: '#D4AF37', color: '#0C0C0C', border: '1.5px solid #D4AF37' }
              : { background: 'transparent', color: '#555', border: '1.5px solid #ddd' }}>
            {lang === 'en' ? cat.en : cat.es}
          </button>
        ))}
      </div>

      <main style={{ paddingTop: `${116 + catBarH}px` }} className="pb-10">
<div className="px-2 sm:px-4 md:px-8">
        {filtered.length === 0 && filteredMayorista.length === 0 && q ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <SearchIcon />
            <p className="text-sm font-medium" style={{ color: '#999' }}>
              {lang === 'en' ? 'No products found' : 'No se encontraron productos'}
            </p>
          </div>
        ) : (
          <>
            {filtered.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 max-w-7xl mx-auto">
                {filtered.map((prod) => (
                  <ProductCard key={prod.id} p={prod} addLabel={p.addToCart} addedLabel={p.added} pendingPriceLabel={p.pendingPrice} stockLabel={p.stockLabel} freeShippingLabel={p.freeShipping} moreInfoLabel={p.moreInfo} lang={lang} />
                ))}
              </div>
            )}
            {filteredMayorista.length > 0 && (
              <div className="max-w-7xl mx-auto mt-6">
                <p className="text-xs font-black uppercase tracking-widest mb-3 px-1" style={{ color: 'rgba(212,175,55,0.7)' }}>
                  {lang === 'en' ? 'Also available in Wholesale' : 'También disponible en Mayorista'}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                  {filteredMayorista.map(item => (
                    <Link key={item.id} to="/exports"
                      className="rounded-2xl flex flex-col overflow-hidden border transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(212,175,55,0.2)] cursor-pointer"
                      style={{ background: '#FFFFFF', borderColor: 'rgba(212,175,55,0.3)' }}>
                      <div className="w-full aspect-[4/3] overflow-hidden flex items-center justify-center" style={{ background: '#F5F5F5' }}>
                        {item.photo
                          ? <img src={item.photo} alt={item.name} className="w-full h-full object-cover" />
                          : <span className="text-4xl">📦</span>}
                      </div>
                      <div className="p-3 flex flex-col gap-2">
                        <p className="text-sm font-bold leading-snug" style={{ color: '#0C0C0C' }}>
                          {lang === 'en' ? item.nameEn : item.name}
                        </p>
                        <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full w-fit"
                          style={{ background: 'linear-gradient(135deg, #f0d060, #D4AF37)', color: '#0C0C0C' }}>
                          {lang === 'en' ? 'View Wholesale →' : 'Ver Mayorista →'}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
        </div>
      </main>
      <ContactFooter />
    </div>
  )
}
