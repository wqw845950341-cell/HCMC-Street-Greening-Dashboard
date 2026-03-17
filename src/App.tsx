/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import L from 'leaflet';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  BookOpen, 
  Filter, 
  ChevronRight,
  TreeDeciduous,
  AlertTriangle,
  BarChart3
} from 'lucide-react';
import InteractiveMap from './components/InteractiveMap';
import { StrategyToolkit } from './components/StrategyToolkit';
import { PanoramaViewer } from './components/PanoramaViewer';
import { StreetSegment } from './data';
import EMBEDDED_SCORE_MAP from './data/score_map.json';
import { cn } from './lib/utils';

// Fix for Leaflet default icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

type ViewMode = 'map' | 'toolkit';

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [selectedStreet, setSelectedStreet] = useState<StreetSegment | null>(null);
  const [showPanorama, setShowPanorama] = useState(false);
  
  // Filters
  const [gradeFilter, setGradeFilter] = useState<string[]>(['A', 'B', 'C', 'D', 'E']);

  // Helper to get grade from score (matching InteractiveMap logic)
  const getGradeFromScore = (score: number): string => {
    if (score < 12.6) return 'E';
    if (score < 17.9) return 'D';
    if (score < 23.9) return 'C';
    if (score < 32.0) return 'B';
    return 'A';
  };

  // Memoized stats from GeoJSON
  const stats = useMemo(() => {
    const features = EMBEDDED_SCORE_MAP.features || [];
    const filtered = features.filter((f: any) => {
      const score = f.properties.Final_Scor || 0;
      const grade = getGradeFromScore(score);
      return gradeFilter.includes(grade);
    });

    return {
      total: filtered.length,
      critical: filtered.filter((f: any) => getGradeFromScore(f.properties.Final_Scor || 0) === 'E').length
    };
  }, [gradeFilter]);

  const toggleGrade = (grade: string) => {
    setGradeFilter(prev => 
      prev.includes(grade) ? prev.filter(g => g !== grade) : [...prev, grade]
    );
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-80 bg-white border-r border-slate-200 flex flex-col z-50">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-600 rounded-xl text-white">
              <TreeDeciduous size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-tight leading-tight">
              HCMC Street <br />
              <span className="text-emerald-600">Greening Dashboard</span>
            </h1>
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            Decision-Support Platform
          </p>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-8">
          {/* Navigation */}
          <div className="space-y-1">
            <button
              onClick={() => setViewMode('map')}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                viewMode === 'map' ? "bg-slate-900 text-white shadow-lg shadow-slate-200" : "text-slate-500 hover:bg-slate-50"
              )}
            >
              <MapIcon size={18} />
              Interactive Action Map
            </button>
            <button
              onClick={() => setViewMode('toolkit')}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                viewMode === 'toolkit' ? "bg-slate-900 text-white shadow-lg shadow-slate-200" : "text-slate-500 hover:bg-slate-50"
              )}
            >
              <BookOpen size={18} />
              Policy Toolkit
            </button>
          </div>

          {/* Filters */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-2">
              <Filter size={14} className="text-slate-400" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Filters</span>
            </div>

            <div className="space-y-6">
              {/* Grade Filter */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-3 px-2 text-center">Street Grade Selection</label>
                <div className="grid grid-cols-5 gap-1">
                  {['A', 'B', 'C', 'D', 'E'].map(grade => (
                    <button
                      key={grade}
                      onClick={() => toggleGrade(grade)}
                      className={cn(
                        "h-10 rounded-xl text-xs font-bold transition-all border shadow-sm",
                        gradeFilter.includes(grade) 
                          ? "bg-slate-900 text-white border-slate-900 scale-105" 
                          : "bg-white text-slate-400 border-slate-200 hover:border-slate-300"
                      )}
                    >
                      {grade}
                    </button>
                  ))}
                </div>
                <p className="mt-4 text-[10px] text-slate-400 text-center px-4">
                  Toggle grades to filter the action map in real-time.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 size={14} className="text-slate-400" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Summary</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <span className="text-xs text-slate-500">Total Segments</span>
                <span className="text-lg font-bold font-mono">{stats.total}</span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-xs text-slate-500">Critical (E)</span>
                <span className="text-lg font-bold font-mono text-red-500">
                  {stats.critical}
                </span>
              </div>
            </div>
          </div>
        </nav>

        <div className="p-6 border-t border-slate-100">
          <div className="flex items-center gap-3 text-slate-400">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
              <LayoutDashboard size={14} />
            </div>
            <div className="text-[10px] leading-tight">
              <p className="font-bold text-slate-600">HCMC Planning Dept.</p>
              <p>v1.2.0-Stable</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 z-40">
          <div className="flex items-center gap-4">
            <div className="h-8 w-px bg-slate-200" />
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">
              {viewMode === 'map' ? 'Interactive Action Map' : 'Strategy & Policy Toolkit'}
            </h2>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Data Feed
            </div>
            <button className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors">
              Export Report
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 relative overflow-y-auto">
          <AnimatePresence mode="wait">
            {viewMode === 'map' ? (
              <motion.div
                key="map"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full p-6"
              >
                <div className="h-full flex flex-col gap-6">
                  <div className="flex-1 min-h-0">
                    <InteractiveMap 
                      geoJsonData={EMBEDDED_SCORE_MAP}
                      gradeFilter={gradeFilter}
                      onSelectStreet={(street) => {
                        setSelectedStreet(street);
                        if (street.panorama) setShowPanorama(true);
                      }}
                      selectedStreetId={selectedStreet?.id}
                    />
                  </div>
                  
                  {/* Quick Info Bar */}
                  {selectedStreet && (
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg flex items-center justify-between"
                    >
                      <div className="flex items-center gap-6">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl",
                          selectedStreet.grade === 'A' && "bg-grade-a",
                          selectedStreet.grade === 'B' && "bg-grade-b",
                          selectedStreet.grade === 'C' && "bg-grade-c text-slate-900",
                          selectedStreet.grade === 'D' && "bg-grade-d",
                          selectedStreet.grade === 'E' && "bg-grade-e",
                        )}>
                          {selectedStreet.grade}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{selectedStreet.name}</h3>
                          <p className="text-xs text-slate-500">
                            {selectedStreet.subType ? `Identified as Type ${selectedStreet.subType} Intervention Area` : 'General Maintenance Zone'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-8">
                        <div className="text-center">
                          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">PVI Score</span>
                          <span className="text-xl font-bold font-mono">{(selectedStreet.pvi * 100).toFixed(0)}%</span>
                        </div>
                        <div className="text-center">
                          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">SVI Score</span>
                          <span className="text-xl font-bold font-mono">{(selectedStreet.svi * 100).toFixed(0)}%</span>
                        </div>
                        <div className="h-10 w-px bg-slate-100" />
                        {selectedStreet.panorama ? (
                          <button 
                            onClick={() => setShowPanorama(true)}
                            className="px-6 py-3 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg shadow-emerald-100"
                          >
                            <LayoutDashboard size={18} />
                            View 360° Comparison
                          </button>
                        ) : (
                          <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-xl border border-amber-100">
                            <AlertTriangle size={16} />
                            <span className="text-xs font-bold">No Panorama Available</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="toolkit"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-12 max-w-7xl mx-auto"
              >
                <StrategyToolkit />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Panorama Overlay */}
      <AnimatePresence>
        {showPanorama && selectedStreet?.panorama && (
          <PanoramaViewer 
            before={selectedStreet.panorama.before}
            after={selectedStreet.panorama.after}
            onClose={() => setShowPanorama(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
