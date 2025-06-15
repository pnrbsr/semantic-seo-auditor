import React, { useState } from 'react';
import NavBar from '../components/NavBar';
import { checkLocalizationConsistency } from '../utils/api';

interface UrlPair {
  original: string;
  translation: string;
}

function exportResultsCSV(pairs: UrlPair[], results: any[], threshold: number) {
  const header = 'original_url,translation_url,similarity,drift,original_text_preview,translation_text_preview\n';
  const rows = results.map((row, idx) => {
    const drift = row.similarity < threshold ? 'Drift' : 'OK';
    return `"${pairs[idx]?.original}","${pairs[idx]?.translation}",${row.similarity},${drift},"${row.original.slice(0, 80)}...","${row.translation.slice(0, 80)}..."`;
  });
  const csv = header + rows.join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'localization_consistency.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export default function LocalizationPage() {
  const [pairs, setPairs] = useState<UrlPair[]>([{ original: '', translation: '' }]);
  const [threshold, setThreshold] = useState(0.7);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePairChange = (idx: number, field: 'original' | 'translation', value: string) => {
    setPairs((prev) => prev.map((p, i) => (i === idx ? { ...p, [field]: value } : p)));
  };

  const handleAddPair = () => {
    setPairs((prev) => [...prev, { original: '', translation: '' }]);
  };

  const handleRemovePair = (idx: number) => {
    setPairs((prev) => prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev);
  };

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults([]);
    try {
      const originals = pairs.map((p) => p.original);
      const translations = pairs.map((p) => p.translation);
      const data = await checkLocalizationConsistency(originals, translations, threshold);
      setResults(data.flagged_pairs);
    } catch (err: any) {
      setError(err.message || 'Check failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 32 }}>
      <NavBar />
      <h1>Localization Consistency Checker</h1>
      <form onSubmit={handleCheck} style={{ marginBottom: 24 }}>
        {pairs.map((pair, idx) => (
          <div key={idx} style={{ marginBottom: 12, display: 'flex', alignItems: 'center' }}>
            <label style={{ flex: 1 }}>
              Original URL:
              <input
                type="text"
                value={pair.original}
                onChange={(e) => handlePairChange(idx, 'original', e.target.value)}
                style={{ width: 320, marginLeft: 8 }}
                placeholder="https://example.com/en/page"
                required
              />
            </label>
            <label style={{ flex: 1, marginLeft: 16 }}>
              Translation URL:
              <input
                type="text"
                value={pair.translation}
                onChange={(e) => handlePairChange(idx, 'translation', e.target.value)}
                style={{ width: 320, marginLeft: 8 }}
                placeholder="https://example.com/de/seite"
                required
              />
            </label>
            <button type="button" onClick={() => handleRemovePair(idx)} style={{ marginLeft: 12 }} disabled={pairs.length === 1}>
              Remove
            </button>
          </div>
        ))}
        <button type="button" onClick={handleAddPair} style={{ marginBottom: 16 }}>
          + Add Pair
        </button>
        <div style={{ marginBottom: 12 }}>
          <label>
            Similarity Threshold:
            <input
              type="number"
              min={0}
              max={1}
              step={0.01}
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              style={{ width: 60, marginLeft: 8 }}
            />
          </label>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Checking...' : 'Check Consistency'}
        </button>
      </form>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {results.length > 0 && (
        <>
          <button
            style={{ marginBottom: 16 }}
            onClick={() => exportResultsCSV(pairs, results, threshold)}
          >
            Export CSV
          </button>
          <table border={1} cellPadding={6} style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Original (Extracted)</th>
                <th>Translation (Extracted)</th>
                <th>Similarity</th>
                <th>Drift</th>
              </tr>
            </thead>
            <tbody>
              {results.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.original.slice(0, 120)}...</td>
                  <td>{row.translation.slice(0, 120)}...</td>
                  <td>{row.similarity.toFixed(2)}</td>
                  <td style={{ color: row.similarity < threshold ? 'red' : 'green' }}>
                    {row.similarity < threshold ? 'Drift' : 'OK'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
} 