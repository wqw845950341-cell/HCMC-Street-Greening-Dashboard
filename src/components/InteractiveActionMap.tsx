import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import BeforeAfterViewer from './BeforeAfterViewer';

const CATEGORY_COLORS: Record<string, string> = {
  "Class A": "#1a9641", "Class B": "#a6d96a", "Class C": "#ffffbf", "Class D": "#fdae61", "Class E": "#d7191c",
  "AB-1 (Heritage Canopy)": "#005a32", "AB-2 (Vertical Oasis)": "#238b45", "AB-3 (Ecological Stitching)": "#41ab5d", "AB-4 (Open Edge)": "#74c476", "AB-5 (Shaded Setback)": "#a1d99b",
  "E-1 (Exposed Desert)": "#cb181d", "E-2 (Deep Canyon)": "#8a0829", "E-3 (Gray Fabric)": "#525252", "E-4 (Cosmetic Green)": "#fb6a4a", "E-5 (Abandoned Space)": "#a50f15"
};

const MACRO_GRADES = ["Class A", "Class B", "Class C", "Class D", "Class E"];
const SUCCESS_TYPOLOGIES = ["AB-1 (Heritage Canopy)", "AB-2 (Vertical Oasis)", "AB-3 (Ecological Stitching)", "AB-4 (Open Edge)", "AB-5 (Shaded Setback)"];
const CRISIS_TYPOLOGIES = ["E-1 (Exposed Desert)", "E-2 (Deep Canyon)", "E-3 (Gray Fabric)", "E-4 (Cosmetic Green)", "E-5 (Abandoned Space)"];

const GITHUB_RAW_BASE = "https://raw.githubusercontent.com/wqw845950341-cell/street/main/";

// 15 Special Panorama Locations
const SPECIAL_PANORAMAS = [
  { id: 'E1-1', lat: 10.789139, lng: 106.690167, type: 'E-1 (Exposed Desert)' },
  { id: 'E1-2', lat: 10.772000, lng: 106.697000, type: 'E-1 (Exposed Desert)' },
  { id: 'E1-3', lat: 10.777139, lng: 106.704444, type: 'E-1 (Exposed Desert)' },
  { id: 'E2-1', lat: 10.761472, lng: 106.706750, type: 'E-2 (Deep Canyon)' },
  { id: 'E2-2', lat: 10.763917, lng: 106.707722, type: 'E-2 (Deep Canyon)' },
  { id: 'E2-3', lat: 10.760889, lng: 106.707472, type: 'E-2 (Deep Canyon)' },
  { id: 'E3-1', lat: 10.739750, lng: 106.726528, type: 'E-3 (Gray Fabric)' },
  { id: 'E3-2', lat: 10.728944, lng: 106.732722, type: 'E-3 (Gray Fabric)' },
  { id: 'E3-3', lat: 10.739751, lng: 106.726529, type: 'E-3 (Gray Fabric)' }, // Slight offset
  { id: 'E4-1', lat: 10.746722, lng: 106.700722, type: 'E-4 (Cosmetic Green)' },
  { id: 'E4-2', lat: 10.742215, lng: 106.709207, type: 'E-4 (Cosmetic Green)' },
  { id: 'E4-3', lat: 10.745583, lng: 106.709389, type: 'E-4 (Cosmetic Green)' },
  { id: 'E5-1', lat: 10.736049, lng: 106.735498, type: 'E-5 (Abandoned Space)' },
  { id: 'E5-2', lat: 10.751611, lng: 106.731889, type: 'E-5 (Abandoned Space)' },
  { id: 'E5-3', lat: 10.732777, lng: 106.732489, type: 'E-5 (Abandoned Space)' },
];

const pinIcon = L.divIcon({
  html: '<div style="font-size: 26px; transform: translate(-10%, -60%); filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">📍</div>',
  className: 'custom-pin-marker',
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

// Helper to construct panorama URL based on the repository structure:
// Before files: 改造前<ID>.jpg
// After files: 修改后<ID>.jpg
const getPanoramaUrl = (id: string, suffix: 'before' | 'after') => {
  const isE2E3 = id.startsWith('E2-') || id.startsWith('E3-');
  const prefix = suffix === 'before' ? '改造前' : (isE2E3 ? '修改后' : '改造后');
  
  // Return the constructed URL
  // The encodeURIComponent ensures the Chinese characters are properly handled
  return `${GITHUB_RAW_BASE}${encodeURIComponent(prefix)}${id}.jpg`;
};

// Custom Marker Class for Canvas Shapes
const ShapeMarker = (L.CircleMarker as any).extend({
  _updatePath: function() {
    const renderer = this._renderer;
    if (!renderer || !renderer._ctx) return;
    const ctx = renderer._ctx;
    const p = this._point;
    const r = Math.max(Math.round(this._radius), 1);
    const shape = this.options.shape || 'circle';

    if (this._empty()) { return; }

    ctx.beginPath();

    if (shape === 'circle') {
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2, false);
    } else if (shape === 'diamond') {
      ctx.moveTo(p.x, p.y - r);
      ctx.lineTo(p.x + r, p.y);
      ctx.lineTo(p.x, p.y + r);
      ctx.lineTo(p.x - r, p.y);
      ctx.closePath();
    } else if (shape === 'square') {
      ctx.rect(p.x - r, p.y - r, r * 2, r * 2);
    }

    renderer._fillStroke(ctx, this);
  }
});

export default function InteractiveActionMap() {
  const [geoData, setGeoData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Hierarchical state
  const [selectedGrades, setSelectedGrades] = useState<string[]>(MACRO_GRADES);
  const [selectedSubtypes, setSelectedSubtypes] = useState<string[]>([...SUCCESS_TYPOLOGIES, ...CRISIS_TYPOLOGIES]);

  const [activePanorama, setActivePanorama] = useState<{title: string, before: string, after: string} | null>(null);

  useEffect(() => {
    fetch('/HCMC_Dashboard_Data.json')
      .then(res => res.json())
      .then(data => {
        setGeoData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load map data:", err);
        setLoading(false);
      });
  }, []);

  const toggleGrade = (grade: string) => {
    setSelectedGrades(prev => {
      const isCurrentlySelected = prev.includes(grade);
      const next = isCurrentlySelected ? prev.filter(g => g !== grade) : [...prev, grade];
      
      // Cascading logic: If parent is unchecked, uncheck children
      if (isCurrentlySelected) {
        if (grade === "Class E") {
          setSelectedSubtypes(subs => subs.filter(s => !CRISIS_TYPOLOGIES.includes(s)));
        }
        if (grade === "Class A" || grade === "Class B") {
          const isAActive = next.includes("Class A");
          const isBActive = next.includes("Class B");
          if (!isAActive && !isBActive) {
            setSelectedSubtypes(subs => subs.filter(s => !SUCCESS_TYPOLOGIES.includes(s)));
          }
        }
      }
      // Note: Checking parent does NOT auto-check children (valid state: parent checked, children unchecked)
      
      return next;
    });
  };

  const toggleSubtype = (sub: string) => {
    setSelectedSubtypes(prev => 
      prev.includes(sub) ? prev.filter(s => s !== sub) : [...prev, sub]
    );
  };

  const filteredData = useMemo(() => {
    if (!geoData) return null;
    return {
      ...geoData,
      features: geoData.features.filter((f: any) => 
        selectedGrades.includes(f.properties.Grade)
      )
    };
  }, [geoData, selectedGrades]);

  const pointToLayer = (feature: any, latlng: L.LatLng) => {
    const p = feature.properties;
    const type = p.Type;
    const grade = p.Grade;
    
    // Visibility is controlled by Grade (handled in filteredData)
    // Styling logic: Highlight if subtype is checked
    const isHighlighted = type && selectedSubtypes.includes(type);

    const color = isHighlighted ? CATEGORY_COLORS[type] : (CATEGORY_COLORS[grade] || "#cccccc");
    
    let shape = 'square';
    if (isHighlighted) {
      if (type.startsWith("AB-")) {
        shape = 'circle';
      } else if (type.startsWith("E-")) {
        shape = 'diamond';
      }
    }

    return new (ShapeMarker as any)(latlng, {
      radius: 4,
      weight: 0.5,
      color: "#fff",
      fillOpacity: 0.9,
      fillColor: color,
      shape: shape
    });
  };

  const onEachFeature = (feature: any, layer: any) => {
    const p = feature.properties;
    const isSpecial = p.Type && (p.Type.startsWith('E-') || p.Type.startsWith('AB-'));

    layer.bindTooltip(`
      <div style="font-family: sans-serif; padding: 4px; font-size: 12px;">
        <strong>Grade:</strong> ${p.Grade}<br/>
        <strong>Type:</strong> ${p.Type || 'N/A'}
        ${isSpecial ? '<br/><span style="color: #2563eb; font-weight: bold;">👉 Click to view Intervention</span>' : ''}
      </div>
    `, { sticky: true });

    layer.on({
      click: () => {
        if (isSpecial) {
          const typeCode = p.Type.split(' ')[0];
          const before = getPanoramaUrl(typeCode, 'before');
          const after = getPanoramaUrl(typeCode, 'after');
          
          console.log(`Loading panorama for ${typeCode}:`, { before, after });
          
          setActivePanorama({
            title: `Intervention: ${p.Type}`,
            before,
            after
          });
        }
      }
    });
  };

  const isABDisabled = !(selectedGrades.includes("Class A") || selectedGrades.includes("Class B"));
  const isEDisabled = !selectedGrades.includes("Class E");

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%', fontFamily: 'Arial, sans-serif' }}>
      {/* Sidebar */}
      <div style={{ width: '380px', backgroundColor: '#f8fafc', padding: '25px', borderRight: '1px solid #e2e8f0', overflowY: 'auto', zIndex: 1000 }}>
        <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#0f172a', marginBottom: '4px' }}>🌿 Action Map</h2>
        <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '25px' }}>HCMC Urban Strategy Dashboard</p>

        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 'bold', borderBottom: '1px solid #cbd5e1', paddingBottom: '6px', marginBottom: '12px' }}>📍 Macro Grade Level</h3>
          
          {/* Class A & B Group */}
          <div style={{ marginBottom: '15px' }}>
            {["Class A", "Class B"].map(g => (
              <label key={g} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', cursor: 'pointer', fontSize: '14px' }}>
                <input type="checkbox" checked={selectedGrades.includes(g)} onChange={() => toggleGrade(g)} style={{ marginRight: '10px' }} />
                <span style={{ width: '12px', height: '12px', backgroundColor: CATEGORY_COLORS[g], marginRight: '10px', border: '1px solid #fff' }}></span>
                {g}
              </label>
            ))}
            <div style={{ paddingLeft: '25px', marginTop: '10px', opacity: isABDisabled ? 0.5 : 1, pointerEvents: isABDisabled ? 'none' : 'auto' }}>
              <p style={{ fontSize: '10px', fontWeight: 'bold', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Success Typologies</p>
              {SUCCESS_TYPOLOGIES.map(t => (
                <label key={t} style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', fontSize: '12px', cursor: isABDisabled ? 'default' : 'pointer' }}>
                  <input type="checkbox" checked={selectedSubtypes.includes(t)} onChange={() => toggleSubtype(t)} disabled={isABDisabled} style={{ marginRight: '10px' }} />
                  <span style={{ width: '10px', height: '10px', backgroundColor: CATEGORY_COLORS[t], borderRadius: '50%', marginRight: '10px', border: '1px solid #fff' }}></span>
                  {t}
                </label>
              ))}
            </div>
          </div>

          {/* Class C & D */}
          {["Class C", "Class D"].map(g => (
            <label key={g} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', cursor: 'pointer', fontSize: '14px' }}>
              <input type="checkbox" checked={selectedGrades.includes(g)} onChange={() => toggleGrade(g)} style={{ marginRight: '10px' }} />
              <span style={{ width: '12px', height: '12px', backgroundColor: CATEGORY_COLORS[g], marginRight: '10px', border: '1px solid #fff' }}></span>
              {g}
            </label>
          ))}

          {/* Class E Group */}
          <div style={{ marginTop: '15px' }}>
            <label style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', cursor: 'pointer', fontSize: '14px' }}>
              <input type="checkbox" checked={selectedGrades.includes("Class E")} onChange={() => toggleGrade("Class E")} style={{ marginRight: '10px' }} />
              <span style={{ width: '12px', height: '12px', backgroundColor: CATEGORY_COLORS["Class E"], marginRight: '10px', border: '1px solid #fff' }}></span>
              Class E
            </label>
            <div style={{ paddingLeft: '25px', marginTop: '10px', opacity: isEDisabled ? 0.5 : 1, pointerEvents: isEDisabled ? 'none' : 'auto' }}>
              <p style={{ fontSize: '10px', fontWeight: 'bold', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Crisis Typologies</p>
              {CRISIS_TYPOLOGIES.map(t => (
                <label key={t} style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', fontSize: '12px', cursor: isEDisabled ? 'default' : 'pointer' }}>
                  <input type="checkbox" checked={selectedSubtypes.includes(t)} onChange={() => toggleSubtype(t)} disabled={isEDisabled} style={{ marginRight: '10px' }} />
                  <span style={{ 
                    display: 'inline-block',
                    width: '8px', 
                    height: '8px', 
                    backgroundColor: CATEGORY_COLORS[t], 
                    marginRight: '10px', 
                    border: '1px solid #fff',
                    transform: 'rotate(45deg)'
                  }}></span>
                  {t}
                </label>
              ))}
            </div>
          </div>

          {/* Panorama Legend */}
          <div style={{ marginTop: '25px', padding: '12px', backgroundColor: '#f1f5f9', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
             <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#334155', marginBottom: '8px' }}>📸 Panorama Insights</p>
             <div style={{ display: 'flex', alignItems: 'center', fontSize: '12px', color: '#475569' }}>
                <span style={{ fontSize: '18px', marginRight: '8px' }}>📍</span>
                Interactive 360° Comparison
             </div>
          </div>
        </div>
      </div>

      {/* Map Area */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#e5e7eb' }}>
        {loading ? (
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#4b5563', zIndex: 10 }}>
            正在加载海量数据...
          </div>
        ) : (
          <MapContainer 
            center={[10.7769, 106.7009]} 
            zoom={13} 
            style={{ height: '100%', width: '100%', zIndex: 0 }}
            preferCanvas={true}
          >
            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
            {filteredData && (
              <GeoJSON 
                key={`${selectedGrades.join(',')}-${selectedSubtypes.join(',')}`} 
                data={filteredData as any} 
                pointToLayer={pointToLayer}
                onEachFeature={onEachFeature}
              />
            )}

            {/* Render Special Panorama Markers */}
            {SPECIAL_PANORAMAS.map(point => (
              <Marker 
                key={point.id} 
                position={[point.lat, point.lng]} 
                icon={pinIcon}
                eventHandlers={{
                  click: () => {
                    const before = getPanoramaUrl(point.id, 'before');
                    const after = getPanoramaUrl(point.id, 'after');
                    setActivePanorama({
                      title: `Intervention: ${point.id} (${point.type})`,
                      before,
                      after
                    });
                  }
                }}
              >
                <Tooltip direction="top" offset={[0, -20]}>
                  <div style={{ fontVariant: 'small-caps', fontWeight: 'bold', textAlign: 'center' }}>
                    360° View Point<br/>
                    <span style={{ color: '#2563eb' }}>{point.id}</span>
                  </div>
                </Tooltip>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>

      {activePanorama && (
        <BeforeAfterViewer 
          title={activePanorama.title}
          beforeImg={activePanorama.before}
          afterImg={activePanorama.after}
          onClose={() => setActivePanorama(null)}
        />
      )}
    </div>
  );
}
