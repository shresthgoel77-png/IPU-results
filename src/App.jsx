import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  Eye,
  EyeOff,
  Loader2,
  LogOut,
  ShieldCheck,
  BookOpen,
  ClipboardList,
  BarChart3,
} from "lucide-react";

/* ─────────────────── Mock Data ─────────────────── */
const RESULTS = [
  {
    code: "ES102",
    name: "PROGRAMMING IN 'C'",
    internal: 31,
    external: 32,
    total: 63,
    credits: 3,
    grade: "A+",
  },
  {
    code: "BS106",
    name: "APPLIED PHYSICS - II",
    internal: 32,
    external: 36,
    total: 68,
    credits: 3,
    grade: "A+",
  },
  {
    code: "BS110",
    name: "ENVIRONMENTAL STUDIES",
    internal: 34,
    external: 36,
    total: 70,
    credits: 3,
    grade: "B+",
  },
  {
    code: "BS112",
    name: "APPLIED MATHEMATICS -II",
    internal: 32,
    external: 47,
    total: 79,
    credits: 4,
    grade: "A+",
  },

  {
    code: "BS112",
    name: "HUMAN VALUES AND ETHICS",
    internal: 32,
    external: 47,
    total: 79,
    credits: 4,
    grade: "A+",
  },
  {
    code: "BS112",
    name: "APPLIED PHYSICS-II LAB",
    internal: 32,
    external: 47,
    total: 79,
    credits: 4,
    grade: "A+",
  },
  {
    code: "BS112",
    name: "PROGRAMMING IN 'C' LAB",
    internal: 32,
    external: 47,
    total: 79,
    credits: 4,
    grade: "A+",
  },
  {
    code: "BS112",
    name: "ENGINEERING GRAPHICS-II",
    internal: 32,
    external: 47,
    total: 79,
    credits: 4,
    grade: "A+",
  },
  {
    code: "BS112",
    name: "EVS-LAB",
    internal: 32,
    external: 47,
    total: 79,
    credits: 4,
    grade: "A+",
  },
  {
    code: "BS112",
    name: "WORKSHOP TECHNOLOGY",
    internal: 32,
    external: 47,
    total: 79,
    credits: 4,
    grade: "A+",
  },
  {
    code: "BS112",
    name: "ENGINEERING MECHANICS",
    internal: 32,
    external: 47,
    total: 79,
    credits: 4,
    grade: "A+",
  },
];

/* ─────────────────── Grade color helper ─────────────────── */
function gradeColor(grade) {
  switch (grade) {
    case "A+":
      return "bg-emerald-100 text-emerald-700";
    case "A":
      return "bg-green-100 text-green-700";
    case "B+":
      return "bg-amber-100 text-amber-700";
    case "B":
      return "bg-yellow-100 text-yellow-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

/* ──────────────────────────────────────────────────────────── */
/*                        Layout                               */
/* ──────────────────────────────────────────────────────────── */
function Layout({ children, isDashboard }) {
  return (
    <div className={`min-h-screen flex flex-col ${isDashboard ? "bg-gray-50" : "bg-slate-900 dot-pattern"}`}>
      {/* ── Top Nav — adapts theme based on view ── */}
      <header
        className={`sticky top-0 z-50 w-full border-b backdrop-blur-md transition-colors duration-300 ${isDashboard
            ? "border-gray-200 bg-white/90"
            : "border-slate-700/60 bg-slate-900/80"
          }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 shadow-lg shadow-blue-600/30">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className={`text-lg font-bold tracking-tight ${isDashboard ? "text-slate-800" : "text-white"}`}>
              IPU Results
            </span>
          </div>

          {/* Nav links — hidden on mobile */}
          <nav className="hidden items-center gap-6 md:flex">
            {["Home", "About", "Contact", "Privacy"].map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                className={`text-sm font-medium transition-colors ${isDashboard
                    ? "text-slate-500 hover:text-slate-800"
                    : "text-slate-400 hover:text-white"
                  }`}
              >
                {link}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <button
            id="check-internals-btn"
            className="hidden items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-500 hover:shadow-blue-500/40 active:scale-[0.97] sm:inline-flex"
          >
            <ClipboardList className="h-4 w-4" />
            Check Internals
          </button>
        </div>
      </header>

      {/* ── Page Content ── */}
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────── */
/*                    Login Portal                             */
/* ──────────────────────────────────────────────────────────── */
function LoginPortal({ onLogin }) {
  const [enrollment, setEnrollment] = useState("");
  const [password, setPassword] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 1500);
  };

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="login-glow w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 36, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="glass-card w-full rounded-2xl p-8"
        >
          <div className="mb-8 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
              className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
              style={{
                background: "rgba(59, 130, 246, 0.12)",
                boxShadow: "0 0 0 1px rgba(59, 130, 246, 0.25), 0 0 30px -5px rgba(59, 130, 246, 0.2)",
              }}
            >
              <BookOpen className="h-7 w-7 text-blue-400" />
            </motion.div>
            <h1 className="text-2xl font-bold text-white">Student Login</h1>
            <p className="mt-1.5 text-sm text-slate-400">
              Enter your credentials to view results
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="enrollment" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Enrollment Number
              </label>
              <input
                id="enrollment" type="text" required placeholder="e.g. 04219011722"
                value={enrollment} onChange={(e) => setEnrollment(e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Password
              </label>
              <div className="relative">
                <input
                  id="password" type={showPassword ? "text" : "password"} required placeholder="••••••••"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-11"
                />
                <button
                  id="toggle-password-btn" type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-white"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Security Captcha
              </label>
              <div className="captcha-box">
                <div className="flex items-center gap-2 text-slate-500">
                  <ShieldCheck className="h-5 w-5" />
                  <span className="text-sm font-medium">Captcha will load here</span>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="captcha-input" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Enter Captcha
              </label>
              <input
                id="captcha-input" type="text" required placeholder="Type the characters above"
                value={captchaInput} onChange={(e) => setCaptchaInput(e.target.value)}
                className="input-field"
              />
            </div>

            <button id="login-submit-btn" type="submit" disabled={loading} className="btn-primary">
              {loading ? (
                <>
                  <Loader2 className="h-[18px] w-[18px] animate-spin-slow" />
                  Fetching...
                </>
              ) : (
                "View Results"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-500">
            Protected by IPU Exam Portal &bull; &copy; {new Date().getFullYear()}
          </p>
        </motion.div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────── */
/*                      Dashboard                              */
/* ──────────────────────────────────────────────────────────── */

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const rowVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
};

const COLUMNS = ["Paper Code", "Subject Name", "Internal", "External", "Total", "Credits", "Grade"];

/* ── SVG Bar Chart: Internal vs External ── */
const BAR_COLORS = { internal: "#6366f1", external: "#06b6d4" };

function MarksBarChart({ data }) {
  const maxMark = Math.max(...data.map((r) => Math.max(r.internal, r.external)));
  const chartH = 180;
  const scale = (v) => (v / maxMark) * (chartH - 30);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <h3 className="mb-1 text-sm font-bold text-slate-700">Marks Breakdown</h3>
      <p className="mb-5 text-xs text-slate-400">Internal vs External per subject</p>

      <svg viewBox={`0 0 400 ${chartH + 32}`} className="w-full" style={{ overflow: "visible" }}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((f) => {
          const y = chartH - f * (chartH - 30);
          return (
            <g key={f}>
              <line x1="0" y1={y} x2="400" y2={y} stroke="#e2e8f0" strokeDasharray="4 4" />
              <text x="-4" y={y + 3} textAnchor="end" className="fill-slate-400" style={{ fontSize: "9px" }}>
                {Math.round(maxMark * f)}
              </text>
            </g>
          );
        })}

        {/* Bar groups */}
        {data.map((row, i) => {
          const gX = (i / data.length) * 400;
          const cX = gX + (400 / data.length) * 0.5;
          const bw = (400 / data.length) * 0.32;
          const gp = (400 / data.length) * 0.06;

          return (
            <g key={row.code}>
              <motion.rect
                initial={{ height: 0, y: chartH }}
                animate={{ height: scale(row.internal), y: chartH - scale(row.internal) }}
                transition={{ duration: 0.6, delay: 0.3 + i * 0.1 }}
                x={cX - bw - gp / 2} width={bw} rx="4"
                fill={BAR_COLORS.internal} opacity={0.85}
              />
              <motion.rect
                initial={{ height: 0, y: chartH }}
                animate={{ height: scale(row.external), y: chartH - scale(row.external) }}
                transition={{ duration: 0.6, delay: 0.35 + i * 0.1 }}
                x={cX + gp / 2} width={bw} rx="4"
                fill={BAR_COLORS.external} opacity={0.85}
              />
              <text x={cX} y={chartH + 16} textAnchor="middle" className="fill-slate-500" style={{ fontSize: "10px", fontWeight: 600 }}>
                {row.code}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="mt-4 flex items-center justify-center gap-6">
        {[["Internal", BAR_COLORS.internal], ["External", BAR_COLORS.external]].map(([l, c]) => (
          <div key={l} className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-sm" style={{ background: c }} />
            <span className="text-xs font-medium text-slate-500">{l}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ── SVG Donut / Pie Chart: Grade Distribution ── */
const GRADE_PALETTE = {
  "A+": "#10b981",
  A: "#22c55e",
  "B+": "#f59e0b",
  B: "#eab308",
  C: "#f97316",
  F: "#ef4444",
};

function GradePieChart({ data }) {
  const gradeCounts = {};
  data.forEach((r) => { gradeCounts[r.grade] = (gradeCounts[r.grade] || 0) + 1; });

  const entries = Object.entries(gradeCounts).sort((a, b) => b[1] - a[1]);
  const total = data.length;
  const mostCommon = entries[0];

  // Build donut slices
  const cx = 100, cy = 100, r = 80, innerR = 50;
  let cumAngle = -90;

  const slices = entries.map(([grade, count]) => {
    const angle = (count / total) * 360;
    const startAngle = cumAngle;
    const endAngle = cumAngle + angle;
    cumAngle = endAngle;

    const toRad = (a) => (a * Math.PI) / 180;
    const x1 = cx + r * Math.cos(toRad(startAngle));
    const y1 = cy + r * Math.sin(toRad(startAngle));
    const x2 = cx + r * Math.cos(toRad(endAngle));
    const y2 = cy + r * Math.sin(toRad(endAngle));
    const ix1 = cx + innerR * Math.cos(toRad(endAngle));
    const iy1 = cy + innerR * Math.sin(toRad(endAngle));
    const ix2 = cx + innerR * Math.cos(toRad(startAngle));
    const iy2 = cy + innerR * Math.sin(toRad(startAngle));
    const large = angle > 180 ? 1 : 0;

    const d = `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${innerR} ${innerR} 0 ${large} 0 ${ix2} ${iy2} Z`;
    return { grade, count, d, color: GRADE_PALETTE[grade] || "#94a3b8" };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <h3 className="mb-1 text-sm font-bold text-slate-700">Grade Distribution</h3>
      <p className="mb-5 text-xs text-slate-400">
        Most common: <span className="font-bold text-slate-600">{mostCommon[0]}</span>{" "}
        ({mostCommon[1]} of {total})
      </p>

      <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
        {/* Donut */}
        <div className="relative h-[200px] w-[200px] shrink-0">
          <svg viewBox="0 0 200 200" className="h-full w-full">
            {slices.map((s, i) => (
              <motion.path
                key={s.grade} d={s.d} fill={s.color}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 + i * 0.12 }}
                style={{ transformOrigin: "100px 100px" }}
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-slate-800">{total}</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Subjects</span>
          </div>
        </div>

        {/* Legend with progress bars */}
        <div className="flex flex-col gap-2.5">
          {entries.map(([grade, count]) => {
            const pct = ((count / total) * 100).toFixed(0);
            const color = GRADE_PALETTE[grade] || "#94a3b8";
            return (
              <div key={grade} className="flex items-center gap-3">
                <span className="inline-block h-3.5 w-3.5 rounded" style={{ background: color }} />
                <span className="w-8 text-sm font-bold text-slate-700">{grade}</span>
                <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-100">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="h-full rounded-full"
                    style={{ background: color }}
                  />
                </div>
                <span className="num-cell text-xs font-semibold text-slate-500">{count} ({pct}%)</span>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Dashboard Component ── */
function Dashboard({ onLogout }) {
  const totalCredits = RESULTS.reduce((s, r) => s + r.credits, 0);
  const totalMarks = RESULTS.reduce((s, r) => s + r.total, 0);
  const totalInternal = RESULTS.reduce((s, r) => s + r.internal, 0);
  const totalExternal = RESULTS.reduce((s, r) => s + r.external, 0);
  const avgMarks = (totalMarks / RESULTS.length).toFixed(1);

  const statCards = [
    { label: "Subjects", value: RESULTS.length, icon: BookOpen, accent: "bg-blue-500", glow: "shadow-blue-500/25" },
    { label: "Total Credits", value: totalCredits, icon: GraduationCap, accent: "bg-emerald-500", glow: "shadow-emerald-500/25" },
    { label: "Total Marks", value: totalMarks, icon: ClipboardList, accent: "bg-violet-500", glow: "shadow-violet-500/25" },
    { label: "Average", value: avgMarks, icon: BarChart3, accent: "bg-amber-500", glow: "shadow-amber-500/25" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-1 flex-col"
    >
      {/* ── Sub-header ── */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Semester Results</h2>
            <p className="mt-0.5 text-sm text-slate-500">Guru Gobind Singh Indraprastha University</p>
          </div>
          <button
            id="logout-btn" onClick={onLogout}
            className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 shadow-sm transition-all hover:bg-red-50 hover:border-red-300 active:scale-[0.97]"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="mx-auto w-full max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {statCards.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1, ease: "easeOut" }}
                className="stat-card group rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.accent} ${stat.glow} shadow-lg`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="stat-value text-2xl font-bold text-slate-800">{stat.value}</span>
                </div>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-slate-400">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Charts ── */}
      <div className="mx-auto w-full max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <MarksBarChart data={RESULTS} />
          <GradePieChart data={RESULTS} />
        </div>
      </div>

      {/* ── Results table ── */}
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="table-scroll overflow-x-auto">
            <table className="result-table w-full min-w-[700px] text-left text-sm">
              <thead>
                <tr className="bg-slate-800">
                  {COLUMNS.map((col) => (
                    <th key={col} className="whitespace-nowrap px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-300">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>

              <motion.tbody variants={containerVariants} initial="hidden" animate="visible">
                {RESULTS.map((row, idx) => (
                  <motion.tr
                    key={row.code}
                    variants={rowVariants}
                    className={`table-row-spaced transition-colors hover:bg-blue-50/60 ${idx % 2 === 1 ? "bg-slate-50/60" : "bg-white"
                      }`}
                  >
                    <td className="whitespace-nowrap px-5 py-5 font-mono text-sm font-semibold text-blue-600">{row.code}</td>
                    <td className="px-5 py-5 text-sm font-medium text-slate-700">{row.name}</td>
                    <td className="num-cell px-5 py-5 text-sm text-slate-600">{row.internal}</td>
                    <td className="num-cell px-5 py-5 text-sm text-slate-600">{row.external}</td>
                    <td className="num-cell px-5 py-5 text-sm font-bold text-slate-800">{row.total}</td>
                    <td className="num-cell px-5 py-5 text-center text-sm font-medium text-slate-600">{row.credits}</td>
                    <td className="px-5 py-5">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${gradeColor(row.grade)}`}>
                        {row.grade}
                      </span>
                    </td>
                  </motion.tr>
                ))}

                {/* Summary row */}
                <motion.tr variants={rowVariants} className="summary-row bg-slate-50 font-semibold">
                  <td className="px-5 py-5 text-sm font-bold text-slate-500" colSpan={2}>Total</td>
                  <td className="num-cell px-5 py-5 text-sm font-bold text-slate-700">{totalInternal}</td>
                  <td className="num-cell px-5 py-5 text-sm font-bold text-slate-700">{totalExternal}</td>
                  <td className="num-cell px-5 py-5 text-sm font-extrabold text-blue-600">{totalMarks}</td>
                  <td className="num-cell px-5 py-5 text-center text-sm font-bold text-slate-700">{totalCredits}</td>
                  <td className="px-5 py-5" />
                </motion.tr>
              </motion.tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────────────────── */
/*                          App                                */
/* ──────────────────────────────────────────────────────────── */
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <Layout isDashboard={isLoggedIn}>
      <AnimatePresence mode="wait">
        {!isLoggedIn ? (
          <LoginPortal key="login" onLogin={() => setIsLoggedIn(true)} />
        ) : (
          <Dashboard key="dashboard" onLogout={() => setIsLoggedIn(false)} />
        )}
      </AnimatePresence>
    </Layout>
  );
}
