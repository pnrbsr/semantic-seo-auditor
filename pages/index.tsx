import React from 'react';
import NavBar from '../components/NavBar';
import UploadForm from '../components/UploadForm';

export default function Home() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 32 }}>
      <NavBar />
      <h1>Semantic SEO Auditing Tool</h1>
      <UploadForm />
    </div>
  );
} 