import React, { useState } from 'react';
import NavBar from '../components/NavBar';
import { uploadFile, getInternalLinks } from '../utils/api';

function exportLinksCSV(links: any[]) {
  const header = 'source_url,target_url,anchor_text,similarity,same_language\n';
  const rows = links.map((l) =>
    `${l.source_url},${l.target_url},"${l.anchor_text}",${l.similarity},${l.same_language ? 'Yes' : 'No'}`
  );
  const csv = header + rows.join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'internal_links.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export default function InternalLinksPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<any[]>([]);
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [minSimilarity, setMinSimilarity] = useState<number>(0.7);

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
    setLinks([]);
    try {
      const result = await uploadFile(file);
      setPages(result);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGetLinks = async () => {
    if (!pages.length) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getInternalLinks(pages);
      setLinks(result);
    } catch (err: any) {
      setError(err.message || 'Failed to get internal links');
    } finally {
      setLoading(false);
    }
  };

  // Collect all languages from the pages
  const allLanguages = Array.from(new Set(pages.map((p) => p.lang).filter(Boolean)));

  // Filter links by selected language and min similarity
  const filteredLinks = links.filter((link) => {
    const langMatch =
      !selectedLanguage ||
      pages.find((p) => p.url === link.source_url)?.lang === selectedLanguage ||
      pages.find((p) => p.url === link.target_url)?.lang === selectedLanguage;
    const simMatch = link.similarity >= minSimilarity;
    return langMatch && simMatch;
  });

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 32 }}>
      <NavBar />
      <h1>Internal Linking Suggestions</h1>
      <div style={{ marginBottom: 16 }}>
        <input type="file" accept=".xml,.html,.htm,.csv" onChange={handleFileChange} />
        <button onClick={handleUpload} disabled={!file || loading} style={{ marginLeft: 8 }}>
          {loading ? 'Uploading...' : 'Upload'}
        </button>
        <button onClick={handleGetLinks} disabled={!pages.length || loading} style={{ marginLeft: 8 }}>
          {loading ? 'Getting Links...' : 'Get Suggestions'}
        </button>
      </div>
      {links.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <label style={{ marginRight: 12 }}>
            Filter by Language:
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              style={{ marginLeft: 8 }}
            >
              <option value="">All</option>
              {allLanguages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </label>
          <label style={{ marginLeft: 24 }}>
            Min Similarity:
            <input
              type="number"
              min={0}
              max={1}
              step={0.01}
              value={minSimilarity}
              onChange={(e) => setMinSimilarity(Number(e.target.value))}
              style={{ width: 60, marginLeft: 8 }}
            />
          </label>
          <button
            style={{ marginLeft: 24 }}
            onClick={() => exportLinksCSV(filteredLinks)}
            disabled={filteredLinks.length === 0}
          >
            Export CSV
          </button>
        </div>
      )}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {filteredLinks.length > 0 && (
        <table border={1} cellPadding={6} style={{ width: '100%', marginTop: 24 }}>
          <thead>
            <tr>
              <th>Source URL</th>
              <th>Target URL</th>
              <th>Anchor Text</th>
              <th>Similarity</th>
              <th>Same Language</th>
            </tr>
          </thead>
          <tbody>
            {filteredLinks.map((link, idx) => (
              <tr key={idx}>
                <td>{link.source_url}</td>
                <td>{link.target_url}</td>
                <td>{link.anchor_text}</td>
                <td>{link.similarity.toFixed(2)}</td>
                <td>{link.same_language ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
} 