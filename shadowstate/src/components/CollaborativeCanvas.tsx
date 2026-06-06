import React, { useRef } from 'react';
import { useYjs } from '../context/YjsContext';
import { useCanvasState } from '../hooks/useCanvasState';
import { MapPin } from 'lucide-react';

export const CollaborativeCanvas: React.FC = () => {
  const { ydoc } = useYjs();
  const { pins, addPin } = useCanvasState(ydoc);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('.map-pin-icon')) return;
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const label = prompt('Enter a label for this node/sensor:');
    if (!label) return;

    // Uses the safe random identifier generator string directly
    addPin(Math.random().toString(36).substring(2, 11), x, y, label);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 p-6">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-slate-100">ShadowState Blueprint Workspace</h1>
        <p className="text-sm text-slate-400">Click anywhere inside the grid mesh below to deploy an offline data node.</p>
      </div>

      {/* FIXED CONTAINER CLASSNAME STYLES */}
      <div
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="flex-1 relative rounded-xl border border-slate-800 bg-slate-950 overflow-hidden cursor-crosshair select-none shadow-inner bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] before:content-[''] before:absolute before:inset-0 before:bg-[linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] before:bg-[size:4rem_4rem] before:pointer-events-none pointer-events-auto"
      >
        {pins.map((pin) => (
          <div
            key={pin.id}
            className="map-pin-icon absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group z-10"
            style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
          >
            <div className="bg-emerald-500 text-white p-2 rounded-full shadow-lg shadow-emerald-500/20 border-2 border-slate-200">
              <MapPin size={18} className="stroke-[2.5]" />
            </div>
            <div className="mt-1 bg-slate-900 border border-slate-700 text-slate-200 text-xs py-1 px-2 rounded font-mono shadow-md whitespace-nowrap opacity-90 group-hover:opacity-100 transition-opacity">
              {pin.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};