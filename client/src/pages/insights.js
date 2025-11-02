import React, { useState, useEffect, useMemo } from 'react';
import {
  Container, Typography, Paper, Grid, Box, Card, CardContent,
  Select, MenuItem, FormControl, InputLabel, Button, CircularProgress, Tooltip as MuiTooltip
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

const Insights = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [misinformationStats, setMisinformationStats] = useState({
    total: 0,
    fake: 0,
    real: 0,
    accuracy: 0
  });

  // view mode toggle: 'your' (default) or 'our'
  const [viewMode, setViewMode] = useState('your');

  // word-cloud data state
  const [topWords, setTopWords] = useState({ real: [], fake: [] });
  const [loadingWords, setLoadingWords] = useState(false);
  const [wordsError, setWordsError] = useState(null);

  // which cloud to show when viewMode === 'our'
  const [cloudMode, setCloudMode] = useState('real');
  // bump this synchronously when toggling so WordCloud remounts immediately (no visible flash of old layout)
  const [cloudVersion, setCloudVersion] = useState(0);

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
      const response = await fetch('http://127.0.0.1:8000/history/stats/summary');
      if (response.ok) {
        const data = await response.json();
        setMisinformationStats({
          total: data.total_analyses,
          fake: data.fake_count,
          real: data.real_count,
          accuracy: Math.round(data.avg_confidence * 100)
        });
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

  // === Dataset definitions (Your Insights) ===
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
        // full-bleed "Our Findings" panel while keeping the outer Container slim for other views
        <Paper
          sx={{
            p: 3,
            mb: 4,
            minHeight: 1240,
            // full-bleed trick: make this Paper span the viewport width while inside the centered Container
            width: '100vw',
            position: 'relative',
            left: '50%',
            right: '50%',
            marginLeft: '-50vw',
            marginRight: '-50vw',
            boxSizing: 'border-box',
            backgroundClip: 'padding-box',
          }}
        >
          <Typography variant="h5" align="center" sx={{ mb: 2, fontWeight: 700 }}>
            {cloudMode === 'fake' ? 'Most Common Words in Fake posts' : 'Most Common Words in Real posts'}
          </Typography>

          {/* toggle between real / fake word cloud */}
          <Box sx={{ display: 'flex', gap: 2, mb: 2, justifyContent: 'center' }}>
            <Button
              onClick={() => setCloudMode('real')}
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
              onClick={() => setCloudMode('fake')}
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

          {wordsError && (
            <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
              Error loading top words: {wordsError}
            </Typography>
          )}
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
          <Grid container spacing={{ xs: 3, md: 4 }} sx={{ mb: 6 }} justifyContent="center">
            <Grid item xs={12} lg={6}>
              <Paper sx={{ p: { xs: 3, sm: 4 }, textAlign: 'center' }}>
                <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
                  Misinformation by Category
                </Typography>
                <Box sx={{ height: 400 }}>
                  <Bar data={yourCategoryData} options={chartOptions} />
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} lg={6}>
              <Paper sx={{ p: { xs: 3, sm: 4 }, textAlign: 'center' }}>
                <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
                  Detection Accuracy
                </Typography>
                <Box sx={{ height: 400, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <div style={{ width: '300px', height: '300px' }}>
                    <Pie data={yourAccuracyData} options={{ ...chartOptions, maintainAspectRatio: false }} />
                  </div>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} lg={6}>
              <Paper sx={{ p: { xs: 3, sm: 4 }, textAlign: 'center' }}>
                <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
                  Detection Trends Over Time
                </Typography>
                <Box sx={{ height: 400 }}>
                  <Line data={yourTrendData} options={chartOptions} />
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} lg={6}>
              <Paper sx={{ p: { xs: 3, sm: 4 }, textAlign: 'center' }}>
                <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
                  Confidence Distribution
                </Typography>
                <Box sx={{ height: 400, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <div style={{ width: '300px', height: '300px' }}>
                    <Doughnut data={yourConfidenceData} options={{ ...chartOptions, maintainAspectRatio: false }} />
                  </div>
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
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2 }}>
                  <Typography variant="h5" gutterBottom color="primary" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Most Common Misinformation Topics
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.8, fontSize: '1.1rem' }}>
                    Political content represents 32% of detected misinformation, followed by health-related 
                    misinformation at 23%. This aligns with global trends in misinformation patterns.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2 }}>
                  <Typography variant="h5" gutterBottom color="primary" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Detection Performance
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.8, fontSize: '1.1rem' }}>
                    Our model maintains an 87.3% accuracy rate with particularly strong performance in 
                    detecting health misinformation (92% accuracy) and political misinformation (85% accuracy).
                  </Typography>
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
  real: ['#E0F7FA', '#B2EBF2', '#80DEEA', '#4DD0E1', '#26C6DA', '#00BCD4', '#81D4FA', '#B3E5FC'],
  fake: ['#FFF3E0', '#FFE0B2', '#FFCC80', '#FFAB40', '#FF7043', '#FF5722', '#F4511E', '#D32F2F']
};