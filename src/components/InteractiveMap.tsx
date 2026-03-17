import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// 🌟 导入你刚刚新建的全景组件
import BeforeAfterViewer from './BeforeAfterViewer'; 

// 🚀 导入三个核心数据源
import scoreMapData from '../data/score_map.json';      
import eDiagnosticData from '../data/data_e_only.json'; 
import abSuccessData from '../data/data_ab_only.json';  

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

export default function InteractiveMap() {
  const [grades, setGrades] = useState(['A', 'B', 'C', 'D', 'E']);
  const [abTypes, setAbTypes] = useState(['AB1', 'AB2', 'AB3', 'AB4', 'AB5']);
  const [eTypes, setETypes] = useState(['E1', 'E2', 'E3', 'E4', 'E5']);
  
  // 🌟 新增状态：控制全景视窗的显隐与数据
  const [activePanorama, setActivePanorama] = useState<{title: string, before: string, after: string} | null>(null);

  const toggle = (list: string[], set: any, val: string) => {
    set(list.includes(val) ? list.filter(v => v !== val) : [...list, val]);
  };

  const combinedData = useMemo(() => {
    if (!scoreMapData?.features) return null;

    const baseFeatures = scoreMapData.features.filter((f: any) => {
      const score = parseFloat(f.properties.Score ?? f.properties.Final_Scor ?? 0);
      let g = 'A';
      if (score < 12.6) g = 'E';
      else if (score < 17.9) g = 'D';
      else if (score < 23.9) g = 'C';
      else if (score < 32.0) g = 'B';
      
      f.properties.CurrentGrade = g;
      f.properties.RenderColor = COLORS[g];
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

    return { type: "FeatureCollection", features: [...baseFeatures, ...abFeatures, ...eFeatures] };
  }, [grades, abTypes, eTypes]);

  // 🌟 核心交互逻辑：悬停气泡 + 点击触发全景
  const onEachFeature = (feature: any, layer: any) => {
    const p = feature.properties;
    const typeInfo = p.AB_Type ? `Typology: ${AB_DESC[p.AB_Type]}` : (p.E_Type ? `Diagnosis: ${E_DESC[p.E_Type]}` : '');
    
    // 如果是 E 类或 AB 类，提示用户可以点击
    const clickHint = (p.AB_Type || p.E_Type) 
      ? `<br/><div style="margin-top:6px; padding:4px; background:#fef2f2; border:1px solid #f87171; border-radius:4px; color:#b91c1c; font-size:11px; text-align:center;">👉 Click line to view AI Intervention</div>` 
      : '';

    layer.bindTooltip(`
      <div style="font-family: Arial, sans-serif; padding: 4px; min-width: 150px;">
        <strong>Grade:</strong> ${p.CurrentGrade}<br/>
        <strong>Score:</strong> ${(p.Final_Scor || p.Score || 0).toFixed(1)}<br/>
        <span style="color:#2563eb; font-weight:bold;">${typeInfo}</span>
        ${clickHint}
      </div>
    `);

    // 绑定点击事件
    layer.on({
      click: () => {
        if (p.E_Type) {
          setActivePanorama({
            title: `🚨 ${p.E_Type} Crisis Rescue: ${E_DESC[p.E_Type]}`,
            // ⚠️ 这里指向 public 文件夹下的图片名，请根据你的实际文件名修改
            before: `/demo_before.jpg`, 
            after: `/demo_after.jpg`
          });
        } else if (p.AB_Type) {
          setActivePanorama({
            title: `🌟 ${p.AB_Type} Success Model: ${AB_DESC[p.AB_Type]}`,
            before: `/demo_before.jpg`,
            after: `/demo_after.jpg`
          });
        }
      }
    });
  };

  const layerKey = grades.join('') + abTypes.join('') + eTypes.join('');

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
              Grade {g} {g === 'E' ? '(Diagnostic)' : ''}
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
              <strong>{t}:</strong> {E_DESC[t]}
            </label>
          ))}
        </div>
        
        {/* 全景测试按钮（防止地图点不到时备用） */}
        <div style={{ marginTop: '30px' }}>
           <button 
              onClick={() => setActivePanorama({
                title: "🚨 E2 Intervention: Deep Colonial / Narrow",
                before: "/demo_before.jpg", 
                after: "/demo_after.jpg"
              })}
              style={{ width: '100%', padding: '12px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
            >
              👁️ Test 360° Viewer (Demo)
            </button>
        </div>
      </div>

      {/* 🔵 地图区 */}
      <div style={{ flex: 1, position: 'relative' }}>
        <MapContainer center={[10.7769, 106.7009]} zoom={13} style={{ height: '100%', width: '100%', zIndex: 0 }}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
          {combinedData && (
            <GeoJSON 
              key={layerKey} 
              data={combinedData as any} 
              style={(f: any) => ({
                color: f.properties.RenderColor,
                weight: 3, // 稍微加粗一点方便点击
                opacity: 0.9
              })}
              onEachFeature={onEachFeature} // 绑定上面写好的悬停和点击逻辑
            />
          )}
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