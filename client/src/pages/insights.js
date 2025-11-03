import React, { useState, useEffect, useMemo } from 'react';
import {
  Container, Typography, Paper, Grid, Box, Card, CardContent,
  Select, MenuItem, FormControl, InputLabel, Button, CircularProgress, Tooltip as MuiTooltip,
  Stack, TextField
} from '@mui/material';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import topWordsData from "../components/top_words.json";
import topHashtagsData from '../components/top_hashtags.json';
import wordShiftData from '../components/word_shift.json';
import { getUserDistinctWords, saveUserDistinctWords, deleteUserDistinctWords } from '../components/userDistinctWords';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

// Simple inline WordCloud (absolute positioning, scrambled, collision-avoiding)
// now with accurate text measurement, improved collision avoidance and palettes per mode
const WordCloud = ({ words = [], mode = 'real', maxFont = 160, minFont = 18, padding = 28, globalMin = null, globalMax = null, seed = 1 }) => {
  const containerRef = React.useRef(null);
  const [placed, setPlaced] = React.useState([]);
  // mounted flag to drive enter animation
  const [mounted, setMounted] = React.useState(false);

  // simple seeded RNG (mulberry32)
  const rng = React.useMemo(() => {
    let t = seed >>> 0;
    return () => {
      t += 0x6D2B79F5;
      let r = Math.imul(t ^ t >>> 15, 1 | t);
      r ^= r + Math.imul(r ^ r >>> 7, 61 | r);
      return ((r ^ r >>> 14) >>> 0) / 4294967296;
    };
  }, [seed]);

  // helper measureWidth as before...
  const measureWidth = (text, fontSize, fontFamily = 'Roboto, Arial, sans-serif') => {
    const ctx = document.createElement('canvas').getContext('2d');
    ctx.font = `${fontSize}px ${fontFamily}`;
    return ctx.measureText(text).width;
  };

  // use global range if provided, otherwise fall back to per-cloud range
  const items = useMemo(() => {
    if (!words || !words.length) return [];
    const vals = words.map((w) => Math.abs(w.value ?? w.count ?? 1));
    const min = (globalMin !== null && globalMax !== null) ? Math.max(0.0001, globalMin) : Math.min(...vals);
    const max = (globalMin !== null && globalMax !== null) ? Math.max(globalMin, globalMax) : Math.max(...vals);
    const range = Math.max(0.0001, max - min);

    const mapped = words.map((w, i) => {
      const val = Math.abs(w.value ?? w.count ?? 1);
      const norm = (val - min) / range;
      // optionally use rank-based scaling here (see note)
      const fontSize = Math.round(minFont + Math.pow(Math.max(0, norm), 0.42) * (maxFont - minFont));
      const rotate = (rng() * 50 - 25); // use seeded RNG
      const colorSet = palettes[mode] || palettes.real;
      const color = colorSet[Math.floor(rng() * colorSet.length)];
      return {
        ...w,
        fontSize,
        rotate,
        displayCount: Number(w.count ?? w.value ?? 0),
        id: `${w.text}-${i}-${Math.round(rng()*1e6)}`,
        baseColor: color
      };
    });

    mapped.sort((a, b) => b.fontSize - a.fontSize || rng() - 0.5);
    return mapped;
  }, [words, maxFont, minFont, mode, globalMin, globalMax, rng]);

  // placement uses rng() for randomness instead of Math.random()
  React.useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const placeOnce = () => {
      // use the container's actual bounds (containerHeight above makes this larger)
      const W = Math.max(300, el.clientWidth - padding * 2);
      const H = Math.max(300, el.clientHeight - padding * 2);

      const placedBoxes = [];
      const out = [];

      const rectsOverlap = (a, b) =>
        !(a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y);

      const tryPlace = (it) => {
        // measure exact text width & height
        const textW = measureWidth(it.text, it.fontSize);
        const textH = Math.ceil(it.fontSize * 1.05);

        // compute rotated bbox size
        const theta = (it.rotate * Math.PI) / 180;
        const bboxW = Math.abs(textW * Math.cos(theta)) + Math.abs(textH * Math.sin(theta));
        const bboxH = Math.abs(textW * Math.sin(theta)) + Math.abs(textH * Math.cos(theta));

        const approxW = Math.min(W, Math.ceil(bboxW) + 8);
        const approxH = Math.min(H, Math.ceil(bboxH) + 6);

        // adaptive margin: smaller words tolerate smaller spacing, larger words get bigger margin
        const marginForWord = Math.max(6, Math.round(it.fontSize * 0.14));

        // try spiral / expanding radius placement centered
        const cx = padding + W / 2;
        const cy = padding + H / 2;
        const maxRadius = Math.hypot(W, H);
        let radius = 0;
        let angle = Math.random() * Math.PI * 2;
        const radiusStep = Math.max(6, Math.min(60, Math.min(W, H) / 18));

        for (let attempts = 0; attempts < 3500; attempts++) {
          const x = Math.round(cx + Math.cos(angle) * radius - approxW / 2);
          const y = Math.round(cy + Math.sin(angle) * radius - approxH / 2);
          const box = {
            x: Math.max(padding, Math.min(padding + W - approxW, x)),
            y: Math.max(padding, Math.min(padding + H - approxH, y)),
            w: approxW,
            h: approxH
          };

          // enforce adaptive margin between boxes
          const collided = placedBoxes.some((p) =>
            rectsOverlap({ x: p.x - marginForWord, y: p.y - marginForWord, w: p.w + marginForWord * 2, h: p.h + marginForWord * 2 }, box)
          );
          if (!collided) {
            placedBoxes.push(box);
            return { ...it, left: box.x, top: box.y, w: box.w, h: box.h };
          }

          // advance spiral
          angle += 0.45 + (Math.random() - 0.5) * 0.3;
          radius += radiusStep * (0.85 + Math.random() * 0.5);
          if (radius > maxRadius) radius = Math.random() * Math.min(W, H) / 2;
        }

        // fallback center stack (rare)
        const cxBox = Math.round(padding + W / 2 - approxW / 2 + (Math.random() - 0.5) * 40);
        const cyBox = Math.round(padding + H / 2 - approxH / 2 + placedBoxes.length * 8);
        const fb = { x: cxBox, y: cyBox, w: approxW, h: approxH };
        placedBoxes.push(fb);
        return { ...it, left: fb.x, top: fb.y, w: fb.w, h: fb.h };
      };

      for (const it of items) {
        out.push(tryPlace(it));
      }

      // relaxation: iterative repulsion to reduce overlaps
      const relaxIterations = 60;
      for (let iter = 0; iter < relaxIterations; iter++) {
        let moved = false;
        for (let i = 0; i < out.length; i++) {
          const a = out[i];
          const aCx = a.left + a.w / 2;
          const aCy = a.top + a.h / 2;
          for (let j = i + 1; j < out.length; j++) {
            const b = out[j];
            const bCx = b.left + b.w / 2;
            const bCy = b.top + b.h / 2;

            const dx = aCx - bCx;
            const dy = aCy - bCy;
            const absDx = Math.abs(dx);
            const absDy = Math.abs(dy);

            const overlapX = (a.w + b.w) / 2 - absDx;
            const overlapY = (a.h + b.h) / 2 - absDy;

            if (overlapX > 0 && overlapY > 0) {
              // overlap amount and direction
              const pushX = (overlapX + 1) * (dx === 0 ? (Math.random() - 0.5) : dx / (absDx || 1));
              const pushY = (overlapY + 1) * (dy === 0 ? (Math.random() - 0.5) : dy / (absDy || 1));

              // small step to separate (prevent runaway)
              const stepFactor = 0.35;
              const shiftAx = Math.round((pushX * stepFactor));
              const shiftAy = Math.round((pushY * stepFactor));
              const shiftBx = Math.round((-pushX * stepFactor));
              const shiftBy = Math.round((-pushY * stepFactor));

              // apply shifts
              a.left = Math.max(padding, Math.min(padding + W - a.w, a.left + shiftAx));
              a.top = Math.max(padding, Math.min(padding + H - a.h, a.top + shiftAy));
              b.left = Math.max(padding, Math.min(padding + W - b.w, b.left + shiftBx));
              b.top = Math.max(padding, Math.min(padding + H - b.h, b.top + shiftBy));

              moved = true;
            }
          }
        }
        if (!moved) break;
      }

      // final clamp and small jitter to avoid exact edges
      for (const o of out) {
        o.left = Math.max(padding, Math.min(padding + W - o.w, o.left + (Math.random() - 0.5) * 2));
        o.top = Math.max(padding, Math.min(padding + H - o.h, o.top + (Math.random() - 0.5) * 2));
      }

      setPlaced(out);
    };

    // After placement, trigger the enter animation (staggered) by toggling `mounted`.
    // Use next frame so initial render can pick up the 'entering' styles.
    placeOnce();
    setMounted(false);
    requestAnimationFrame(() => {
      // small delay to allow DOM update; stagger will handle per-word delays
      setTimeout(() => setMounted(true), 8);
    });

    // re-place on resize (debounced)
    const debounce = (fn, wait = 80) => {
      let t = null;
      return (...args) => {
        if (t) clearTimeout(t);
        t = setTimeout(() => fn(...args), wait);
      };
    };
    const ro = new ResizeObserver(debounce(() => placeOnce(), 120));
    ro.observe(el);
    window.addEventListener('orientationchange', debounce(() => placeOnce(), 160));
    return () => {
      ro.disconnect();
      window.removeEventListener('orientationchange', debounce(() => placeOnce(), 160));
    };
  }, [items, padding, mode]);

  return (
    <Box
      ref={containerRef}
      sx={{
        width: '100%',
        minHeight: 520,
        height: 520,
        position: 'relative',
        p: `${padding}px`,
        overflow: 'hidden',
        background: 'transparent',
      }}
    >
      {placed.length === 0 && (
        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="caption" color="text.secondary">Rendering cloud…</Typography>
        </Box>
      )}

      {placed.map((w, idx) => {
        const base = w.baseColor || (mode === 'fake' ? '#ef4444' : '#1976d2');
        const z = Math.min(9999, Math.round(w.fontSize * 10));
        // animation: stagger via transitionDelay; animate translateY + opacity while preserving rotation
        const baseTransform = `rotate(${w.rotate}deg)`;
        const enteringTransform = `translateY(24px) ${baseTransform} scale(0.96)`;
        const finalTransform = `${baseTransform} scale(1)`;
        const transitionDelay = `${idx * 28}ms`;

        return (
          <MuiTooltip
            key={w.id}
            title={`${w.text} — ${w.displayCount.toLocaleString()} occurrences`}
            arrow
          >
            <Box
              component="span"
              sx={{
                position: 'absolute',
                left: `${w.left}px`,
                top: `${w.top}px`,
                fontSize: `${w.fontSize}px`,
                color: base,
                opacity: mounted ? 1 : 0,
                transform: mounted ? finalTransform : enteringTransform,
                transition: 'transform 460ms cubic-bezier(0.22,1,0.36,1), opacity 360ms ease',
                transitionDelay,
                lineHeight: 1,
                cursor: 'default',
                userSelect: 'none',
                whiteSpace: 'nowrap',
                pointerEvents: 'auto',
                zIndex: z + idx
              }}
              aria-label={`${w.text} ${w.displayCount} occurrences`}
            >
              {w.text}
            </Box>
          </MuiTooltip>
        );
      })}
    </Box>
  );
};

// Replace/Add: HashtagBarChart component (independent controlled mode + scroll animation)
const HashtagBarChart = ({ data = { fake: [], real: [] }, mode = 'real', onModeChange = () => {} }) => {
  const [visible, setVisible] = React.useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  const list = (data?.topHashtags?.[mode] || []).slice(0, 10);
  const max = list.reduce((m, it) => Math.max(m, it.count || 0), 1);

  return (
    <Box ref={ref} sx={{ mt: 1 }}>
      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mb: 2 }}>
        <Button
          size="small"
          variant={mode === 'real' ? 'contained' : 'outlined'}
          onClick={() => onModeChange('real')}
        >
          Real
        </Button>
        <Button
          size="small"
          variant={mode === 'fake' ? 'contained' : 'outlined'}
          onClick={() => onModeChange('fake')}
        >
          Fake
        </Button>
      </Box>

      {list.length === 0 ? (
        <Typography variant="body2" color="text.secondary" align="center">No hashtags available</Typography>
      ) : (
        <Box sx={{ maxWidth: 920, mx: 'auto', px: 1 }}>
          {list.map((t, i) => {
            const pct = Math.round(((t.count || 0) / max) * 100);
            return (
              <Box key={t.tag || i} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Typography sx={{ width: 120, fontSize: 13 }} noWrap>
                  {i + 1}. {t.tag}
                </Typography>

                <Box sx={{ flex: 1, background: '#f1f3f5', height: 12, borderRadius: 8, overflow: 'hidden' }}>
                  <Box
                    sx={{
                      width: visible ? `${pct}%` : '0%',
                      height: '100%',
                      background: mode === 'fake'
                        ? 'linear-gradient(90deg,#ffb4a2,#ff7043)'
                        : 'linear-gradient(90deg,#90caf9,#1976d2)',
                      transition: `width 700ms cubic-bezier(0.2,0.8,0.2,1) ${i * 60}ms`
                    }}
                  />
                </Box>

                <Typography sx={{ width: 72, textAlign: 'right', fontSize: 13 }}>
                  {(t.count || 0).toLocaleString()}
                </Typography>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

// Replace/Add: WordShiftDiverging component (horizontal diverging bar chart using Chart.js)
const WordShiftDiverging = ({ data = {}, maxItems = 20, containerHeight = 480 }) => {
   const containerRef = React.useRef(null);
   const [visible, setVisible] = React.useState(false);
   const [mounted, setMounted] = React.useState(false); // only mount chart when in view

   React.useEffect(() => {
     const node = containerRef.current;
     if (!node) return;
     const io = new IntersectionObserver(
       (entries) => {
         if (entries[0].isIntersecting) {
           setVisible(true);
           setMounted(true);
           io.disconnect();
         }
       },
       { threshold: 0.2 }
     );
     io.observe(node);
     return () => io.disconnect();
   }, []);

   const { top_by_label = {} } = data || {};
   const realList = (top_by_label.real || []).map(d => ({ word: d.word, log_odds: Number(d.log_odds || 0), z: d.z, count: d.count_in_label || d.count || 0 }));
   const fakeList = (top_by_label.fake || []).map(d => ({ word: d.word, log_odds: Number(d.log_odds || 0), z: d.z, count: d.count_in_label || d.count || 0 }));

   const mapReal = React.useMemo(() => Object.fromEntries(realList.map(r => [r.word, r])), [realList]);
   const mapFake = React.useMemo(() => Object.fromEntries(fakeList.map(r => [r.word, r])), [fakeList]);

   const entries = React.useMemo(() => {
     const words = new Set([...realList.map(r => r.word), ...fakeList.map(f => f.word)]);
     const arr = Array.from(words).map(w => {
       const r = mapReal[w] || { log_odds: 0, z: 0, count: 0 };
       const f = mapFake[w] || { log_odds: 0, z: 0, count: 0 };
       return {
         word: w,
         real_log: r.log_odds || 0,
         fake_log: f.log_odds || 0,
         real_count: r.count || 0,
         fake_count: f.count || 0,
         real_z: r.z || 0,
         fake_z: f.z || 0,
         mag: Math.max(Math.abs(r.log_odds || 0), Math.abs(f.log_odds || 0))
       };
     });
     const top = arr.sort((a, b) => b.mag - a.mag).slice(0, maxItems);
     return top.reverse();
   }, [realList, fakeList, mapReal, mapFake, maxItems]);

   const labels = entries.map(e => e.word);
   const realValues = entries.map(e => e.real_log);
   const fakeValues = entries.map(e => -e.fake_log);
   const posMax = Math.max(0, ...realValues);
   const negMin = Math.min(0, ...fakeValues);
   const absMax = Math.max(Math.abs(negMin), Math.abs(posMax), 1);

   const chartData = React.useMemo(() => ({
     labels,
     datasets: [
       {
         label: 'Fake (left)',
         data: fakeValues,
         backgroundColor: 'rgba(255,112,67,0.9)',
         borderRadius: 6,
         barThickness: 12
       },
       {
         label: 'Real (right)',
         data: realValues,
         backgroundColor: 'rgba(25,118,210,0.9)',
         borderRadius: 6,
         barThickness: 12
       }
     ]
   }), [labels.join('|'), realValues.join(','), fakeValues.join(',')]);

   const options = React.useMemo(() => ({
     indexAxis: 'y',
     responsive: true,
     maintainAspectRatio: false,
     animation: {
       duration: 900,
       easing: 'cubicBezier(.22,.8,.2,1)'
     },
     scales: {
       x: {
         min: -absMax,
         max: absMax,
         ticks: { callback: v => Number(v).toFixed(2) },
         grid: { drawBorder: false }
       },
       y: { grid: { display: false }, ticks: { autoSkip: false } }
     },
     plugins: {
       legend: { position: 'top' },
       tooltip: {
         callbacks: {
           label: (ctx) => {
             const idx = ctx.dataIndex;
             const item = entries[idx];
             if (!item) return '';
             return ctx.dataset.label.startsWith('Real')
               ? `Real: ${item.real_log.toFixed(3)} (count: ${item.real_count}, z: ${item.real_z})`
               : `Fake: ${item.fake_log.toFixed(3)} (count: ${item.fake_count}, z: ${item.fake_z})`;
           },
           title: (items) => items && items.length ? entries[items[0].dataIndex].word : ''
         }
       }
     }
   }), [absMax, entries]);

   // allow numeric or percent string for height; normalize to CSS value
   const heightCss = typeof containerHeight === 'number' ? `${containerHeight}px` : containerHeight;

   return (
     <Box ref={containerRef} sx={{ mt: 2 }}>
       <Box
         sx={{
           height: heightCss,
           maxWidth: 980,
           mx: 'auto',
           opacity: visible ? 1 : 0.3,
           transition: 'opacity 420ms ease-in-out',
           overflow: 'hidden' // ensure inner chart can't overflow its container
         }}
       >
         {mounted ? <Bar data={chartData} options={options} /> : <Box sx={{ height: '100%' }} />}
       </Box>
     </Box>
   );
};

const Insights = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [misinformationStats, setMisinformationStats] = useState({
    total: 0,
    fake: 0,
    real: 0,
    accuracy: 0
  });
  // median length by category state
  const [categoryMedianData, setCategoryMedianData] = useState(null);
  const [loadingCategoryMedian, setLoadingCategoryMedian] = useState(true);

  // view mode toggle: 'your' (default) or 'our'
  const [viewMode, setViewMode] = useState('your');
  // --- end new state ---

  // word-cloud data state
  const [topWords, setTopWords] = useState({ real: [], fake: [] });
  const [loadingWords, setLoadingWords] = useState(false);
  const [wordsError, setWordsError] = useState(null);

  // which cloud to show when viewMode === 'our'
  const [cloudMode, setCloudMode] = useState('real');
  // bump this synchronously when toggling so WordCloud remounts immediately (no visible flash of old layout)
  const [cloudVersion, setCloudVersion] = useState(0);

  // Add state to hold fetched analysis history (near other useState calls)
  const [analysisItems, setAnalysisItems] = React.useState(null);

  // GET - load processed top words json
  useEffect(() => {
    const normalize = (arr) =>
      (arr || []).map((it) => {
        if (it && it.text) return { text: String(it.text), value: Number(it.value ?? it.count ?? 0) };
        if (it && typeof it.count === "number") return { text: "(unknown)", value: Number(it.count) };
        return null;
      }).filter(Boolean);

    try {
      const data = topWordsData || {};
      setTopWords({ real: normalize(data.real), fake: normalize(data.fake) });
      setWordsError(null);
    } catch (e) {
      console.warn("Failed to load topWordsData import, using fallback", e);
      setTopWords({
        real: [{ text: "vaccine", value: 2.4 }],
        fake: [{ text: "miracle", value: 2.1 }]
      });
      setWordsError(e.message || "import error");
    } finally {
      setLoadingWords(false);
    }
  }, []);

  // GET - Fetch real statistics from API
  const fetchStatistics = async () => {
    try {
      console.log('[Insights] fetching stats summary...');
      const response = await fetch('http://127.0.0.1:8000/history/stats/summary');
      if (response.ok) {
        const data = await response.json();
        setMisinformationStats({
          total: data.total_analyses ?? data.total ?? 0,
          fake: data.fake_count ?? data.fake ?? 0,
          real: data.real_count ?? data.real ?? 0,
          accuracy: Math.round((data.avg_confidence ?? data.accuracy ?? 0) * 100)
        });

        // If the stats endpoint includes actual items, capture them for BoxPlotPair
        const possibleItems = data.items || data.data || data.history || data.analyses || null;
        if (Array.isArray(possibleItems) && possibleItems.length) {
          console.log('[Insights] stats payload included history items, storing analysisItems (count=%d)', possibleItems.length);
          setAnalysisItems(possibleItems);
          return;
        }

        // Otherwise try safe list-style endpoints (avoid dynamic-id routes like /history/analyses which may expect an int)
        const tryListEndpoints = [
          'http://127.0.0.1:8000/history',
          '/history',
          '/history/list',
          '/history/all'
        ];
        for (const ep of tryListEndpoints) {
          try {
            const r = await fetch(ep);
            if (!r.ok) continue;
            const p = await r.json();
            const items = Array.isArray(p) ? p : (p.items || p.data || p.history || null);
            if (Array.isArray(items) && items.length) {
              console.log('[Insights] found history items at', ep, 'count=', items.length);
              setAnalysisItems(items);
              break;
            }
          } catch (e) {
            // ignore and try next
          }
        }
        return;
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
    // fallback sample
    setMisinformationStats({
      total: 1247,
      fake: 312,
      real: 935,
      accuracy: 87.3
    });
  };

  useEffect(() => {
    fetchStatistics();
    const interval = setInterval(fetchStatistics, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch analysis history and compute median message length per category
  useEffect(() => {
    const endpoints = [
      '/history/analyses',
      '/history/posts',
      '/history/records',
      '/history/history',
      'http://127.0.0.1:8000/history/analyses' // explicit fallback
    ];

    const fetchAndCompute = async () => {
      console.log('[Insights] start fetchAndCompute, endpoints=', endpoints);
      setLoadingCategoryMedian(true);
      let items = null;

      for (const ep of endpoints) {
        try {
          console.log('[Insights] trying', ep);
          const res = await fetch(ep, { credentials: 'same-origin' });
          console.log('[Insights] response', ep, res.status);
          if (!res.ok) {
            console.warn('[Insights] non-ok response', ep, res.status);
            continue;
          }
          const payload = await res.json();
          console.log('[Insights] payload sample from', ep, payload && (Array.isArray(payload) ? payload.slice(0,3) : payload.items ? payload.items.slice(0,3) : payload));
          if (Array.isArray(payload) && payload.length > 0) { items = payload; break; }
          if (payload && Array.isArray(payload.items) && payload.items.length > 0) { items = payload.items; break; }
          if (payload && Array.isArray(payload.data) && payload.data.length > 0) { items = payload.data; break; }
        } catch (err) {
          console.warn('[Insights] fetch error for', ep, err);
        }
      }

      if (!items) {
        console.warn('[Insights] No history items found; using fallback category data.');
        setCategoryMedianData(fallbackYourCategoryData);
        setLoadingCategoryMedian(false);
        return;
      }

      // Normalize fields and group lengths by category
      const groups = {};
      for (const it of items) {
        const category = (it.category || it.topic || it.label || it.tag || 'Unknown').toString();
        const text = (it.text || it.content || it.tweet || it.post || '').toString();
        const len = text.length;
        if (!groups[category]) groups[category] = [];
        groups[category].push(len);
      }

      const labels = Object.keys(groups).sort((a, b) => groups[b].length - groups[a].length);
      const medians = labels.map(label => {
        const arr = groups[label].slice().sort((x, y) => x - y);
        if (arr.length === 0) return 0;
        const m = Math.floor(arr.length / 2);
        return arr.length % 2 === 1 ? arr[m] : (arr[m - 1] + arr[m]) / 2;
      });

      const palette = labels.map((_, i) => `hsl(${(i * 37) % 360}deg 70% 55%)`);

      setCategoryMedianData({
        labels,
        datasets: [{
          label: 'Median message length (chars)',
          data: medians,
          backgroundColor: palette,
          borderWidth: 1
        }]
      });

      console.log('[Insights] setCategoryMedianData labels=', labels, 'medians=', medians.slice(0,10));
      setLoadingCategoryMedian(false);
    };

    fetchAndCompute();
  }, []);

  // === Dataset definitions (Your Insights) ===
  // categoryMedianData is populated from history; fallbackYourCategoryData is used if fetch fails
  const yourCategoryData = {
    labels: ['Politics', 'Health', 'Technology', 'Sports', 'Entertainment', 'Science'],
    datasets: [{
      label: 'Misinformation Cases',
      data: [45, 32, 18, 12, 25, 8],
      backgroundColor: [
        'rgba(255, 99, 132, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 205, 86, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(153, 102, 255, 0.8)',
        'rgba(255, 159, 64, 0.8)'
      ],
      borderWidth: 1
    }]
  };

  // Fallback dataset (used when API/history is unavailable)
  const fallbackYourCategoryData = {
    labels: ['Politics', 'Health', 'Technology', 'Sports', 'Entertainment', 'Science'],
    datasets: [{
      label: 'Median message length (chars)',
      data: [320, 264, 198, 152, 220, 180],
      backgroundColor: [
        'rgba(255, 99, 132, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 205, 86, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(153, 102, 255, 0.8)',
        'rgba(255, 159, 64, 0.8)'
      ],
      borderWidth: 1
    }]
  };

  const yourAccuracyData = {
    labels: ['Fake Detection', 'Real Detection'],
    datasets: [{
      data: [misinformationStats.fake, misinformationStats.real],
      backgroundColor: ['#FF6B6B', '#4ECDC4']
    }]
  };

  const yourTrendData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Fake Detected',
        data: [12, 19, 15, 25, 22, 18, 14],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.1
      },
      {
        label: 'Real Verified',
        data: [45, 52, 48, 61, 58, 55, 49],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1
      }
    ]
  };

  const yourConfidenceData = {
    labels: ['Very High (>0.9)', 'High (0.7-0.9)', 'Medium (0.5-0.7)', 'Low (<0.5)'],
    datasets: [{
      data: [45, 89, 67, 23],
      backgroundColor: ['#4CAF50', '#2196F3', '#FF9800', '#F44336'],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: false }
    },
  };

  // compute global min/max so both clouds scale the same
  const globalCounts = React.useMemo(() => {
    const all = [...(topWords.real || []), ...(topWords.fake || [])].map(w => Number(w.count ?? w.value ?? 0));
    const valid = all.filter(n => Number.isFinite(n) && n > 0);
    return {
      min: valid.length ? Math.min(...valid) : 0,
      max: valid.length ? Math.max(...valid) : 1
    };
  }, [topWords.real, topWords.fake]);

  // Update usage: create an independent hashtagMode state and pass it to HashtagBarChart
  // locate near top of component function (where cloudMode is defined) and add:
  const [hashtagMode, setHashtagMode] = React.useState(cloudMode === 'real' ? 'real' : 'fake');

  // --- added: compute median word lengths for Real vs Fake and top-3 distinctive words ---
  const computeMedian = (arr = []) => {
    if (!arr || arr.length === 0) return null;
    const a = arr.slice().sort((x, y) => x - y);
    const m = Math.floor(a.length / 2);
    return a.length % 2 === 1 ? a[m] : (a[m - 1] + a[m]) / 2;
  };

  const medianWordsByLabel = React.useMemo(() => {
    if (!Array.isArray(analysisItems) || analysisItems.length === 0) return { real: null, fake: null };

    const realWords = [];
    const fakeWords = [];

    for (const it of analysisItems) {
      const text = String(it.text || it.content || it.tweet || it.post || '');
      const words = text.split(/\s+/).filter(Boolean).length;

      const rawLabel = String(it.label || it.prediction || it.result || it.tag || '').toLowerCase();
      if (rawLabel.includes('fake') || rawLabel === '0' || rawLabel.includes('false') || it.is_fake === true || it.is_fake === 'true') {
        fakeWords.push(words);
      } else if (rawLabel.includes('real') || rawLabel === '1' || rawLabel.includes('true') || it.is_fake === false || it.is_fake === 'false') {
        realWords.push(words);
      } else if (typeof it.confidence === 'number') {
        (it.confidence < 0.5 ? fakeWords : realWords).push(words);
      }
    }

    return {
      real: computeMedian(realWords),
      fake: computeMedian(fakeWords)
    };
  }, [analysisItems]);

  const top3DistinctWords = React.useMemo(() => {
    // Prefer the same aggregation used by the SavedDistinctWordsPanel (word_contributions in history items).
    // Fallback to the token/log-odds based computation or the imported wordShiftData.
    const fromContribs = (items) => {
      if (!Array.isArray(items) || items.length === 0) return null;
      const agg = Object.create(null);
      for (const it of items) {
        const wc = it.word_contributions || it.wordContrib || it.wordContributions || it.word_contrib || null;
        if (!wc || typeof wc !== 'object') continue;
        for (const [rawWord, vRaw] of Object.entries(wc)) {
          const w = normalizeKey(rawWord);
          const v = Number(vRaw || 0);
          if (!w) continue;
          const absv = Math.abs(v);
          if (!Number.isFinite(absv) || absv === 0) continue;
          const cur = agg[w];
          if (!cur || absv > cur.maxAbs) {
            agg[w] = { word: w, maxAbs: absv, sign: Math.sign(v) || 1, count: (cur?.count || 0) + 1, sampleVal: v };
          } else {
            agg[w].count = (agg[w].count || 0) + 1;
          }
        }
      }
      const arr = Object.values(agg);
      if (!arr.length) return null;
      arr.sort((a, b) => b.maxAbs - a.maxAbs);
      return arr.slice(0, 3).map(r => r.word);
    };

    // try using explicit word_contributions from analysisItems / history (should match SavedDistinctWordsPanel)
    const fromHistoryContribs = fromContribs(analysisItems || []);
    if (fromHistoryContribs && fromHistoryContribs.length) return fromHistoryContribs;

    // fallback: token/log-odds-based (existing behaviour)
    const computeFromItems = (items) => {
      if (!Array.isArray(items) || items.length === 0) return null;
      const tokenize = (s = '') => (String(s).toLowerCase().match(/\b[a-z0-9']+\b/g) || []);
      const cntReal = {}, cntFake = {};
      let totalReal = 0, totalFake = 0;

      for (const it of items) {
        const rawLabel = String(it.label || it.prediction || it.result || it.tag || '').toLowerCase();
        let label = null;
        if (rawLabel.includes('fake') || rawLabel === '0' || rawLabel.includes('false') || it.is_fake === true || it.is_fake === 'true') label = 'fake';
        else if (rawLabel.includes('real') || rawLabel === '1' || rawLabel.includes('true') || it.is_fake === false || it.is_fake === 'false') label = 'real';
        else if (typeof it.confidence === 'number') label = it.confidence < 0.5 ? 'fake' : 'real';
        if (!label) continue;

        const toks = Array.from(new Set(tokenize(it.text || it.content || it.tweet || it.post || '')));
        for (const w of toks) {
          if (label === 'real') { cntReal[w] = (cntReal[w] || 0) + 1; totalReal++; }
          else { cntFake[w] = (cntFake[w] || 0) + 1; totalFake++; }
        }
      }

      totalReal = Math.max(1, totalReal);
      totalFake = Math.max(1, totalFake);
      const prior = 0.01;
      const results = [];

      const allWords = new Set([...Object.keys(cntReal), ...Object.keys(cntFake)]);
      for (const w of allWords) {
        const A = (cntReal[w] || 0) + prior;
        const B = (cntFake[w] || 0) + prior;
        const oddsA = A / Math.max(1e-9, (totalReal - A));
        const oddsB = B / Math.max(1e-9, (totalFake - B));
        const logodds = Math.log(Math.max(1e-9, oddsA / oddsB));
        results.push({ word: w, score: Math.abs(logodds), logodds, cntReal: cntReal[w] || 0, cntFake: cntFake[w] || 0 });
      }

      results.sort((a, b) => b.score - a.score);
      return results.slice(0, 3).map(r => r.word);
    };

    const fromHistoryTokens = computeFromItems(analysisItems || []);
    if (fromHistoryTokens && fromHistoryTokens.length) return fromHistoryTokens;

    // final fallback: imported word_shift.json (unchanged behaviour)
    const byLabel = wordShiftData?.top_by_label || {};
    const all = [...(byLabel.real || []), ...(byLabel.fake || [])].map(w => ({
      word: String(w.word || '').toLowerCase(),
      score: Math.abs(Number(w.log_odds || w.score || 0))
    })).filter(w => w.word);

    const map = new Map();
    for (const w of all) {
      const cur = map.get(w.word);
      if (!cur || w.score > cur.score) map.set(w.word, w);
    }
    return Array.from(map.values()).sort((a, b) => b.score - a.score).slice(0, 3).map(x => x.word);
  }, [analysisItems, wordShiftData]);

  // --- add: simple SVG BoxPlotPair component (no external chart plugin) ---
  const BoxPlotPair = ({ endpoints, items: providedItems = null }) => {
    const [loading, setLoading] = React.useState(true);
    const [groups, setGroups] = React.useState({ real: [], fake: [] });
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
      let mounted = true;
      const fetchItems = async () => {
        setLoading(true);
        const items = providedItems || await (async () => {
          for (const ep of endpoints) {
            try {
              const res = await fetch(ep, { credentials: 'same-origin' });
              if (!res.ok) continue;
              const payload = await res.json();
              if (Array.isArray(payload) && payload.length) return payload;
              if (payload && Array.isArray(payload.items) && payload.items.length) return payload.items;
              if (payload && Array.isArray(payload.data) && payload.data.length) return payload.data;
            } catch (e) { /* try next */ }
          }
          return null;
        })();
        if (!mounted) return;
        if (!items) {
          setError('No history available');
          setLoading(false);
          return;
        }

        const g = { real: [], fake: [] };
        for (const it of items) {
          const text = String(it.text || it.content || it.tweet || it.post || '');
          const words = text.split(/\s+/).filter(Boolean).length;
          const rawLabel = String(it.label || it.prediction || it.result || it.tag || '').toLowerCase();
          if (rawLabel.includes('fake') || rawLabel === '0' || rawLabel.includes('false')) {
            g.fake.push(words);
          } else if (rawLabel.includes('real') || rawLabel === '1' || rawLabel.includes('true')) {
            g.real.push(words);
          } else if (it.is_fake === true || it.is_fake === 'true') {
            g.fake.push(words);
          } else if (it.is_fake === false || it.is_fake === 'false') {
            g.real.push(words);
          } else if (typeof it.confidence === 'number') {
            (it.confidence < 0.5 ? g.fake : g.real).push(words);
          }
        }
        setGroups(g);
        setLoading(false);
      };
      fetchItems();
      return () => { mounted = false; };
    }, [endpoints, providedItems]);

    const computeStats = (arr) => {
      if (!arr || arr.length === 0) return null;
      const a = arr.slice().sort((x,y) => x - y);
      const n = a.length;
      const q = (i) => {
        const p = i * (n - 1);
        const lo = Math.floor(p), hi = Math.ceil(p);
        if (lo === hi) return a[lo];
        return a[lo] * (hi - p) + a[hi] * (p - lo);
      };
      return {
        min: a[0],
        q1: q(0.25),
        median: q(0.5),
        q3: q(0.75),
        max: a[a.length - 1],
        count: n
      };
    };

    const sReal = computeStats(groups.real);
    const sFake = computeStats(groups.fake);
    const hasData = !!(sReal || sFake);

    // narrow the native SVG coordinate width so it fits the two-column grid
    const width = 560, height = 240, pad = 56;
    // y positions: Real on top, Fake below
    const topY = pad + (height - pad * 2) * 0.25;
    const bottomY = pad + (height - pad * 2) * 0.75;

    const vals = [
      ...(sReal ? [sReal.min, sReal.max] : []),
      ...(sFake ? [sFake.min, sFake.max] : [])
    ].filter(v => Number.isFinite(v));
    const globalMin = vals.length ? Math.max(0, Math.min(...vals)) : 0;
    const globalMax = vals.length ? Math.max(...vals) : 1;
    const scaleX = (v) => {
      if (!Number.isFinite(v)) return pad;
      const t = (v - globalMin) / Math.max(1e-6, (globalMax - globalMin));
      return pad + t * (width - pad * 2);
    };

    const boxH = 32;

    // compute nice ticks (5 ticks)
    const ticksCount = 5;
    const ticks = [];
    for (let i = 0; i < ticksCount; i++) {
      const val = globalMin + (globalMax - globalMin) * (i / (ticksCount - 1));
      ticks.push(Math.round(val));
    }

    return (
      <Box sx={{ textAlign: 'center', p: 1 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 2, fontWeight: 'bold' }}>
          Message length distribution (words)
        </Typography>


        

        {loading ? (
          <Box sx={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : error || !hasData ? (
          <Box sx={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
            <Typography color="text.secondary">No historical labelled posts found.</Typography>
            <Typography variant="caption" color="text.secondary">Ensure history API is available or upload labelled data.</Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            {/* make SVG width responsive to parent box so it scales inside grid column */}
            <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" role="img" aria-label="Horizontal box plots for real and fake message lengths">
              {/* axis base line */}
              <line x1={pad} x2={width - pad} y1={height - 18} y2={height - 18} stroke="#e6e6e6" strokeWidth="1" />

              {/* axis ticks and labels */}
              {ticks.map((t, i) => {
                const x = pad + (i / (ticks.length - 1)) * (width - pad * 2);
                return (
                  <g key={i}>
                    <line x1={x} x2={x} y1={height - 24} y2={height - 14} stroke="#ddd" strokeWidth="1" />
                    <text x={x} y={height - 4} fontSize="11" textAnchor="middle" fill="#666">{t}</text>
                  </g>
                );
              })}

              {/* Real (top) horizontal box */}
              {sReal && <>
                <line x1={scaleX(sReal.min)} x2={scaleX(sReal.max)} y1={topY} y2={topY} stroke="#1976d2" strokeWidth="2" />
                <line x1={scaleX(sReal.min)} x2={scaleX(sReal.min)} y1={topY - 10} y2={topY + 10} stroke="#1976d2" strokeWidth="2" />
                <line x1={scaleX(sReal.max)} x2={scaleX(sReal.max)} y1={topY - 10} y2={topY + 10} stroke="#1976d2" strokeWidth="2" />
                <rect x={scaleX(sReal.q1)} y={topY - boxH/2} width={Math.max(2, scaleX(sReal.q3) - scaleX(sReal.q1))} height={boxH} fill="rgba(25,118,210,0.12)" stroke="rgba(25,118,210,0.95)" rx="6" />
                <line x1={scaleX(sReal.median)} x2={scaleX(sReal.median)} y1={topY - boxH/2} y2={topY + boxH/2} stroke="rgba(25,118,210,0.95)" strokeWidth="3" />
                {/* label left of plot (no n) */}
                <text x={pad - 12} y={topY + 5} fontSize="12" textAnchor="end" fill="#333">Real</text>
                {/* median annotation above median line */}
                <text x={scaleX(sReal.median)} y={topY - boxH/2 - 8} fontSize="11" textAnchor="middle" fill="#1976d2">med: {Math.round(sReal.median)}</text>
              </>}

              {/* Fake (bottom) horizontal box */}
              {sFake && <>
                <line x1={scaleX(sFake.min)} x2={scaleX(sFake.max)} y1={bottomY} y2={bottomY} stroke="#ff7043" strokeWidth="2" />
                <line x1={scaleX(sFake.min)} x2={scaleX(sFake.min)} y1={bottomY - 10} y2={bottomY + 10} stroke="#ff7043" strokeWidth="2" />
                <line x1={scaleX(sFake.max)} x2={scaleX(sFake.max)} y1={bottomY - 10} y2={bottomY + 10} stroke="#ff7043" strokeWidth="2" />
                <rect x={scaleX(sFake.q1)} y={bottomY - boxH/2} width={Math.max(2, scaleX(sFake.q3) - scaleX(sFake.q1))} height={boxH} fill="rgba(255,112,67,0.12)" stroke="rgba(255,112,67,0.95)" rx="6" />
                <line x1={scaleX(sFake.median)} x2={scaleX(sFake.median)} y1={bottomY - boxH/2} y2={bottomY + boxH/2} stroke="rgba(255,112,67,0.95)" strokeWidth="3" />
                <text x={pad - 12} y={bottomY + 5} fontSize="12" textAnchor="end" fill="#333">Fake</text>
                <text x={scaleX(sFake.median)} y={bottomY - boxH/2 - 8} fontSize="11" textAnchor="middle" fill="#ff7043">med: {Math.round(sFake.median)}</text>
              </>}

            </svg>
          </Box>
        )}
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          Box shows Q1–Q3 with median; whiskers show min/max. Values are word counts per post.
        </Typography>
      </Box>
    );
  };
  // --- end added component ---

  return (
    <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 }, py: 3 }}>
      {/* top text-only toggle ABOVE main title */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mb: 2 }}>
        <Button
          onClick={() => setViewMode('your')}
          variant="text"
          sx={{
            textTransform: 'none',
            color: viewMode === 'your' ? 'primary.main' : 'text.secondary',
            fontWeight: viewMode === 'your' ? 700 : 500,
            borderRadius: 0
          }}
        >
          Your Insights
        </Button>
        <Button
          onClick={() => setViewMode('our')}
          variant="text"
          sx={{
            textTransform: 'none',
            color: viewMode === 'our' ? 'primary.main' : 'text.secondary',
            fontWeight: viewMode === 'our' ? 700 : 500,
            borderRadius: 0
          }}
        >
          Our Findings
        </Button>
      </Box>

      {/* Header */}
      {viewMode !== 'our' ? (
        <Paper elevation={3} sx={{ p: { xs: 3, sm: 4, md: 5 }, mb: 2, textAlign: 'center' }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Detection Insights & Analytics
          </Typography>
          <Typography variant="h6" color="text.secondary" paragraph>
            Data-driven insights into misinformation patterns and detection performance
          </Typography>
        </Paper>
      ) : (
        <Paper elevation={3} sx={{ p: { xs: 3, sm: 4 }, mb: 2, textAlign: 'center' }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Our Findings
          </Typography>
          <Typography variant="h6" color="text.secondary" paragraph>
            Key takeaways from an aggregate analysis of 154,798 posts — summarising prevailing themes,
            the most influential terms, and notable detection patterns.
          </Typography>
        </Paper>
      )}

      {/* If "Our Findings" selected, show only word cloud and stop */}
      {viewMode === 'our' ? (
        <Paper
          elevation={0}
          square
          sx={{
            p: 3,
            mb: 4,
            minHeight: 1240,
            width: '100vw',
            position: 'relative',
            left: '50%',
            right: '50%',
            marginLeft: '-50vw',
            marginRight: '-50vw',
            boxSizing: 'border-box',
            backgroundClip: 'padding-box',
            borderBottom: 'none',         // remove parent bottom border
            boxShadow: 'none'             // remove any shadow that looks like a line
          }}
        >
          <Typography variant="h5" align="center" sx={{ mb: 2, fontWeight: 700 }}>
            {cloudMode === 'fake' ? 'Most Common Words in Fake Posts' : 'Most Common Words in Real Posts'}
          </Typography>

          {/* subtitle telling user hover behaviour */}
          <Typography
            variant="subtitle2"
            align="center"
            color="text.secondary"
            sx={{ mb: 2, fontStyle: 'italic' }}
          >
            (hover to reveal occurrences)
          </Typography>

          {/* toggle between real / fake word cloud */}
          <Box sx={{ display: 'flex', gap: 2, mb: 2, justifyContent: 'center' }}>
            <Button
              onClick={() => {
                setCloudMode('real');
                setCloudVersion((v) => v + 1);
              }}
              variant="text"
              sx={{
                textTransform: 'none',
                color: cloudMode === 'real' ? 'primary.main' : 'text.secondary',
                fontWeight: cloudMode === 'real' ? 700 : 500,
                borderRadius: 0
              }}
            >
              Top Real Words
            </Button>
            <Button
              onClick={() => {
                setCloudMode('fake');
                setCloudVersion((v) => v + 1);
              }}
              variant="text"
              sx={{
                textTransform: 'none',
                color: cloudMode === 'fake' ? 'primary.main' : 'text.secondary',
                fontWeight: cloudMode === 'fake' ? 700 : 500,
                borderRadius: 0
              }}
            >
              Top Fake Words
            </Button>
          </Box>

          {/* stack the two boxes as siblings */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* WordCloud box */}
            <Paper elevation={0} square sx={{ p: 3, mb: 0, bgcolor: 'background.paper', boxShadow: 'none' }}>
              {loadingWords ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <WordCloud
                  key={`${cloudMode}-${cloudVersion}`}
                  words={cloudMode === 'real' ? topWords.real : topWords.fake}
                  mode={cloudMode}
                  globalMin={globalCounts.min}
                  globalMax={globalCounts.max}
                  seed={cloudMode === 'real' ? 1234567 : 7654321}
                />
              )}
            </Paper>

            {/* Hashtag Chart box (sibling of WordCloud) */}
            <Paper elevation={0} square sx={{ p: 3, minHeight: 340, boxShadow: 'none', borderTop: 'none' }}>
              <Typography variant="h6" align="center" sx={{ mb: 1, fontWeight: 700 }}>
                {cloudMode === 'real' ? 'Most popular hashtags in Real posts' : 'Most popular hashtags in Fake posts'}
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
                Top hashtags extracted from the analysed dataset — toggle between Real and Fake.
              </Typography>

              <HashtagBarChart
                data={topHashtagsData}
                mode={hashtagMode}
                onModeChange={(m) => {
                  setHashtagMode(m);
                  // do NOT change cloudMode here — toggles are independent
                }}
                key={`hashtags-chart-${hashtagMode}-${cloudVersion}`}
              />

              {/* Word‑shift / Log‑odds diverging chart (placed under the hashtag bar graph) */}
              <Box sx={{ mt: 3 }}>
                <Paper elevation={0} square sx={{ p: 2, bgcolor: 'background.paper' }}>
                  <Typography variant="h6" align="center" sx={{ mb: 1, fontWeight: 700 }}>
                    Distinctive words (Word‑shift / Log‑odds)
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
                    Words most over‑represented in Real vs Fake posts. The number shown is the log‑odds score — larger absolute values mean a stronger association with that label.
                  </Typography>
                  <WordShiftDiverging data={wordShiftData} initialMode={hashtagMode === 'real' ? 'real' : 'fake'} />
                </Paper>
              </Box>
            </Paper>
          </Box>
        </Paper>
      ) : (
        <>
          {/* Key Statistics */}
          <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
            Key Statistics
          </Typography>
          <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: 3 }} justifyContent="center">
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ textAlign: 'center', height: '100%' }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Typography color="text.secondary" gutterBottom variant="h6">
                    Total Analyzed
                  </Typography>
                  <Typography variant="h3" component="div" color="primary.main" sx={{ fontWeight: 'bold' }}>
                    {misinformationStats.total.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ textAlign: 'center', height: '100%' }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Typography color="text.secondary" gutterBottom variant="h6">
                    Fake Detected
                  </Typography>
                  <Typography variant="h3" component="div" color="error.main" sx={{ fontWeight: 'bold' }}>
                    {misinformationStats.fake}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ textAlign: 'center', height: '100%' }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Typography color="text.secondary" gutterBottom variant="h6">
                    Real Verified
                  </Typography>
                  <Typography variant="h3" component="div" color="success.main" sx={{ fontWeight: 'bold' }}>
                    {misinformationStats.real}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ textAlign: 'center', height: '100%' }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Typography color="text.secondary" gutterBottom variant="h6">
                    Accuracy
                  </Typography>
                  <Typography variant="h3" component="div" color="primary.main" sx={{ fontWeight: 'bold' }}>
                    {Number(misinformationStats.accuracy).toFixed(2)}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Time Range Selector */}
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Time Range</InputLabel>
              <Select
                value={timeRange}
                label="Time Range"
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <MenuItem value="day">Last Day</MenuItem>
                <MenuItem value="week">Last Week</MenuItem>
                <MenuItem value="month">Last Month</MenuItem>
                <MenuItem value="year">Last Year</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Charts Section */}
          <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
            Analytics Dashboard
          </Typography>
          <Grid container spacing={{ xs: 3, md: 4 }} sx={{ mb: 6 }} justifyContent="center" alignItems="stretch">
            {/* Row 1: Message length distribution (BoxPlotPair) | ConfidenceDistribution */}
            <Grid item xs={12} lg={6}>
              <Paper sx={{ p: { xs: 3, sm: 4 }, textAlign: 'center', height: 520, boxSizing: 'border-box', overflow: 'hidden' }}>
                <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {/* constrain width to match reduced SVG width so the two columns fit side-by-side */}
                  <Box sx={{ width: '100%', maxWidth: 500 }}>
                    <BoxPlotPair
                       endpoints={[
                         '/history/analyses',
                         '/history/posts',
                         '/history/records',
                         '/history/history',
                         'http://127.0.0.1:8000/history/analyses'
                       ]}
                       items={analysisItems}
                     />
                   </Box>
                 </Box>
               </Paper>
             </Grid>

            <Grid item xs={12} lg={6}>
              <Paper sx={{ p: { xs: 3, sm: 4 }, textAlign: 'center', height: 520, boxSizing: 'border-box', overflow: 'hidden' }}>
                <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ConfidenceDistribution items={analysisItems} />
                </Box>
              </Paper>
            </Grid>

            {/* Row 2: Detection Ratio | Top 10 Distinctive words */}
            <Grid item xs={12} lg={6}>
              <Paper sx={{ p: { xs: 3, sm: 4 }, textAlign: 'center', height: 520, boxSizing: 'border-box', overflow: 'hidden' }}>
                <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
                  Detection Ratio
                </Typography>
                <Box sx={{ height: 420, display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                  <Box sx={{ width: 360, height: '100%' }}>
                    <Pie data={yourAccuracyData} options={{ ...chartOptions, maintainAspectRatio: false }} style={{ height: '100%' }} />
                  </Box>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} lg={6}>
              <Paper sx={{ p: { xs: 3, sm: 4 }, textAlign: 'center', height: 520, boxSizing: 'border-box', overflow: 'hidden' }}>
                <Typography variant="h5" gutterBottom sx={{ mb: -4, fontWeight: 'bold' }}>
                  Top 10 Distinctive words 
                </Typography>
                <Box sx={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                  <Box sx={{ width: 360, height: '100%' }}>
                    <SavedDistinctWordsPanel userId="anon" maxItems={10} />
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Insights Summary */}
          <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
            Key Insights
          </Typography>
          <Paper sx={{ p: { xs: 3, sm: 4 }, mb: 4, textAlign: 'center' }}>
            <Grid container spacing={4} justifyContent="center">
              {/* swapped: Detection performance first, then Message lengths */}
               <Grid item xs={12} md={6}>
                <Box sx={{ p: 2 }}>
                  <Typography variant="h5" gutterBottom color="primary" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Detection performance
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.8, fontSize: '1.05rem' }}>
                    Processed <strong>{misinformationStats.total?.toLocaleString() ?? '0'}</strong> posts — <strong>{misinformationStats.fake ?? 0}</strong> labelled
                    fake and <strong>{misinformationStats.real ?? 0}</strong> labelled real. Model accuracy (median confidence) is
                    approximately <strong>{Number(misinformationStats.accuracy ?? 0).toFixed(1)}%</strong>. See the Confidence Distribution
                    and Detection Ratio charts for how prediction confidence and label split contribute to this result.
                  </Typography>
                </Box>
               </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2 }}>
                  <Typography variant="h5" gutterBottom color="primary" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Message lengths (words)
                  </Typography>
                  { /* show computed medians (words) and simple comparison + top-3 distinct words */ }
                  { (medianWordsByLabel.real != null || medianWordsByLabel.fake != null) ? (
                    <Typography variant="body1" sx={{ lineHeight: 1.8, fontSize: '1.05rem' }}>
                      Historical labelled posts show median message lengths of approximately
                      {medianWordsByLabel.real != null ? ` ${Math.round(medianWordsByLabel.real)} words (Real)` : ''}
                      {medianWordsByLabel.fake != null ? ` and ${Math.round(medianWordsByLabel.fake)} words (Fake)` : ''}.
                      In this dataset Fake posts are { (medianWordsByLabel.fake != null && medianWordsByLabel.real != null)
                        ? (medianWordsByLabel.fake > medianWordsByLabel.real ? 'longer' : (medianWordsByLabel.fake < medianWordsByLabel.real ? 'shorter' : 'similar in length'))
                        : 'not directly comparable' } than Real posts.
                      The three most distinctive words across the corpus are: <strong>{top3DistinctWords.join(', ') || 'n/a'}</strong>.
                    </Typography>
                  ) : (
                    <Typography variant="body1" sx={{ lineHeight: 1.8, fontSize: '1.05rem' }}>
                      Median message lengths (in words) are shown in the box plot above. If no historical data is available a fallback sample is used.
                    </Typography>
                  )}
                </Box>
               </Grid>
            </Grid>
          </Paper>
        </>
      )}
    </Container>
  );
};

export default Insights;

// palettes used by WordCloud (define at module scope so ESLint sees it)
const palettes = {
  real: ['#5ca6b0ff', '#6ad5caff', '#80DEEA', '#4DD0E1', '#26C6DA', '#00BCD4', '#81D4FA', '#6bc4edff'],
  fake: ['#c29245ff', '#eaa647ff', '#FFCC80', '#FFAB40', '#FF7043', '#FF5722', '#F4511E', '#ce1414ff']
};

// -----------------------------
// WordCloud: darken palette colors so they read on white bg
// -----------------------------
// small helper to darken a hex color by a percent (0-100)
function darkenHex(hex, percent) {
  try {
    const h = hex.replace('#', '');
    const r = Math.max(0, Math.min(255, parseInt(h.substring(0, 2), 16)));
    const g = Math.max(0, Math.min(255, parseInt(h.substring(2, 4), 16)));
    const b = Math.max(0, Math.min(255, parseInt(h.substring(4, 6), 16)));
    const factor = (100 - percent) / 100;
    const rr = Math.round(r * factor);
    const gg = Math.round(g * factor);
    const bb = Math.round(b * factor);
    const toHex = (v) => v.toString(16).padStart(2, '0');
    return `#${toHex(rr)}${toHex(gg)}${toHex(bb)}`;
  } catch (e) {
    return hex;
  }
}

// --- added: normalizeKey used by multiple panels (module scope) ---
const normalizeKey = (k) => String(k || '').toLowerCase().trim();
// --- end added --- 

// --- add: ConfidenceDistribution component (exclude Low <0.5 bucket) ---
const ConfidenceDistribution = ({ items = null }) => {
  const extractConfidence = (it) => {
    if (!it) return null;
    const keys = ['confidence','score','probability','pred_confidence','prediction_confidence','confidence_score','pred_score'];
    for (const k of keys) {
      if (k in it && it[k] != null) {
        let v = Number(it[k]);
        if (Number.isNaN(v)) continue;
        if (v > 1) v = v / 100;
        if (v < 0) v = null;
        return v;
      }
    }
    try {
      if (it.prediction && typeof it.prediction === 'object' && it.prediction.confidence != null) {
        let v = Number(it.prediction.confidence);
        if (!Number.isNaN(v)) { if (v > 1) v = v/100; return v; }
      }
    } catch(e){}
    return null;
  };

  const compute = React.useMemo(() => {
    // only three buckets: veryHigh (>0.9), high (0.7-0.9], medium [0.5-0.7]
    const bins = { veryHigh: 0, high: 0, medium: 0 };
    if (!items || !Array.isArray(items) || items.length === 0) {
      // fallback sample for three buckets
      return { labels: ['Very High (>0.9)','High (0.7-0.9)','Medium (0.5-0.7)'], values: [20,15,40], percent: [29,21,50] };
    }
    for (const it of items) {
      const v = extractConfidence(it);
      if (v == null || !Number.isFinite(v)) continue;
      if (v > 0.9) bins.veryHigh++;
      else if (v > 0.7) bins.high++;
      else if (v >= 0.5) bins.medium++;
      // values < 0.5 are intentionally excluded
    }
    const totalShown = bins.veryHigh + bins.high + bins.medium || 1;
    return {
      labels: ['Very High (>0.9)','High (0.7-0.9)','Medium (0.5-0.7)'],
      values: [bins.veryHigh, bins.high, bins.medium],
      percent: [Math.round(100*bins.veryHigh/totalShown), Math.round(100*bins.high/totalShown), Math.round(100*bins.medium/totalShown)]
    };
  }, [items]);

  const data = {
    labels: compute.labels,
    datasets: [{
      data: compute.values,
      backgroundColor: ['#2e7d32','#1976d2','#ffb300'],
      borderWidth: 1
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const val = ctx.raw;
            const i = ctx.dataIndex;
            const pct = compute.percent ? ` (${compute.percent[i]}%)` : '';
            return `${ctx.label}: ${val}${pct}`;
          }
        }
      }
    }
  };

  return (
    <Box sx={{ textAlign: 'center', height: 320 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 2, fontWeight: 'bold' }}>
        Confidence Distribution 
      </Typography>
      <Box sx={{ height: 220 }}>
        <Doughnut data={data} options={options} />
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
      </Typography>
    </Box>
  );
};
// --- end component ---

// --- add: UserWordShiftPanel (top-N most DISTINCT words via log-odds) ---
const UserWordShiftPanel = ({ items = [], topN = 10 }) => {
  const [input, setInput] = React.useState('');
  const [dataReady, setDataReady] = React.useState(null);

  const tokenize = (s = '') => (String(s).toLowerCase().match(/\b[a-z0-9']+\b/g) || []);
  const getLabel = (it) => {
    const raw = String(it.label || it.result || it.prediction || it.tag || '').toLowerCase();
    if (raw.includes('fake') || raw === '0' || raw.includes('false')) return 'fake';
    if (raw.includes('real') || raw === '1' || raw.includes('true')) return 'real';
    if (it.is_fake === true || it.is_fake === 'true') return 'fake';
    if (it.is_fake === false || it.is_fake === 'false') return 'real';
    return null;
  };

  // compute counts and log-odds for all words in history, return top-N by abs(logodds)
  const topDistinctWordsFromHistory = React.useCallback((N = topN, minCount = 2) => {
    if (!Array.isArray(items) || items.length === 0) return [];
    const cntReal = {}, cntFake = {};
    let totalReal = 0, totalFake = 0;

    for (const it of items) {
      const label = getLabel(it);
      if (!label) continue;
      const toks = Array.from(new Set(tokenize(it.text || it.content || it.tweet || it.post || '')));
      for (const w of toks) {
        if (label === 'real') { cntReal[w] = (cntReal[w] || 0) + 1; totalReal++; }
        else if (label === 'fake') { cntFake[w] = (cntFake[w] || 0) + 1; totalFake++; }
      }
    }

    totalReal = Math.max(totalReal, 1);
    totalFake = Math.max(totalFake, 1);
    const prior = 0.01;
    const allWords = new Set([...Object.keys(cntReal), ...Object.keys(cntFake)]);
    const results = [];

    for (const w of allWords) {
      const sum = (cntReal[w] || 0) + (cntFake[w] || 0);
           if (sum < minCount) continue; // skip rare words
      const A = (cntReal[w] || 0) + prior;
      const B = (cntFake[w] || 0) + prior;
      const oddsA = A / Math.max(1e-9, (totalReal - A));
      const oddsB = B / Math.max(1e-9, (totalFake - B));
      const logodds = Math.log(Math.max(1e-9, oddsA / oddsB));
      results.push({ word: w, logodds, countReal: cntReal[w]||0, countFake: cntFake[w]||0, sum });
    }

    results.sort((a, b) => Math.abs(b.logodds) - Math.abs(a.logodds));
    return results.slice(0, N);
  }, [items, topN]);

  const computeLogOddsForList = React.useCallback((wordsList) => {
    if (!Array.isArray(items) || items.length === 0 || !wordsList || wordsList.length === 0) return null;
    const all = topDistinctWordsFromHistory(items.length, 1);
    const map = new Map(all.map(r => [r.word, r]));
    const filtered = wordsList.map(w => map.get(w)).filter(Boolean).slice(0, topN);
    return filtered.length ? filtered : null;
  }, [items, topDistinctWordsFromHistory, topN]);

  const useDistinctTop = async () => {
    const top = topDistinctWordsFromHistory(topN, 2);
    setInput(top.map(t => t.word).join(', '));
    setDataReady(top);

    // persist top list to server (anon key)
    try {
      const payload = top.map(t => ({ word: t.word, logodds: Number(t.logodds || 0), count: Number(t.sum || t.countReal || t.countFake || 0) }));
      await saveUserDistinctWords(payload, 'anon');
      window.dispatchEvent(new Event('distinct-words-saved'));
    } catch (e) {
      console.warn('saveUserDistinctWords failed', e);
    }
  };

  const applyInput = async () => {
    const arr = input.split(',').map(s => s.trim().toLowerCase()).filter(Boolean).slice(0, topN);
    const res = computeLogOddsForList(arr) || [];
    setDataReady(res);

    // persist applied list too
    if (res && res.length) {
      try {
        const payload = res.map(t => ({ word: t.word, logodds: Number(t.logodds || 0), count: Number(t.sum || t.countReal || t.countFake || 0) }));
        await saveUserDistinctWords(payload, 'anon');
        window.dispatchEvent(new Event('distinct-words-saved'));
      } catch (e) {
        console.warn('saveUserDistinctWords failed', e);
      }
    }
  };

  const chartData = React.useMemo(() => {
    if (!dataReady || dataReady.length === 0) return null;
    const labels = dataReady.map(r => r.word);
    const fakeVals = dataReady.map(r => (r.logodds < 0 ? -Math.abs(r.logodds) : 0));
    const realVals = dataReady.map(r => (r.logodds > 0 ? r.logodds : 0));
    return {
      labels,
      datasets: [
        { label: 'Fake (left)', data: fakeVals, backgroundColor: 'rgba(255,112,67,0.9)' },
        { label: 'Real (right)', data: realVals, backgroundColor: 'rgba(25,118,210,0.9)' }
 ]
    };
  }, [dataReady]);

  const chartOptions = React.useMemo(() => ({
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: { callback: v => Number(v).toFixed(2) },
        grid: { drawBorder: false }
      },
      y: { grid: { display: false }, ticks: { autoSkip: false } }
    },
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: ctx => {
            const v = ctx.raw;
            return `${ctx.dataset.label}: ${Math.abs(Number(v)).toFixed(2)}`;
          }
        }
      }
    }
  }), []);

  return (
    <Box sx={{ p: 2 }}>
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <TextField
          size="small"
          fullWidth
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Comma-separated words (or click 'Use top 10 distinct' button)"
        />
        <Button variant="outlined" onClick={useDistinctTop}>Use top 10 distinct</Button>
        <Button variant="contained" onClick={ applyInput}>Apply</Button>
      </Stack>

      {!chartData ? (
        <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
          Enter words or click "Use top 10 distinct" to build a focused word-shift.
        </Box>
      ) : (
        <Box sx={{ height: 360 }}>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>Distinctive words (user-selected)</Typography>
          <Bar data={chartData} options={chartOptions} />
        </Box>
      )}
    </Box>
  );
};
// --- end UserWordShiftPanel ---

// --- add: SavedDistinctWordsPanel (fetches saved per-user distinct words and renders WordShiftDiverging) ---
const SavedDistinctWordsPanel = ({ userId = 'anon', maxItems = 20, items = null }) => {
  const [loadingSaved, setLoadingSaved] = useState(true);
  const [errSaved, setErrSaved] = useState(null);
  const [topByLabel, setTopByLabel] = useState({ real: [], fake: [] });

  const fetchHistoryItems = async () => {
    const endpoints = [
      '/history?limit=1000',
      '/history/analyses?limit=1000',
      'http://127.0.0.1:8000/history?limit=1000',
      '/history',
      '/history/analyses'
    ];
    for (const ep of endpoints) {
      try {
        const res = await fetch(ep, { credentials: 'same-origin' });
        if (!res.ok) continue;
        const payload = await res.json();
        const list = Array.isArray(payload) ? payload : (payload.items || payload.analyses || payload.data || null);
        if (Array.isArray(list) && list.length) return list;
      } catch (e) {
        // try next
      }
    }
    return null;
  };

  const load = async () => {
    setLoadingSaved(true);
    setErrSaved(null);
    try {
      const rawItems = Array.isArray(items) && items.length ? items : (await fetchHistoryItems());
      if (!rawItems || !rawItems.length) {
        setTopByLabel({ real: [], fake: [] });
        setLoadingSaved(false);
        return;
      }

      // Aggregate: for each word keep the single occurrence with largest absolute contribution
      const agg = Object.create(null);
      for (const it of rawItems) {
        const wc = it.word_contributions || it.wordContrib || it.wordContributions || it.word_contrib || null;
        if (!wc || typeof wc !== 'object') continue;
        for (const [rawWord, vRaw] of Object.entries(wc)) {
          const w = normalizeKey(rawWord);
          const v = Number(vRaw || 0);
          if (!w) continue;
          const absv = Math.abs(v);
          if (!Number.isFinite(absv) || absv === 0) continue;
          const cur = agg[w];
          if (!cur || absv > cur.maxAbs) {
            agg[w] = { word: w, maxAbs: absv, sign: Math.sign(v) || 1, count: (cur?.count || 0) + 1, sampleVal: v };
          } else {
            agg[w].count = (agg[w].count || 0) + 1;
          }
        }
      }

      // Build array, sort by maxAbs desc, take top N
      const arr = Object.values(agg);
      arr.sort((a, b) => b.maxAbs - a.maxAbs);
      const top = arr.slice(0, maxItems);

      // split into real/fake lists for WordShiftDiverging format
      const real = [];
      const fake = [];
      for (const it of top) {
        if (it.sign >= 0) {
          real.push({ word: it.word, log_odds: Number(it.maxAbs), count: it.count || 0 });
        } else {
          fake.push({ word: it.word, log_odds: Number(it.maxAbs), count: it.count || 0 });
        }
      }

      setTopByLabel({ real, fake });
    } catch (e) {
      setErrSaved(e.message || 'Failed to load history');
      setTopByLabel({ real: [], fake: [] });
    } finally {
      setLoadingSaved(false);
    }
  };

  useEffect(() => {
    load();
    const onSaved = () => load();
    window.addEventListener('distinct-words-saved', onSaved);
    return () => window.removeEventListener('distinct-words-saved', onSaved);
  }, [userId, items, maxItems]);

  const handleRefresh = async () => { await load(); };
  const handleDelete = async () => { setTopByLabel({ real: [], fake: [] }); };

  const dataForWordShift = useMemo(() => ({ top_by_label: topByLabel }), [topByLabel]);

  return (
    <Box sx={{ p: 0, height: '100%', overflow: 'hidden' }}>
      {loadingSaved ? (
        <Box sx={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      ) : errSaved ? (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography color="error">{errSaved}</Typography>
        </Box>
      ) : ((!dataForWordShift.top_by_label) || (dataForWordShift.top_by_label.real.length === 0 && dataForWordShift.top_by_label.fake.length === 0)) ? (
        <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
          <Typography>No distinctive words found in history.</Typography>
        </Box>
      ) : (
        <Box sx={{ mt: 1, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {/* match the height used for the sibling Detection Ratio panel (420) so charts align */}
          <Box sx={{ width: '100%', maxWidth: 980, height: 420 }}>
            <WordShiftDiverging data={dataForWordShift} maxItems={maxItems} containerHeight={420} />
          </Box>
        </Box>
      )}
    </Box>
  );
};
// --- end SavedDistinctWordsPanel ---

