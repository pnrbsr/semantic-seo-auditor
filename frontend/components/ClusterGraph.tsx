import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from 'recharts';

interface ClusterGraphProps {
  clusters: Record<string, string[]>;
  clusterKeywords: Record<string, string[]>;
  clusteredPages: any[];
  onSelectCluster?: (clusterId: string) => void;
  selectedCluster?: string | null;
}

// Generate random positions for clusters for a simple force-directed effect
function getClusterData(clusters: Record<string, string[]>, clusterKeywords: Record<string, string[]>) {
  const data = Object.entries(clusters).map(([cid, urls], i) => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: urls.length * 30 + 40,
    cluster: cid,
    label: (clusterKeywords[cid] || []).join(', '),
    count: urls.length,
  }));
  return data;
}

export default function ClusterGraph({ clusters, clusterKeywords, onSelectCluster, selectedCluster }: ClusterGraphProps) {
  const data = getClusterData(clusters, clusterKeywords);
  return (
    <ResponsiveContainer width="100%" height={400}>
      <ScatterChart>
        <XAxis type="number" dataKey="x" name="X" hide />
        <YAxis type="number" dataKey="y" name="Y" hide />
        <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(v, n, p) => p.payload.label} />
        <Scatter
          data={data}
          fill="#1976d2"
          shape={(props) => {
            const { cx, cy, size, payload } = props as any;
            const isSelected = selectedCluster === payload.cluster;
            return (
              <circle
                cx={cx}
                cy={cy}
                r={size / 2}
                fill={isSelected ? '#ff9800' : '#1976d2'}
                stroke={isSelected ? '#d84315' : '#fff'}
                strokeWidth={isSelected ? 4 : 1}
                style={{ cursor: 'pointer' }}
                onClick={() => onSelectCluster && onSelectCluster(payload.cluster)}
              />
            );
          }}
        >
          <LabelList dataKey="label" position="top" />
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
} 