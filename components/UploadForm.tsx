"use client";
import React, { useState } from 'react';
import { uploadFile } from '../utils/api';

interface Page {
  url: string;
  lang: string;
  content: string;
}

const UploadForm = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError(null);
    setPages([]);
    try {
      const result = await uploadFile(file);
      setPages(result);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
        <input type="file" accept=".xml,.html,.htm,.csv" onChange={handleFileChange} />
        <button type="submit" disabled={!file || loading} style={{ marginLeft: 8 }}>
          {loading ? 'Uploading...' : 'Upload'}
        </button>
      </form>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {pages.length > 0 && (
        <table border={1} cellPadding={6} style={{ width: '100%', marginTop: 16 }}>
          <thead>
            <tr>
              <th>URL</th>
              <th>Language</th>
              <th>Content Preview</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((page, idx) => (
              <tr key={idx}>
                <td>{page.url}</td>
                <td>{page.lang}</td>
                <td>{page.content.slice(0, 120)}...</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UploadForm; 
