import React, { useState } from 'react';
import NavBar from '../components/NavBar';
import { uploadFile, clusterPages } from '../utils/api';
import ClusterGraph from '../components/ClusterGraph';

function exportClustersCSV(clusteredPages: any[], clusterKeywords: any) {
  const header = 'cluster_id,url,lang,keywords\n';
  const rows = clusteredPages.map((p) => {
    const keywords = (clusterKeywords[p.cluster] || []).join(' ');
    return `${p.cluster},${p.url},${p.lang},"${keywords}"`;
  });
  const csv = header + rows.join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'clusters.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export default function ClusteringPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<any[]>([]);
  const [clusters, setClusters] = useState<any>({});
  const [clusterKeywords, setClusterKeywords] = useState<any>({});
  const [clusteredPages, setClusteredPages] = useState<any[]>([]);
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setPages([]);
    setClusters({});
    setClusterKeywords({});
    setClusteredPages([]);
    setSelectedCluster(null);
    try {
      const result = await uploadFile(file);
      setPages(result);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCluster = async () => {
    if (!pages.length) return;
    setLoading(true);
    setError(null);
    setSelectedCluster(null);
    try {
      const result = await clusterPages(pages);
      setClusters(result.clusters);
      setClusterKeywords(result.cluster_keywords);
      setClusteredPages(result.clustered_pages);
    } catch (err: any) {
      setError(err.message || 'Clustering failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCluster = (cid: string) => {
    setSelectedCluster(cid);
  };

  const selectedPages = selectedCluster
    ? clusteredPages.filter((p) => String(p.cluster) === String(selectedCluster))
    : [];
  const selectedKeywords = selectedCluster ? clusterKeywords[selectedCluster] || [] : [];

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 32 }}>
      <NavBar />
      <h1>Semantic Content Clustering</h1>
      <div style={{ marginBottom: 16 }}>
        <input type="file" accept=".xml,.html,.htm,.csv" onChange={handleFileChange} />
        <button onClick={handleUpload} disabled={!file || loading} style={{ marginLeft: 8 }}>
          {loading ? 'Uploading...' : 'Upload'}
        </button>
        <button onClick={handleCluster} disabled={!pages.length || loading} style={{ marginLeft: 8 }}>
          {loading ? 'Clustering...' : 'Cluster'}
        </button>
        {clusteredPages.length > 0 && (
          <button
            style={{ marginLeft: 16 }}
            onClick={() => exportClustersCSV(clusteredPages, clusterKeywords)}
          >
            Export Clusters CSV
          </button>
        )}
      </div>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {Object.keys(clusters).length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h2>Clusters</h2>
          <ClusterGraph
            clusters={clusters}
            clusterKeywords={clusterKeywords}
            clusteredPages={clusteredPages}
            onSelectCluster={handleSelectCluster}
            selectedCluster={selectedCluster}
          />
          <div style={{ marginTop: 24 }}>
            <h3>Cluster Keywords</h3>
            <ul>
              {Object.entries(clusterKeywords).map(([cid, keywords]) => (
                <li key={cid}>
                  <b>Cluster {cid}:</b> {(keywords as string[]).join(', ')}
                </li>
              ))}
            </ul>
          </div>
          {selectedCluster && (
            <div style={{ marginTop: 32 }}>
              <h3>Pages in Cluster {selectedCluster}</h3>
              {selectedKeywords.length > 0 && (
                <div style={{ marginBottom: 8 }}>
                  <b>Keywords:</b> {selectedKeywords.join(', ')}
                </div>
              )}
              <table border={1} cellPadding={6} style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>URL</th>
                    <th>Language</th>
                    <th>Content Preview</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPages.map((page, idx) => (
                    <tr key={idx}>
                      <td>{page.url}</td>
                      <td>{page.lang}</td>
                      <td>{page.content.slice(0, 120)}...</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 
