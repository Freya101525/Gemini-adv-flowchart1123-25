import React from 'react';
import { FlowchartSpec, FlowchartNode, FlowchartEdge } from '../types';

interface EditorProps {
  spec: FlowchartSpec;
  onChange: (newSpec: FlowchartSpec) => void;
}

const Editor: React.FC<EditorProps> = ({ spec, onChange }) => {
  
  const updateNode = (idx: number, field: keyof FlowchartNode, value: any) => {
    const newNodes = [...spec.nodes];
    newNodes[idx] = { ...newNodes[idx], [field]: value };
    onChange({ ...spec, nodes: newNodes });
  };

  const updateEdge = (idx: number, field: keyof FlowchartEdge, value: any) => {
    const newEdges = [...spec.edges];
    newEdges[idx] = { ...newEdges[idx], [field]: value };
    onChange({ ...spec, edges: newEdges });
  };

  const deleteNode = (idx: number) => {
    const newNodes = spec.nodes.filter((_, i) => i !== idx);
    onChange({ ...spec, nodes: newNodes });
  };

  return (
    <div className="h-full flex flex-col gap-6 overflow-y-auto p-1">
      <div>
        <h3 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300 uppercase tracking-wider">Nodes</h3>
        <div className="space-y-2">
          {spec.nodes.map((node, idx) => (
            <div key={node.id} className="group flex gap-2 items-center bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
              <input 
                className="w-16 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
                value={node.id}
                disabled
              />
              <input 
                className="flex-1 text-sm bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none px-1"
                value={node.label}
                onChange={(e) => updateNode(idx, 'label', e.target.value)}
                placeholder="Label"
              />
              <select
                 className="text-xs bg-gray-50 dark:bg-gray-900 border-none rounded px-1 py-1 text-gray-500"
                 value={node.category}
                 onChange={(e) => updateNode(idx, 'category', e.target.value)}
              >
                <option value="step">Step</option>
                <option value="decision">Decision</option>
                <option value="phase">Phase</option>
                <option value="input">Input</option>
                <option value="end">End</option>
              </select>
               <button 
                onClick={() => deleteNode(idx)}
                className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity px-2"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300 uppercase tracking-wider">Edges</h3>
         <div className="space-y-2">
          {spec.edges.map((edge, idx) => (
            <div key={`${edge.from}-${edge.to}`} className="flex gap-2 items-center bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="font-mono bg-gray-100 dark:bg-gray-900 px-1 rounded">{edge.from}</span>
                <span>→</span>
                <span className="font-mono bg-gray-100 dark:bg-gray-900 px-1 rounded">{edge.to}</span>
              </div>
              <input 
                className="flex-1 text-sm bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none px-1"
                value={edge.label || ''}
                onChange={(e) => updateEdge(idx, 'label', e.target.value)}
                placeholder="Label (optional)"
              />
               <select
                 className="text-xs bg-gray-50 dark:bg-gray-900 border-none rounded px-1 py-1 text-gray-500"
                 value={edge.style}
                 onChange={(e) => updateEdge(idx, 'style', e.target.value)}
              >
                <option value="solid">Solid</option>
                <option value="dashed">Dashed</option>
                <option value="dotted">Dotted</option>
              </select>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Editor;