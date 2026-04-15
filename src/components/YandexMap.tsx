import { useEffect, useRef, useState } from 'react'
import { Loader2, Search } from 'lucide-react'

declare global {
  interface Window {
    ymaps: any
  }
}

interface YandexMapProps {
  /** Pharmacy / initial marker coords [lat, lng] */
  pharmacyCoords?: [number, number]
  /** Customer marker coords (read-only route mode) */
  customerCoords?: [number, number]
  /** Called when user clicks the map — returns [lat, lng] + resolved address */
  onLocationSelect?: (coords: [number, number], address: string) => void
  /** Controlled coords: when this changes externally, map moves the marker there */
  controlledCoords?: [number, number]
  /** Show search bar above the map */
  showSearch?: boolean
  /** Read-only: no click, just show route */
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
  controlledCoords,
  showSearch = false,
  readOnly = false,
  height = '280px',
}: YandexMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const suggestViewRef = useRef<any>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [searchValue, setSearchValue] = useState('')

  const defaultCenter: [number, number] = pharmacyCoords ?? controlledCoords ?? [41.2995, 69.2401]

  // Place or move a marker on the map
  function placeMarker(map: any, coords: [number, number], preset = 'islands#redDotIcon') {
    if (markerRef.current) {
      map.geoObjects.remove(markerRef.current)
    }
    const mark = new window.ymaps.Placemark(coords, {}, { preset })
    map.geoObjects.add(mark)
    markerRef.current = mark
    map.setCenter(coords, 15)
  }

  // Reverse geocode coords → address string
  async function reverseGeocode(coords: [number, number]): Promise<string> {
    try {
      const res = await window.ymaps.geocode(coords, { results: 1 })
      const first = res.geoObjects.get(0)
      return first ? first.getAddressLine() : `${coords[0].toFixed(5)}, ${coords[1].toFixed(5)}`
    } catch {
      return `${coords[0].toFixed(5)}, ${coords[1].toFixed(5)}`
    }
  }

  // Forward geocode search query → coords
  async function geocodeAddress(query: string): Promise<[number, number] | null> {
    try {
      const res = await window.ymaps.geocode(query, { results: 1 })
      const first = res.geoObjects.get(0)
      if (!first) return null
      const c = first.geometry.getCoordinates()
      return [c[0], c[1]]
    } catch {
      return null
    }
  }

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

          // Pharmacy marker (blue) — fixed
          if (pharmacyCoords) {
            const pm = new window.ymaps.Placemark(
              pharmacyCoords,
              { hintContent: 'Аптека' },
              { preset: 'islands#blueMedicalIcon' },
            )
            map.geoObjects.add(pm)
          }

          // Customer marker (read-only route)
          if (customerCoords) {
            placeMarker(map, customerCoords, 'islands#redDotIcon')
            if (pharmacyCoords) drawRoute(map, pharmacyCoords, customerCoords)
          }

          // Initial controlled coords marker
          if (controlledCoords) {
            placeMarker(map, controlledCoords, 'islands#redDotIcon')
          }

          // Click to select location
          if (!readOnly && onLocationSelect) {
            map.events.add('click', async (e: any) => {
              const coords: [number, number] = e.get('coords')
              placeMarker(map, coords)
              const address = await reverseGeocode(coords)
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
        markerRef.current = null
        suggestViewRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // When controlledCoords changes externally (user typed lat/lng) — move marker
  useEffect(() => {
    if (!controlledCoords || !mapRef.current || loading) return
    placeMarker(mapRef.current, controlledCoords)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controlledCoords?.[0], controlledCoords?.[1]])

  // Suggest handler
  const handleSearchChange = async (val: string) => {
    setSearchValue(val)
    if (!val.trim() || !window.ymaps?.suggest) {
      setSuggestions([])
      return
    }
    try {
      const result = await window.ymaps.suggest(val)
      setSuggestions(result.slice(0, 5).map((r: any) => r.displayName))
    } catch {
      setSuggestions([])
    }
  }

  const handleSuggestionSelect = async (suggestion: string) => {
    setSearchValue(suggestion)
    setSuggestions([])
    if (!mapRef.current) return
    const coords = await geocodeAddress(suggestion)
    if (!coords) return
    placeMarker(mapRef.current, coords)
    const address = await reverseGeocode(coords)
    onLocationSelect?.(coords, address)
  }

  return (
    <div className="flex flex-col gap-1">
      {/* Search bar */}
      {showSearch && (
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Поиск адреса..."
              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {suggestions.length > 0 && (
            <ul className="absolute z-50 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto">
              {suggestions.map((s, i) => (
                <li
                  key={i}
                  onClick={() => handleSuggestionSelect(s)}
                  className="px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 border-b last:border-b-0"
                >
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Map container */}
      <div
        className="relative rounded-lg overflow-hidden border border-gray-200"
        style={{ height }}
      >
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
