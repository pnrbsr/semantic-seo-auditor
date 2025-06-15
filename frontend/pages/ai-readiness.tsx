import React, { useState } from 'react';
import NavBar from '../components/NavBar';
import { uploadFile, getAIReadiness, fetchPages } from '../utils/api';

export default function AIReadinessPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [showContentIdx, setShowContentIdx] = useState<number | null>(null);

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
    setResults([]);
    try {
      const result = await uploadFile(file);
      setPages(result);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchUrls = async () => {
    const urls = urlInput
      .split('\n')
      .map((u) => u.trim())
      .filter((u) => u.startsWith('http'));
    if (!urls.length) return;
    setLoading(true);
    setError(null);
    setPages([]);
    setResults([]);
    try {
      const result = await fetchPages(urls);
      setPages(result);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch URLs');
    } finally {
      setLoading(false);
    }
  };

  const handleContentChange = (idx: number, value: string) => {
    setPages((prev) => prev.map((p, i) => (i === idx ? { ...p, content: value } : p)));
  };

  const handleGetScores = async () => {
    if (!pages.length) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getAIReadiness(pages);
      setResults(result);
    } catch (err: any) {
      setError(err.message || 'Failed to get AI readiness scores');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 32 }}>
      <NavBar />
      <h1>AI Readiness Score</h1>
      <div style={{ marginBottom: 16 }}>
        <input type="file" accept=".xml,.html,.htm,.csv" onChange={handleFileChange} />
        <button onClick={handleUpload} disabled={!file || loading} style={{ marginLeft: 8 }}>
          {loading ? 'Uploading...' : 'Upload'}
        </button>
      </div>
      <div style={{ marginBottom: 16 }}>
        <textarea
          rows={4}
          style={{ width: 500 }}
          placeholder="Enter one URL per line..."
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
        />
        <button onClick={handleFetchUrls} disabled={loading || !urlInput.trim()} style={{ marginLeft: 8 }}>
          {loading ? 'Fetching...' : 'Fetch URLs'}
        </button>
      </div>
      {pages.length > 0 && results.length === 0 && (
        <div style={{ marginBottom: 24 }}>
          <h3>Review & Edit Content Before Scoring</h3>
          <table border={1} cellPadding={6} style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>URL</th>
                <th>Language</th>
                <th>Content (editable)</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page, idx) => (
                <tr key={idx}>
                  <td>{page.url}</td>
                  <td>{page.lang}</td>
                  <td>
                    <textarea
                      rows={4}
                      style={{ width: 350 }}
                      value={page.content}
                      onChange={(e) => handleContentChange(idx, e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={handleGetScores} disabled={loading} style={{ marginTop: 16 }}>
            {loading ? 'Scoring...' : 'Get Scores'}
          </button>
        </div>
      )}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {results.length > 0 && (
        <table border={1} cellPadding={6} style={{ width: '100%', marginTop: 24 }}>
          <thead>
            <tr>
              <th>URL</th>
              <th>Score</th>
              <th>Summary Similarity</th>
              <th>Missing Headers</th>
              <th>LLM Summary</th>
              <th>Suggestions</th>
              <th>Show Content</th>
            </tr>
          </thead>
          <tbody>
            {results.map((row, idx) => (
              <React.Fragment key={idx}>
                <tr>
                  <td>{row.url}</td>
                  <td>{row.score}</td>
                  <td>{row.summary_similarity !== null ? row.summary_similarity.toFixed(2) : '-'}</td>
                  <td>{row.missing_headers && row.missing_headers.length > 0 ? row.missing_headers.join(', ') : '-'}</td>
                  <td style={{ maxWidth: 300, whiteSpace: 'pre-line' }}>{row.llm_summary || '-'}</td>
                  <td>
                    <ul style={{ margin: 0, paddingLeft: 16 }}>
                      {row.suggestions.map((s: string, i: number) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </td>
                  <td>
                    <button onClick={() => setShowContentIdx(showContentIdx === idx ? null : idx)}>
                      {showContentIdx === idx ? 'Hide' : 'Show'}
                    </button>
                  </td>
                </tr>
                {showContentIdx === idx && (
                  <tr>
                    <td colSpan={7} style={{ background: '#f9f9f9' }}>
                      <b>Full Content:</b>
                      <div style={{ whiteSpace: 'pre-line', maxHeight: 300, overflowY: 'auto', marginTop: 8 }}>
                        {pages[idx]?.content || '-'}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
} 