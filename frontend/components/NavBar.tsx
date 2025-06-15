"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 24,
  padding: '16px 0',
  borderBottom: '1px solid #eee',
  marginBottom: 32,
};

const linkStyle: React.CSSProperties = {
  textDecoration: 'none',
  color: '#1976d2',
  fontWeight: 500,
  padding: '4px 8px',
  borderRadius: 4,
  transition: 'background 0.2s',
};

const activeStyle: React.CSSProperties = {
  background: '#e3f2fd',
  color: '#0d47a1',
};

export default function NavBar() {
  const pathname = usePathname();
  const links = [
    { href: '/', label: 'Home' },
    { href: '/clustering', label: 'Clustering' },
    { href: '/internal-links', label: 'Internal Links' },
    { href: '/localization', label: 'Localization' },
    { href: '/ai-readiness', label: 'AI Readiness' },
  ];
  return (
    <nav style={navStyle}>
      <span style={{ fontWeight: 700, fontSize: 20, color: '#0d47a1', marginRight: 32 }}>
        SEO Semantic Audit
      </span>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          style={{
            ...linkStyle,
            ...(pathname === link.href ? activeStyle : {}),
          }}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
