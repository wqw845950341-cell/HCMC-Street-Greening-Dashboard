import React from 'react';
import { STRATEGIES } from '../data';
import { motion } from 'motion/react';
import { Shield, Users, Map as MapIcon, Settings } from 'lucide-react';
import { cn } from '../lib/utils';

export const StrategyToolkit: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-slate-900">Strategy & Policy Toolkit</h2>
        <p className="text-slate-500 max-w-2xl">
          A comprehensive guide for urban planners to implement greening interventions across public and private domains.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {STRATEGIES.map((strategy, index) => (
          <motion.div
            key={strategy.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={cn(
                "p-2 rounded-lg",
                strategy.domain === 'Public' ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"
              )}>
                {strategy.domain === 'Public' ? <Shield size={20} /> : <Users size={20} />}
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Type {strategy.id}
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-2">{strategy.title}</h3>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              {strategy.description}
            </p>

            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <MapIcon size={14} className="text-slate-400" />
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Domain</span>
                  <span className="text-xs font-medium text-slate-700">{strategy.domain} Domain</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <Settings size={14} className="text-slate-400" />
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Approach</span>
                  <span className="text-xs font-medium text-slate-700">{strategy.approach}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 p-3 bg-slate-50 rounded-xl">
              <p className="text-[11px] text-slate-600 italic leading-snug">
                "{strategy.details}"
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-slate-900 text-white p-8 rounded-3xl overflow-hidden relative">
        <div className="relative z-10 max-w-2xl">
          <h3 className="text-xl font-bold mb-2">Mayor's Action Guide</h3>
          <p className="text-slate-400 text-sm mb-6">
            Prioritize interventions based on the "Average Street Score". Focus on E-Grade segments for immediate impact on urban heat island mitigation.
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-xs font-medium border border-white/10">
              <div className="w-2 h-2 rounded-full bg-blue-400" />
              Top-down Planning (Public)
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-xs font-medium border border-white/10">
              <div className="w-2 h-2 rounded-full bg-purple-400" />
              Policy-driven (Private)
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 blur-[100px] -translate-y-1/2 translate-x-1/2" />
      </div>
    </div>
  );
};
