import React from "react";

function Footer() {
  return (
    <footer className="site-footer container" style={{ paddingTop: 18, paddingBottom: 18 }}>
      <p className="small" style={{ margin: 0 }}>
        © {new Date().getFullYear()} <b>MisinfoDetector</b>. Built by Session 13 Group 08.
      </p>
      <p className="small muted" style={{ margin: '6px 0 0 0' }}>
        COS30049 – Machine Learning Web Application | Swinburne University of Technology
      </p>
    </footer>
  );
}

export default Footer;
