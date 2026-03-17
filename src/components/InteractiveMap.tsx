import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// 🌟 导入你刚刚新建的全景组件
import BeforeAfterViewer from './BeforeAfterViewer'; 

// 🚀 导入三个核心数据源
import scoreMapData from '../data/score_map.json';      
import eDiagnosticData from '../data/data_e_only.json'; 
import abSuccessData from '../data/data_ab_only.json';  

// 🚀 外部资源配置
const GITHUB_RAW_BASE = "https://raw.githubusercontent.com/wqw845950341-cell/street/main/";

const AB_DESC: Record<string, string> = {
  "AB1": "Heritage Giant Canopy",
  "AB2": "Vertical Oasis",
  "AB3": "Ecological Stitching",
  "AB4": "Open Edge",
  "AB5": "Shaded Setback"
};

const E_DESC: Record<string, string> = {
  "E1": "Exposed Design", 
  "E2": "Deep Colonial / Narrow", 
  "E3": "Fragmented Fabric", 
  "E4": "Cosmetic Greening", 
  "E5": "Wasted Setbacks"
};

const COLORS: Record<string, string> = {
  'A': '#2b83ba', 'B': '#abdda4', 'C': '#ffffbf', 'D': '#fdae61', 'E': '#d7191c',
  'AB1': '#084594', 'AB2': '#238b45', 'AB3': '#d94801', 'AB4': '#6a51a3', 'AB5': '#ce1256',
  'E1': '#d73027', 'E2': '#8c510a', 'E3': '#762a83', 'E4': '#e08214', 'E5': '#404040'
};

// 📍 重点标注坐标 (Hotspots)
const HOTSPOTS = [
  { id: 'E1-1', pos: [10.789139, 106.690167] as [number, number], type: 'E1', title: 'E1-1: Exposed Design' },
  { id: 'E1-2', pos: [10.772000, 106.697000] as [number, number], type: 'E1', title: 'E1-2: Exposed Design' },
  { id: 'E1-3', pos: [10.777139, 106.704444] as [number, number], type: 'E1', title: 'E1-3: Exposed Design' },
  { id: 'E2-1', pos: [10.761472, 106.706750] as [number, number], type: 'E2', title: 'E2-1: Deep Colonial / Narrow' },
  { id: 'E2-2', pos: [10.763917, 106.707722] as [number, number], type: 'E2', title: 'E2-2: Deep Colonial / Narrow' },
  { id: 'E2-3', pos: [10.760889, 106.707472] as [number, number], type: 'E2', title: 'E2-3: Deep Colonial / Narrow' },
  { id: 'E3-1', pos: [10.739750, 106.726528] as [number, number], type: 'E3', title: 'E3-1: Fragmented Fabric' },
  { id: 'E3-2', pos: [10.728944, 106.732722] as [number, number], type: 'E3', title: 'E3-2: Fragmented Fabric' },
  { id: 'E3-3', pos: [10.739750, 106.726528] as [number, number], type: 'E3', title: 'E3-3: Fragmented Fabric' },
  { id: 'E4-1', pos: [10.746722, 106.700722] as [number, number], type: 'E4', title: 'E4-1: Cosmetic Greening' },
  { id: 'E4-2', pos: [10.742215, 106.709207] as [number, number], type: 'E4', title: 'E4-2: Cosmetic Greening' },
  { id: 'E4-3', pos: [10.745583, 106.709389] as [number, number], type: 'E4', title: 'E4-3: Cosmetic Greening' },
  { id: 'E5-1', pos: [10.736049, 106.735498] as [number, number], type: 'E5', title: 'E5-1: Wasted Setbacks' },
  { id: 'E5-2', pos: [10.751611, 106.731889] as [number, number], type: 'E5', title: 'E5-2: Wasted Setbacks' },
  { id: 'E5-3', pos: [10.7327773, 106.7324888] as [number, number], type: 'E5', title: 'E5-3: Wasted Setbacks' },
];

// 📐 辅助函数：生成 50m * 50m 的正方形区域 (GeoJSON Polygon)
const generate50mSquare = (lat: number, lng: number, properties: any) => {
  const dLat = 0.000225; // 约 25m 的纬度偏差
  const dLng = 0.000229; // 约 25m 的经度偏差 (基于 HCMC 纬度)
  
  return {
    type: "Feature",
    properties: {
      ...properties,
      isArea: true
    },
    geometry: {
      type: "Polygon",
      coordinates: [[
        [lng - dLng, lat - dLat],
        [lng + dLng, lat - dLat],
        [lng + dLng, lat + dLat],
        [lng - dLng, lat + dLat],
        [lng - dLng, lat - dLat]
      ]]
    }
  };
};

export default function InteractiveMap() {
  const [grades, setGrades] = useState(['A', 'B', 'C', 'D', 'E']);
  const [abTypes, setAbTypes] = useState(['AB1', 'AB2', 'AB3', 'AB4', 'AB5']);
  const [eTypes, setETypes] = useState(['E1', 'E2', 'E3', 'E4', 'E5']);
  
  // 🌟 新增状态：控制全景视窗的显隐与数据
  const [activePanorama, setActivePanorama] = useState<{title: string, before: string, after: string} | null>(null);

  const toggle = (list: string[], set: any, val: string) => {
    set(list.includes(val) ? list.filter(v => v !== val) : [...list, val]);
  };

  // 🚀 预处理基础数据，避免在每次过滤时重复计算分数等级
  const processedBaseData = useMemo(() => {
    if (!scoreMapData?.features) return [];
    return scoreMapData.features.map((f: any) => {
      const score = parseFloat(f.properties.Score ?? f.properties.Final_Scor ?? 0);
      let g = 'A';
      if (score < 12.6) g = 'E';
      else if (score < 17.9) g = 'D';
      else if (score < 23.9) g = 'C';
      else if (score < 32.0) g = 'B';
      
      return {
        ...f,
        properties: {
          ...f.properties,
          CurrentGrade: g,
          RenderColor: COLORS[g]
        }
      };
    });
  }, []);

  const combinedData = useMemo(() => {
    const baseFeatures = processedBaseData.filter((f: any) => {
      const g = f.properties.CurrentGrade;
      return g !== 'E' && grades.includes(g);
    });

    const abFeatures = abSuccessData?.features?.filter((f: any) => {
      const type = f.properties.AB_Type;
      f.properties.CurrentGrade = 'A/B';
      f.properties.RenderColor = COLORS[type] || COLORS['A'];
      return (grades.includes('A') || grades.includes('B')) && abTypes.includes(type);
    }) || [];

    const eFeatures = eDiagnosticData?.features?.filter((f: any) => {
      const type = f.properties.E_Type;
      f.properties.CurrentGrade = 'E';
      f.properties.RenderColor = COLORS[type] || COLORS['E'];
      return grades.includes('E') && eTypes.includes(type);
    }) || [];

    // 📍 新增：为 Hotspots 生成 50m*50m 的区域特征
    const hotspotAreas = HOTSPOTS.filter(h => eTypes.includes(h.type) && grades.includes('E')).map(h => {
      return generate50mSquare(h.pos[0], h.pos[1], {
        id: h.id,
        E_Type: h.type,
        CurrentGrade: 'E',
        RenderColor: COLORS[h.type],
        Title: h.title
      });
    });

    return { type: "FeatureCollection", features: [...baseFeatures, ...abFeatures, ...eFeatures, ...hotspotAreas] };
  }, [processedBaseData, grades, abTypes, eTypes]);

  // 🌟 核心交互逻辑：悬停气泡 + 点击触发全景
  const onEachFeature = React.useCallback((feature: any, layer: any) => {
    const p = feature.properties;
    const typeInfo = p.AB_Type ? `Typology: ${AB_DESC[p.AB_Type]}` : (p.E_Type ? `Diagnosis: ${E_DESC[p.E_Type]}` : '');
    
    // 如果是 E 类或 AB 类，提示用户可以点击
    const clickHint = (p.AB_Type || p.E_Type) 
      ? `<br/><div style="margin-top:6px; padding:4px; background:#fef2f2; border:1px solid #f87171; border-radius:4px; color:#b91c1c; font-size:11px; text-align:center;">👉 Click to view AI Intervention</div>` 
      : '';

    layer.bindTooltip(`
      <div style="font-family: sans-serif; padding: 2px; font-size: 12px;">
        <strong>${p.isArea ? '📍 Hotspot Area' : `Grade ${p.CurrentGrade}`}</strong>
        ${!p.isArea ? `| Score: ${(p.Final_Scor || p.Score || 0).toFixed(1)}` : ''}
        ${typeInfo ? `<br/><span style="color:#2563eb;">${typeInfo}</span>` : ''}
        ${clickHint}
      </div>
    `, { 
      sticky: true,
      direction: 'auto',
      opacity: 0.9
    });

    // 绑定点击事件
    layer.on({
      click: () => {
        if (p.E_Type) {
          const afterPrefix = (p.id && p.id.startsWith('E1')) ? '改造后' : '修改后';
          setActivePanorama({
            title: `🚨 ${p.id || p.E_Type} Crisis Rescue: ${E_DESC[p.E_Type]}`,
            before: p.id ? `${GITHUB_RAW_BASE}改造前${p.id}.jpg` : `${GITHUB_RAW_BASE}demo_before.jpg`, 
            after: p.id ? (p.E_Type === 'E4' || p.E_Type === 'E5' ? `${GITHUB_RAW_BASE}改造前${p.id}.jpg` : `${GITHUB_RAW_BASE}${afterPrefix}${p.id}.jpg`) : `${GITHUB_RAW_BASE}demo_after.jpg`
          });
        } else if (p.AB_Type) {
          setActivePanorama({
            title: `🌟 ${p.AB_Type} Success Model: ${AB_DESC[p.AB_Type]}`,
            before: `${GITHUB_RAW_BASE}demo_before.jpg`,
            after: `${GITHUB_RAW_BASE}demo_after.jpg`
          });
        }
      }
    });
  }, []); // 空依赖数组，因为 AB_DESC, E_DESC 是常量，setActivePanorama 是稳定的

  const layerKey = grades.join('') + abTypes.join('') + eTypes.join('');

  // 📍 自定义图标，使重点标注更显眼
  const hotspotIcon = (type: string) => L.divIcon({
    className: 'custom-hotspot-icon',
    html: `<div style="background-color: ${COLORS[type]}; width: 14px; height: 14px; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 8px rgba(0,0,0,0.5); animation: pulse 2s infinite;"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  });

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%', fontFamily: 'Arial, sans-serif' }}>
      
      {/* 🔴 侧边控制台 */}
      <div style={{ width: '350px', backgroundColor: '#f8fafc', padding: '25px', borderRight: '1px solid #e2e8f0', overflowY: 'auto', zIndex: 1000 }}>
        <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#0f172a', marginBottom: '4px' }}>🌿 Action Map</h2>
        <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '25px' }}>HCMC Urban Strategy Dashboard</p>

        {/* 1. Macro Grade */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 'bold', borderBottom: '1px solid #cbd5e1', paddingBottom: '6px', marginBottom: '12px' }}>📍 1. Macro Grade Level</h3>
          {['A', 'B', 'C', 'D', 'E'].map(g => (
            <label key={g} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', cursor: 'pointer', fontSize: '14px' }}>
              <input type="checkbox" checked={grades.includes(g)} onChange={() => toggle(grades, setGrades, g)} style={{ marginRight: '10px' }} />
              <span style={{ width: '14px', height: '14px', backgroundColor: COLORS[g], marginRight: '10px', borderRadius: '3px' }}></span>
              Grade {g} {g === 'E' ? '(Diagnostic 📍)' : ''}
            </label>
          ))}
        </div>

        {/* 2. Success Models (AB) */}
        <div style={{ marginBottom: '30px', opacity: (grades.includes('A') || grades.includes('B')) ? 1 : 0.3, transition: '0.3s' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 'bold', borderBottom: '1px solid #cbd5e1', paddingBottom: '6px', marginBottom: '12px', color: '#0369a1' }}>🌟 2. Success Typologies (A/B)</h3>
          {['AB1', 'AB2', 'AB3', 'AB4', 'AB5'].map(t => (
            <label key={t} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', fontSize: '12px', cursor: 'pointer' }}>
              <input type="checkbox" disabled={!grades.includes('A') && !grades.includes('B')} checked={abTypes.includes(t)} onChange={() => toggle(abTypes, setAbTypes, t)} style={{ marginRight: '10px' }} />
              <span style={{ width: '10px', height: '10px', backgroundColor: COLORS[t], borderRadius: '50%', marginRight: '10px' }}></span>
              <strong>{t}:</strong> {AB_DESC[t]}
            </label>
          ))}
        </div>

        {/* 3. Crisis Diagnosis (E) */}
        <div style={{ opacity: grades.includes('E') ? 1 : 0.3, transition: '0.3s' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 'bold', borderBottom: '1px solid #cbd5e1', paddingBottom: '6px', marginBottom: '12px', color: '#b91c1c' }}>🚨 3. Crisis Typologies (E)</h3>
          {['E1', 'E2', 'E3', 'E4', 'E5'].map(t => (
            <label key={t} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', fontSize: '12px', cursor: 'pointer' }}>
              <input type="checkbox" disabled={!grades.includes('E')} checked={eTypes.includes(t)} onChange={() => toggle(eTypes, setETypes, t)} style={{ marginRight: '10px' }} />
              <span style={{ width: '10px', height: '10px', backgroundColor: COLORS[t], borderRadius: '50%', marginRight: '10px' }}></span>
              <div style={{ flex: 1 }}>
                <strong>{t}:</strong> {E_DESC[t]}
              </div>
              <span style={{ fontSize: '10px', color: '#64748b', marginLeft: '8px', fontStyle: 'italic' }}>📍 3 Points</span>
            </label>
          ))}
        </div>
        
      </div>

      {/* 🔵 地图区 */}
      <div style={{ flex: 1, position: 'relative' }}>
        <MapContainer 
          center={[10.7769, 106.7009]} 
          zoom={13} 
          style={{ height: '100%', width: '100%', zIndex: 0 }}
          preferCanvas={true} // 🚀 关键优化：启用 Canvas 渲染，极大提升大量线段下的性能
        >
          <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
          {combinedData && (
            <GeoJSON 
              key={layerKey} 
              data={combinedData as any} 
              style={(f: any) => {
                const p = f.properties;
                if (p.isArea) {
                  return {
                    fillColor: p.RenderColor,
                    fillOpacity: 0.6,
                    color: p.RenderColor,
                    weight: 2,
                    dashArray: '3'
                  };
                }
                return {
                  color: p.RenderColor,
                  weight: p.E_Type || p.AB_Type ? 4 : 2, // 重点街道加粗，普通街道减细
                  opacity: p.E_Type || p.AB_Type ? 0.9 : 0.6, // 普通街道增加透明度
                };
              }}
              onEachFeature={onEachFeature} 
            />
          )}

          {/* 📍 渲染重点标注 (Hotspots) */}
          {HOTSPOTS.filter(h => eTypes.includes(h.type) && grades.includes('E')).map(h => (
            <Marker 
              key={h.id} 
              position={h.pos} 
              icon={hotspotIcon(h.type)}
              eventHandlers={{
                click: () => {
                  const afterPrefix = h.id.startsWith('E1') ? '改造后' : '修改后';
                  setActivePanorama({
                    title: `🚨 ${h.id} Intervention: ${E_DESC[h.type]}`,
                    before: `${GITHUB_RAW_BASE}改造前${h.id}.jpg`,
                    // E4, E5 暂无修改后图片，使用修改前占位
                    after: h.type === 'E4' || h.type === 'E5' ? `${GITHUB_RAW_BASE}改造前${h.id}.jpg` : `${GITHUB_RAW_BASE}${afterPrefix}${h.id}.jpg`
                  });
                }
              }}
            >
              <Popup>
                <div style={{ textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
                  <strong style={{ color: COLORS[h.type] }}>{h.id} Hotspot</strong><br/>
                  <span style={{ fontSize: '12px' }}>{E_DESC[h.type]}</span><br/>
                  <div style={{ marginTop: '8px', padding: '4px 8px', backgroundColor: '#0f172a', color: 'white', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>
                    Click to view 360° Proposal
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* 🌟 弹出层：360° 全景对比视窗 */}
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