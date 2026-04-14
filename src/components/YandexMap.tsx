import { useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'

// Yandex Maps JS API 2.1 type declarations
declare global {
  interface Window {
    ymaps: any
  }
}

interface YandexMapProps {
  /** Pharmacy location — shown as a fixed blue marker */
  pharmacyCoords?: [number, number] // [lat, lng]
  /** Initial customer location (if already set) */
  customerCoords?: [number, number]
  /** Called when user clicks the map — returns [lat, lng] and resolved address */
  onLocationSelect?: (coords: [number, number], address: string) => void
  /** Read-only mode: no click handler, just show route */
  readOnly?: boolean
  height?: string
}

const MAPS_KEY = import.meta.env.VITE_YANDEX_MAPS_KEY as string
const SUGGEST_KEY = import.meta.env.VITE_YANDEX_SUGGEST_KEY as string

let scriptLoadPromise: Promise<void> | null = null

function loadYandexMapsScript(): Promise<void> {
  if (scriptLoadPromise) return scriptLoadPromise
  if (window.ymaps) return Promise.resolve()

  scriptLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${MAPS_KEY}&suggest_apikey=${SUGGEST_KEY}&lang=ru_RU`
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Yandex Maps'))
    document.head.appendChild(script)
  })

  return scriptLoadPromise
}

export function YandexMap({
  pharmacyCoords,
  customerCoords,
  onLocationSelect,
  readOnly = false,
  height = '280px',
}: YandexMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const customerMarkerRef = useRef<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // Default center: Tashkent
  const defaultCenter: [number, number] = pharmacyCoords ?? [41.2995, 69.2401]

  useEffect(() => {
    let cancelled = false

    loadYandexMapsScript()
      .then(() => {
        if (cancelled || !containerRef.current) return

        window.ymaps.ready(() => {
          if (cancelled || !containerRef.current) return

          const map = new window.ymaps.Map(containerRef.current, {
            center: defaultCenter,
            zoom: 14,
            controls: ['zoomControl', 'geolocationControl'],
          })
          mapRef.current = map

          // Pharmacy marker (blue)
          if (pharmacyCoords) {
            const pharmacyMark = new window.ymaps.Placemark(
              pharmacyCoords,
              { balloonContent: 'Аптека', hintContent: 'Аптека' },
              {
                preset: 'islands#blueMedicalIcon',
                draggable: false,
              },
            )
            map.geoObjects.add(pharmacyMark)
          }

          // Customer marker (if already set)
          if (customerCoords) {
            const mark = new window.ymaps.Placemark(
              customerCoords,
              { balloonContent: 'Адрес доставки' },
              { preset: 'islands#redDotIcon', draggable: false },
            )
            map.geoObjects.add(mark)
            customerMarkerRef.current = mark

            // Draw route if both coords exist
            if (pharmacyCoords) {
              drawRoute(map, pharmacyCoords, customerCoords)
            }
          }

          // Click handler for location selection
          if (!readOnly && onLocationSelect) {
            map.events.add('click', async (e: any) => {
              const coords: [number, number] = e.get('coords')

              // Remove previous customer marker
              if (customerMarkerRef.current) {
                map.geoObjects.remove(customerMarkerRef.current)
              }

              // Add new marker
              const mark = new window.ymaps.Placemark(
                coords,
                { balloonContent: 'Адрес доставки' },
                { preset: 'islands#redDotIcon' },
              )
              map.geoObjects.add(mark)
              customerMarkerRef.current = mark

              // Reverse geocode
              let address = `${coords[0].toFixed(5)}, ${coords[1].toFixed(5)}`
              try {
                const res = await window.ymaps.geocode(coords, { results: 1 })
                const first = res.geoObjects.get(0)
                if (first) {
                  address = first.getAddressLine()
                }
              } catch (_) {
                // fallback to coordinates string
              }

              onLocationSelect(coords, address)
            })
          }

          setLoading(false)
        })
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })

    return () => {
      cancelled = true
      if (mapRef.current) {
        mapRef.current.destroy()
        mapRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="relative rounded-lg overflow-hidden border border-gray-200" style={{ height }}>
      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
          <p className="text-sm text-gray-500">Карта недоступна</p>
        </div>
      )}
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  )
}

function drawRoute(map: any, from: [number, number], to: [number, number]) {
  window.ymaps.route([from, to], { routingMode: 'auto' }).then((route: any) => {
    route.getPaths().each((path: any) => {
      path.getSegments().each((segment: any) => {
        segment.options.set({ strokeColor: '#3B82F6', strokeWidth: 4 })
      })
    })
    map.geoObjects.add(route)
  })
}
