import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  useTheme,
  useMediaQuery,
  Stack,
  Chip,
  LinearProgress,
  Tooltip,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ClearIcon from "@mui/icons-material/Clear";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import SecurityIcon from "@mui/icons-material/Security";
import axios from "axios";
import { motion } from "framer-motion";
import WordContributionsChart from "../components/WordContributionsChart";

const MisinformationDetector = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));

  const [tweets, setTweets] = useState([
    { id: Date.now(), text: "", loading: false, result: null, error: null, validation: {} },
  ]);

  const validateTweet = (text) => {
    const errors = {};
    const warnings = {};

    if (!text.trim()) errors.required = "Tweet text is required";
    if (text.length < 10) warnings.minLength = "Tweet is very short (less than 10 characters)";
    if (text.length > 280) errors.maxLength = "Tweet exceeds 280 characters";
    if (text.trim().length < 5) errors.content = "Tweet must contain meaningful content";

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    if (urlRegex.test(text)) warnings.hasUrls = "Tweet contains URLs - may affect analysis accuracy";
    const excessivePunc = /[!?]{3,}/g;
    if (excessivePunc.test(text)) warnings.punctuation = "Excessive punctuation detected";

    return { errors, warnings, isValid: Object.keys(errors).length === 0 };
  };

  const analyzeItem = async (id) => {
    setTweets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, loading: true, error: null, result: null } : t))
    );
    const item = tweets.find((t) => t.id === id);
    const validation = validateTweet(item.text);
    if (!validation.isValid) {
      const errorMessages = Object.values(validation.errors).join("; ");
      setTweets((prev) =>
        prev.map((t) => (t.id === id ? { ...t, loading: false, error: errorMessages, validation } : t))
      );
      return;
    }

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/predict/",
        { text: item.text },
        { headers: { "Content-Type": "application/json" }, timeout: 10000 }
      );

      const data = response.data;
      setTweets((prev) =>
        prev.map((t) => (t.id === id ? { ...t, loading: false, result: data, error: null } : t))
      );
    } catch (error) {
      let errorMessage = "An unexpected error occurred";
      if (error.response) {
        const serverError = error.response.data;
        errorMessage = serverError.detail || `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = "Unable to connect to server. Please check if the backend is running.";
      } else if (error.code === "ECONNABORTED") {
        errorMessage = "Request timed out. Please try again.";
      } else {
        errorMessage = error.message || "Network error occurred";
      }
      setTweets((prev) => prev.map((t) => (t.id === id ? { ...t, loading: false, error: errorMessage } : t)));
    }
  };

  const analyzeAll = async () => {
    for (const t of tweets) await analyzeItem(t.id);
  };

  const sampleTweets = [
    "Breaking: New study proves drinking water causes growth in brain size!",
    "Celebrity X endorses miracle cure — doctors baffled!",
    "Local community garden hosts free workshop this weekend.",
    "Elections coming up: make sure to verify your sources before sharing.",
  ];

  const applySample = (t) => {
    const firstEmpty = tweets.find((x) => !x.text.trim());
    if (firstEmpty) {
      setTweets((prev) => prev.map((x) => (x.id === firstEmpty.id ? { ...x, text: t } : x)));
    } else {
      setTweets((prev) => [
        ...prev,
        { id: Date.now() + Math.random(), text: t, loading: false, result: null, error: null },
      ]);
    }
  };

  const copyResult = async (id) => {
    const it = tweets.find((t) => t.id === id);
    if (!it || !it.result) return;
    const text = `Prediction: ${it.result.prediction} (confidence: ${(it.result.confidence ?? 0).toFixed(3)})`;
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {}
  };

  const clearItem = (id) => {
    setTweets((prev) => prev.map((t) => (t.id === id ? { ...t, text: "", result: null, error: null } : t)));
  };

  const addTweet = () => {
    setTweets((prev) => [...prev, { id: Date.now() + Math.random(), text: "", loading: false, result: null, error: null }]);
  };

  const removeTweet = (id) => {
    setTweets((prev) => prev.filter((t) => t.id !== id));
  };

  const updateText = (id, text) => {
    const validation = validateTweet(text);
    setTweets((prev) => prev.map((t) => (t.id === id ? { ...t, text, validation } : t)));
  };

  const AnimatedGauge = ({ confidence, prediction }) => {
    const [value, setValue] = useState(0);
    const isFake = String(prediction).toLowerCase().includes("fake");
    const displayValue = isFake ? 100 - confidence * 100 : confidence * 100;

    useEffect(() => {
      const timeout = setTimeout(() => setValue(displayValue), 100);
      return () => clearTimeout(timeout);
    }, [displayValue]);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{ width: 120, height: 60, position: "relative" }}
      >
        <svg width="120" height="60" viewBox="0 0 100 50">
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <motion.path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke={isFake ? "#ef4444" : "#22c55e"}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray="126"
            strokeDashoffset="126"
            animate={{ strokeDashoffset: 126 - 126 * (displayValue / 100) }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          />
        </svg>
        <Typography
          variant="body2"
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -30%)",
            fontWeight: 600,
            color: "#1f2937",
          }}
        >
          {`${Math.round(displayValue)}%`}
        </Typography>
      </motion.div>
    );
  };

  // Replace the previous AnimatedWordContributions with this robust version.
  // It normalizes many input shapes into an array of {word, score}, uses an IntersectionObserver
  // to trigger animation, then reveals items progressively with an ease-out timing.
  const AnimatedWordContributions = ({ contributions = [], topN = 10, height = 220, duration = 900 }) => {
    const ref = React.useRef(null);
    const [visible, setVisible] = React.useState(false);
    const [visibleCount, setVisibleCount] = React.useState(0);
    const rafRef = React.useRef(null);

    // normalize many possible shapes into [{word, score}, ...] sorted desc
    const normalizeContributions = React.useCallback((c) => {
      if (!c) return [];
      if (Array.isArray(c)) {
        const arr = c.map((item) => {
          if (Array.isArray(item) && item.length >= 2) {
            return { word: String(item[0]), score: Number(item[1]) || 0 };
          }
          if (item && typeof item === "object") {
            const word = item.word ?? item.term ?? item.token ?? item.label ?? Object.keys(item)[0] ?? "";
            const score = Number(item.score ?? item.weight ?? item.value ?? Object.values(item)[0] ?? 0) || 0;
            return { word: String(word), score };
          }
          return { word: String(item), score: 1 };
        });
        return arr.filter((it) => it.word).sort((a, b) => b.score - a.score);
      }
      if (typeof c === "object") {
        try {
          return Object.entries(c)
            .map(([w, s]) => ({ word: String(w), score: Number(s) || 0 }))
            .sort((a, b) => b.score - a.score);
        } catch (e) {
          return [];
        }
      }
      return [];
    }, []);

    const norm = React.useMemo(() => normalizeContributions(contributions).slice(0, topN), [contributions, normalizeContributions, topN]);

    // intersection observer to trigger animation when component enters view
    React.useEffect(() => {
      const node = ref.current;
      if (!node) {
        setVisible(false);
        return;
      }
      const io = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            setVisible(true);
            io.disconnect();
          }
        },
        { threshold: 0.15 }
      );
      io.observe(node);
      return () => io.disconnect();
    }, [ref]);

    // progressive reveal using requestAnimationFrame (ease-out)
    React.useEffect(() => {
      if (!visible || norm.length === 0) {
        setVisibleCount(0);
        return;
      }
      const total = norm.length;
      const start = performance.now();
      const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
      const step = (now) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = easeOutCubic(t);
        const count = Math.max(1, Math.round(eased * total));
        setVisibleCount(count);
        if (t < 1) rafRef.current = requestAnimationFrame(step);
      };
      rafRef.current = requestAnimationFrame(step);
      return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      };
    }, [visible, norm, duration]);

    // slice the normalized contributions for rendering
    const toShow = React.useMemo(() => norm.slice(0, visibleCount), [norm, visibleCount]);

    return (
      <Box ref={ref} sx={{ mt: 1, width: "100%", minWidth: 0 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Top Contributing Words
        </Typography>
        <div style={{ height }}>
          {/* WordContributionsChart expects an array of {word, score} — we always pass an array */}
          <WordContributionsChart contributions={toShow} topN={topN} height={height} />
        </div>
      </Box>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 2, md: 3, lg: 4 }, py: { xs: 2, sm: 3, md: 4 } }}>
      {/* Hero Section */}
      <Paper
        elevation={3}
        sx={{
          p: { xs: 3, sm: 4, md: 6 },
          mb: { xs: 3, sm: 4, md: 5 },
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          textAlign: "center",
          borderRadius: "16px",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <SecurityIcon sx={{ fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" }, mr: 1 }} />
          <AnalyticsIcon sx={{ fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" } }} />
        </Box>
        <Typography variant={isSmall ? "h4" : isMobile ? "h3" : "h2"} component="h1" gutterBottom sx={{ fontWeight: "bold" }}>
          Misinformation Detector
        </Typography>
        <Typography variant={isSmall ? "body1" : "h6"} sx={{ opacity: 0.9, maxWidth: "600px", mx: "auto" }}>
          Analyze tweets and social media content to detect potential misinformation using AI-powered analysis
        </Typography>
      </Paper>

      {/* Main Analysis Section */}
      <Paper elevation={3} sx={{ borderRadius: "16px", overflow: "hidden", p: 3 }}>
        <Typography variant={isMobile ? "h5" : "h4"} gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <SecurityIcon color="primary" />
          Tweet Analyzer
        </Typography>

        <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
          Enter tweet content below and click Analyze to detect potential misinformation patterns.
        </Typography>

        {/* Tweet Input Section */}
        <Box sx={{ mb: 4 }}>
          {tweets.map((t, idx) => (
            <Paper key={t.id} elevation={1} sx={{ p: { xs: 2, sm: 3 }, mb: 3, borderRadius: "12px", backgroundColor: "rgba(248,250,252,0.8)" }}>
              <Stack spacing={2}>
                <TextField
                  label={`Tweet ${idx + 1} ${t.text.length > 0 ? `(${t.text.length}/280)` : ""}`}
                  multiline
                  rows={isSmall ? 3 : 4}
                  fullWidth
                  value={t.text}
                  onChange={(e) => updateText(t.id, e.target.value)}
                  error={t.validation?.errors && Object.keys(t.validation.errors).length > 0}
                  helperText={
                    t.validation?.errors && Object.keys(t.validation.errors).length > 0
                      ? Object.values(t.validation.errors)[0]
                      : t.validation?.warnings && Object.keys(t.validation.warnings).length > 0
                      ? Object.values(t.validation.warnings)[0]
                      : "Enter tweet content to analyze for misinformation"
                  }
                />

                <Stack direction={isSmall ? "column" : "row"} spacing={1} sx={{ justifyContent: "space-between", alignItems: isSmall ? "stretch" : "center" }}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                    <Button
                      variant="contained"
                      size={isSmall ? "small" : "medium"}
                      onClick={() => analyzeItem(t.id)}
                      disabled={t.loading}
                      startIcon={<AnalyticsIcon />}
                    >
                      Analyze
                    </Button>
                    {t.loading && <CircularProgress size={20} />}
                  </Stack>

                  <Stack direction="row" spacing={0.5}>
                    <IconButton size="small" onClick={() => copyResult(t.id)} disabled={!t.result} title="Copy Result">
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => clearItem(t.id)} title="Clear Content">
                      <ClearIcon fontSize="small" />
                    </IconButton>
                    {tweets.length > 1 && (
                      <IconButton size="small" onClick={() => removeTweet(t.id)} title="Remove Tweet">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Stack>
                </Stack>

                {t.error && <Alert severity="error" sx={{ borderRadius: "8px" }}>{t.error}</Alert>}

                {/* Results Display */}
                {t.result && (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
                      borderRadius: "12px",
                      borderLeft: "4px solid #4f46e5",
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, color: "#4f46e5", mb: 2 }}
                    >
                      Analysis Result
                    </Typography>

                    <Stack
                      direction={isSmall ? "column" : "row"}
                      spacing={3}
                      sx={{ alignItems: "flex-start", justifyContent: "flex-start" }}
                    >
                      {/* Animated Gauge (fixed size) */}
                      <Box sx={{ flex: "0 0 auto" }}>
                        <AnimatedGauge
                          confidence={t.result.confidence ?? t.result.score ?? t.result.probability ?? 0}
                          prediction={t.result.prediction}
                        />
                      </Box>

                      {/* Prediction Info (flexible, allows chart to grow) */}
                      <Stack spacing={1} sx={{ flex: 1, minWidth: 0 }}>
                         <Chip
                           label={`${t.result.prediction} (${
                             t.result.prediction.toLowerCase().includes("fake")
                               ? `${(100 - t.result.confidence * 100).toFixed(0)}% likely real`
                               : `${(t.result.confidence * 100).toFixed(0)}% likely real`
                           })`}
                           color={
                             String(t.result.prediction).toLowerCase().includes("fake")
                               ? "error"
                               : "success"
                           }
                           sx={{
                             fontWeight: 600,
                             fontSize: "0.875rem",
                             textTransform: "uppercase",
                             width: "fit-content",
                           }}
                         />

                         {/* Confidence summary (numeric + bar) */}
                         {(() => {
                           const raw = t.result.confidence ?? t.result.score ?? t.result.probability ?? t.result.confidence_score ?? 0;
                           let conf = Number(raw) || 0;
                           if (conf > 1) conf = conf / 100; // normalize percents
                           conf = Math.max(0, Math.min(1, conf));
                           const percent = Math.round(conf * 100);
                           return (
                             <Box sx={{ mt: 0.5 }}>
                               <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.5 }}>
                                 <Typography variant="body2" color="text.secondary">Confidence</Typography>
                                 <Typography variant="body2" sx={{ fontWeight: 600 }}>{percent}%</Typography>
                               </Box>
                               <Tooltip title={`Raw: ${raw}`}>
                                 <LinearProgress variant="determinate" value={percent} sx={{ height: 8, borderRadius: 2 }} />
                               </Tooltip>
                             </Box>
                           );
                         })()}

                         {/* Word Contributions */}
                         {t.result?.word_contributions && (
                          <Box sx={{ mt: 1, width: "100%", minWidth: 0 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                              Top Contributioning Words
                            </Typography>

                            <WordContributionsChart
                              contributions={t.result.word_contributions}
                              topN={10}
                              height={220}
                            />
                          </Box>
                         )}
                      </Stack>
                     </Stack>
                  </Paper>
                )}
              </Stack>
            </Paper>
          ))}
        </Box>

        {/* Sample Tweets Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant={isMobile ? "h6" : "h5"} gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
            Sample Tweets
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
            Click on any sample below to test the detector:
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" },
              gap: 2,
              mb: 3,
            }}
          >
            {sampleTweets.map((s) => (
              <Paper
                key={s}
                elevation={1}
                onClick={() => applySample(s)}
                sx={{
                  p: 2,
                  cursor: "pointer",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  transition: "all 0.3s ease",
                  backgroundColor: "white",
                  "&:hover": { backgroundColor: "#4f46e5", color: "white", transform: "translateY(-2px)", boxShadow: "0 6px 20px rgba(79, 70, 229, 0.3)" },
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: { xs: "0.8rem", sm: "0.875rem" },
                    lineHeight: 1.4,
                    wordWrap: "break-word",
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {s}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Box>

        <Stack direction={isSmall ? "column" : "row"} spacing={2} sx={{ justifyContent: "space-between", pt: 3, borderTop: "1px solid #e2e8f0" }}>
          <Button variant="contained" size={isSmall ? "medium" : "large"} onClick={analyzeAll} startIcon={<AnalyticsIcon />}>
            Analyze All Tweets
          </Button>
          <Button variant="outlined" size={isSmall ? "medium" : "large"} onClick={addTweet} startIcon={<AddIcon />}>
            Add Tweet
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
};

export default MisinformationDetector;
