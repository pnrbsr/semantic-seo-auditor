import React from 'react';

const NavBar = () => (
  <nav style={{ marginBottom: 24 }}>
    <a href="/" style={{ marginRight: 16 }}>Home</a>
    <a href="/clustering" style={{ marginRight: 16 }}>Clustering</a>
    <a href="/internal-links" style={{ marginRight: 16 }}>Internal Links</a>
    <a href="/localization" style={{ marginRight: 16 }}>Localization</a>
    <a href="/ai-readiness">AI Readiness</a>
  </nav>
);

export default NavBar;