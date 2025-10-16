import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  // navLinkClass removed in favor of theme-based classes

  return (
    <nav className="site-nav">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Link to="/" className="brand site-title">
              <span className="brand site-logo" style={{ marginRight: 10 }}>🔎</span>
              <span className="brand">MisinfoDetector</span>
            </Link>
          </div>

          <div className="desktop-menu" style={{ display: 'flex', gap: 8 }}>
            <NavLink to="/" className={({isActive})=> `nav-item ${isActive? 'active':''}`}>
              Home
            </NavLink>
            <NavLink to="/detector" className={({isActive})=> `nav-item ${isActive? 'active':''}`}>
              Detector
            </NavLink>
            <NavLink to="/insights" className={({isActive})=> `nav-item ${isActive? 'active':''}`}>
              Insights
            </NavLink>
            <NavLink to="/about" className={({isActive})=> `nav-item ${isActive? 'active':''}`}>
              About
            </NavLink>
          </div>

          <div className="mobile-toggle" style={{ display: 'none' }}>
            <button onClick={toggleMenu} aria-label="Toggle menu" style={{ background: 'transparent', border: 'none' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isOpen? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="mobile-menu" style={{ padding: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <NavLink to="/" className={({isActive})=> `nav-item ${isActive? 'active':''}`} onClick={toggleMenu}>Home</NavLink>
            <NavLink to="/detector" className={({isActive})=> `nav-item ${isActive? 'active':''}`} onClick={toggleMenu}>Detector</NavLink>
            <NavLink to="/insights" className={({isActive})=> `nav-item ${isActive? 'active':''}`} onClick={toggleMenu}>Insights</NavLink>
            <NavLink to="/about" className={({isActive})=> `nav-item ${isActive? 'active':''}`} onClick={toggleMenu}>About</NavLink>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
