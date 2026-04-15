import { useEffect, useRef, useState, useCallback } from 'react'
import { ArrowLeft, Search, Navigation, X } from 'lucide-react'

declare global {
  interface Window { ymaps: any }
}

const MAPS_KEY = import.meta.env.VITE_YANDEX_MAPS_KEY as string
const SUGGEST_KEY = import.meta.env.VITE_YANDEX_SUGGEST_KEY as string

// Tashkent bounding box [SW, NE]
const TASHKENT_BOUNDS: [[number, number], [number, number]] = [
  [41.17, 69.09],
  [41.42, 69.47],
]
const TASHKENT_CENTER: [number, number] = [41.2995, 69.2401]

let _mapsPromise: Promise<void> | null = null

function waitForYmaps(timeoutMs = 8000): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.ymaps) { resolve(); return }
    const start = Date.now()
    const iv = setInterval(() => {
      if (window.ymaps) { clearInterval(iv); resolve() }
      else if (Date.now() - start > timeoutMs) { clearInterval(iv); reject(new Error('ymaps timeout')) }
    }, 50)
  })
}

function loadMaps(): Promise<void> {
  if (_mapsPromise) return _mapsPromise
  if (window.ymaps) { _mapsPromise = Promise.resolve(); return _mapsPromise }
  const existing = document.querySelector('script[src*="api-maps.yandex.ru"]')
  if (existing) {
    _mapsPromise = waitForYmaps()
    return _mapsPromise
  }
  _mapsPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = `https://api-maps.yandex.ru/2.1/?apikey=${MAPS_KEY}&suggest_apikey=${SUGGEST_KEY}&lang=ru_RU`
    s.async = true
    s.onload = () => waitForYmaps().then(resolve).catch(reject)
    s.onerror = () => { _mapsPromise = null; reject(new Error('Failed to load Yandex Maps')) }
    document.head.appendChild(s)
  })
  return _mapsPromise
}

export interface CustomerMapProps {
  initialCenter?: [number, number]
  onConfirm: (coords: [number, number], address: string) => void
}

export function CustomerMap({ initialCenter, onConfirm }: CustomerMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [ready, setReady] = useState(false)
  const [mapError, setMapError] = useState(false)
  const [address, setAddress] = useState('')
  const [coords, setCoords] = useState<[number, number]>(initialCenter ?? TASHKENT_CENTER)
  const [geocoding, setGeocoding] = useState(false)
  const [searchMode, setSearchMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [gpsLoading, setGpsLoading] = useState(false)

  const geocode = useCallback(async (c: [number, number]) => {
    if (!window.ymaps) return
    setGeocoding(true)
    try {
      const res = await window.ymaps.geocode(c, {
        results: 1,
        boundedBy: TASHKENT_BOUNDS,
      })
      const obj = res.geoObjects.get(0)
      if (obj) setAddress(obj.getAddressLine())
    } catch { /* ignore */ } finally { setGeocoding(false) }
  }, [])

  useEffect(() => {
    let cancelled = false
    loadMaps().then(() => {
      if (cancelled || !containerRef.current) return
      window.ymaps.ready(() => {
        if (cancelled || !containerRef.current) return
        try {
          const map = new window.ymaps.Map(
            containerRef.current,
            // state
            { center: coords, zoom: 13, controls: [] },
            // options — suppress all extra UI
            {
              suppressMapOpenBlock: true,
              suppressObsoleteBrowserNotifier: true,
              restrictMapArea: TASHKENT_BOUNDS,
            },
          )
          mapRef.current = map

          // Geocode initial center
          geocode(coords)

          // After user action ends → geocode new center
          map.events.add('actionend', () => {
            const c = map.getCenter() as [number, number]
            setCoords(c)
            if (debounceRef.current) clearTimeout(debounceRef.current)
            debounceRef.current = setTimeout(() => geocode(c), 300)
          })

          setReady(true)
        } catch (err) {
          console.error('Map init error:', err)
          if (!cancelled) setMapError(true)
        }
      })
    }).catch((err) => {
      console.error('Map load error:', err)
      if (!cancelled) setMapError(true)
    })

    return () => {
      cancelled = true
      if (debounceRef.current) clearTimeout(debounceRef.current)
      mapRef.current?.destroy()
      mapRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleGps = () => {
    if (!navigator.geolocation || !mapRef.current) return
    setGpsLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c: [number, number] = [pos.coords.latitude, pos.coords.longitude]
        mapRef.current.setCenter(c, 16)
        setCoords(c)
        geocode(c)
        setGpsLoading(false)
      },
      () => setGpsLoading(false),
      { timeout: 10000 },
    )
  }

  const handleSearchChange = async (val: string) => {
    setSearchQuery(val)
    if (!val.trim() || !window.ymaps) { setSuggestions([]); return }
    try {
      const res = await window.ymaps.suggest(val, {
        results: 5,
        boundedBy: TASHKENT_BOUNDS,
        strictBounds: true,
      })
      setSuggestions(res.map((r: any) => r.value))
    } catch { setSuggestions([]) }
  }

  const handleSuggestionSelect = async (s: string) => {
    setSearchMode(false)
    setSearchQuery('')
    setSuggestions([])
    if (!window.ymaps) return
    try {
      const res = await window.ymaps.geocode(s, {
        results: 1,
        boundedBy: TASHKENT_BOUNDS,
        strictBounds: true,
      })
      const obj = res.geoObjects.get(0)
      if (obj) {
        const c = obj.geometry.getCoordinates() as [number, number]
        mapRef.current?.setCenter(c, 16)
        setCoords(c)
        setAddress(obj.getAddressLine())
      }
    } catch { /* ignore */ }
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Map canvas */}
      <div ref={containerRef} className="absolute inset-0" />

      {/* Loading overlay */}
      {!ready && !mapError && (
        <div className="absolute inset-0 z-50 bg-gray-100 flex items-center justify-center">
          <div className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Error overlay */}
      {mapError && (
        <div className="absolute inset-0 z-50 bg-gray-100 flex items-center justify-center px-6">
          <div className="text-center space-y-4">
            <div className="text-4xl">🗺️</div>
            <p className="text-sm font-medium text-gray-700">Не удалось загрузить карту</p>
            <p className="text-xs text-gray-400">Проверьте подключение к интернету и попробуйте снова</p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2 bg-blue-500 text-white text-sm font-medium rounded-xl hover:bg-blue-600 active:scale-95 transition"
            >
              Обновить страницу
            </button>
          </div>
        </div>
      )}

      {/* ── Address bar (normal mode) ── */}
      {ready && !searchMode && (
        <div className="absolute top-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-sm px-4 pt-3 pb-2.5 shadow-sm pointer-events-none">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">
            Адрес доставки
          </p>
          <p className={`text-sm font-semibold leading-snug ${geocoding ? 'text-gray-400' : 'text-gray-900'}`}>
            {geocoding ? 'Определяем адрес...' : address || 'Перетащите карту, чтобы выбрать точку'}
          </p>
        </div>
      )}

      {/* ── Search mode bar ── */}
      {ready && searchMode && (
        <div className="absolute top-0 left-0 right-0 z-30 bg-white shadow-lg">
          <div className="flex items-center gap-2 px-3 py-2 border-b">
            {/* Back closes search */}
            <button
              onClick={() => { setSearchMode(false); setSearchQuery(''); setSuggestions([]) }}
              className="p-1.5 rounded-full hover:bg-gray-100 shrink-0"
            >
              <ArrowLeft className="h-5 w-5 text-gray-700" />
            </button>
            <input
              autoFocus
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Поиск по Ташкенту..."
              className="flex-1 py-1.5 text-sm focus:outline-none"
            />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(''); setSuggestions([]) }}>
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
          </div>
          {suggestions.length > 0 && (
            <ul className="bg-white divide-y divide-gray-100 max-h-[50vh] overflow-y-auto">
              {suggestions.map((s, i) => (
                <li
                  key={i}
                  onClick={() => handleSuggestionSelect(s)}
                  className="px-4 py-3 text-sm cursor-pointer hover:bg-gray-50 active:bg-gray-100"
                >
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* ── Center pin ── */}
      {ready && !searchMode && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div style={{ transform: 'translateY(-28px)' }}>
            <svg width="36" height="48" viewBox="0 0 36 48" fill="none">
              <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 30 18 30S36 31.5 36 18C36 8.06 27.94 0 18 0z" fill="#2563EB"/>
              <circle cx="18" cy="18" r="8" fill="white"/>
              <circle cx="18" cy="18" r="4.5" fill="#2563EB"/>
            </svg>
            <div className="w-2 h-1 bg-black/20 rounded-full mx-auto -mt-0.5 blur-[1px]" />
          </div>
        </div>
      )}

      {/* ── Bottom controls (normal mode only) ── */}
      {ready && !searchMode && (
        <div className="absolute bottom-0 left-0 right-0 z-20">
          {/* Search + GPS buttons — right side only, no back button */}
          <div className="flex justify-end px-4 mb-3">
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setSearchMode(true)}
                className="w-11 h-11 bg-white rounded-full shadow-md flex items-center justify-center active:scale-95 transition-transform"
              >
                <Search className="h-5 w-5 text-gray-700" />
              </button>
              <button
                onClick={handleGps}
                disabled={gpsLoading}
                className="w-11 h-11 bg-white rounded-full shadow-md flex items-center justify-center active:scale-95 transition-transform disabled:opacity-50"
              >
                <Navigation className={`h-5 w-5 ${gpsLoading ? 'text-blue-500 animate-pulse' : 'text-gray-700'}`} />
              </button>
            </div>
          </div>

          {/* Confirm button — covers Yandex attribution */}
          <div className="px-4 pb-8 bg-white/80 backdrop-blur-sm pt-2">
            <button
              onClick={() => onConfirm(coords, address)}
              disabled={!address || geocoding}
              className="w-full py-4 bg-teal-500 hover:bg-teal-600 active:bg-teal-700 disabled:bg-gray-300 disabled:text-gray-500 text-white font-semibold rounded-2xl text-base transition-colors shadow-lg"
            >
              Выбрать адрес
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
