import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Crown, Search, Star, X } from "lucide-react";
import { getDataFromFirebase } from "../firebase/firebaseUtils";
import { ThemeToggle } from "../components/ThemeToggle";
import syllabus from "../data/badgeSyllabus.json";

// ---------- types ----------

type LevelName = "Basic" | "Advanced";

interface SyllabusEntry {
  pages: number[];
  intro?: string[];
  requirements?: string[];
  levels?: Partial<Record<LevelName, string[]>>;
  notes?: string[];
}

interface GuideBadge {
  key: string;
  name: string;
  category: string;
  subCategory: string;
  summary: string;
  levels: LevelName[];
  icon: string;
  syllabus?: SyllabusEntry;
  presidentRole?: "required" | "counts";
  presidentNote?: string;
}

const SYLLABUS = syllabus as Record<string, SyllabusEntry>;

// Shape of the `badges` node: category -> subCategory -> badgeKey -> badge
type RawBadge = { name?: string; description?: string | Partial<Record<LevelName, string>> };
type RawBadges = Record<string, Record<string, Record<string, RawBadge>>>;

// ---------- sections, in display order ----------

const SECTIONS: { id: string; title: string; subtitle: string; match: (b: GuideBadge) => boolean }[] = [
  {
    id: "compulsory",
    title: "Compulsory Awards",
    subtitle: "Every Member works towards these first",
    match: (b) => b.category === "proficiencyAwards" && b.subCategory === "compulsory",
  },
  { id: "groupA", title: "Group A · Interest", subtitle: "Proficiency electives", match: (b) => b.subCategory === "groupA" },
  { id: "groupB", title: "Group B · Adventure", subtitle: "Proficiency electives", match: (b) => b.subCategory === "groupB" },
  { id: "groupC", title: "Group C · Community", subtitle: "Proficiency electives", match: (b) => b.subCategory === "groupC" },
  { id: "groupD", title: "Group D · Physical", subtitle: "Proficiency electives", match: (b) => b.subCategory === "groupD" },
  { id: "service", title: "Service Awards", subtitle: "Recognising years of service", match: (b) => b.category === "serviceAwards" },
  { id: "special", title: "Special Awards", subtitle: "The highest honours and scholastic awards", match: (b) => b.category === "specialAwards" },
];

const GROUP_LABEL: Record<string, string> = {
  compulsory: "Compulsory",
  groupA: "Group A",
  groupB: "Group B",
  groupC: "Group C",
  groupD: "Group D",
};

// Badge-specific President's Award requirements (handbook p.120)
const PRESIDENT_REQUIRED: Record<string, string> = {
  "NCO Proficiency Star": "Required (Advanced Level)",
  "Christian Education": "Required at Advanced Level",
  Drill: "Required at Advanced Level",
  Recruitment: "Required at Basic Level",
  "Target Badge": "The first award every Member completes",
};

// Card accent colours by section
const ACCENT: Record<string, { ring: string; glow: string; chip: string }> = {
  compulsory: { ring: "from-amber-300 to-orange-500", glow: "bg-amber-400/25", chip: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300" },
  groupA: { ring: "from-fuchsia-400 to-purple-600", glow: "bg-fuchsia-400/25", chip: "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-500/15 dark:text-fuchsia-300" },
  groupB: { ring: "from-emerald-300 to-teal-600", glow: "bg-emerald-400/25", chip: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300" },
  groupC: { ring: "from-sky-300 to-blue-600", glow: "bg-sky-400/25", chip: "bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300" },
  groupD: { ring: "from-rose-300 to-red-600", glow: "bg-rose-400/25", chip: "bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300" },
  service: { ring: "from-slate-300 to-slate-600", glow: "bg-slate-400/25", chip: "bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300" },
  special: { ring: "from-yellow-200 to-amber-500", glow: "bg-yellow-300/30", chip: "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/15 dark:text-yellow-300" },
};

// Display order within a section where alphabetical doesn't make sense
const SECTION_ORDER: Record<string, string[]> = {
  service: [
    "Link Badge",
    "Junior Service Badge",
    "One Year Service",
    "Three Year Service",
    "Long Year Service",
  ],
  special: [
    "Bronze Scholastics",
    "Silver Scholastics",
    "Gold Scholastics",
    "NCO Proficiency Star",
    "President's Badge",
    "Founder's Badge",
  ],
};

const compareInSection = (sectionId: string) => (a: GuideBadge, b: GuideBadge) => {
  const order = SECTION_ORDER[sectionId];
  if (order) {
    const ia = order.indexOf(a.name);
    const ib = order.indexOf(b.name);
    if (ia !== -1 || ib !== -1) return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
  }
  return a.name.localeCompare(b.name);
};

// Text used by the search box: name, summary and full requirements
const searchTextOf = (b: GuideBadge) =>
  [
    b.name,
    b.summary,
    ...(b.syllabus?.intro || []),
    ...(b.syllabus?.requirements || []),
    ...Object.values(b.syllabus?.levels || {}).flat(),
  ]
    .join(" ")
    .toLowerCase();

const sectionOf = (b: GuideBadge) => SECTIONS.find((s) => s.match(b))?.id ?? "special";

const iconFor = (name: string) =>
  `/images/badges/${name.trim().toLowerCase().replace(/\s+/g, "-")}.png`;

const summaryOf = (description: unknown): string => {
  if (typeof description === "string") return description;
  if (description && typeof description === "object") {
    const d = description as Record<string, string | undefined>;
    return d.Basic || d.Advanced || "";
  }
  return "";
};

// ---------- syllabus text renderer ----------
// Lines use a light markup: "## " heading, "- " bullet, "  - " sub-bullet,
// "| a | b |" table row, anything else a paragraph.

const SyllabusText = ({ lines }: { lines: string[] }) => {
  const blocks: JSX.Element[] = [];
  let table: string[][] = [];

  const flushTable = (key: string) => {
    if (table.length === 0) return;
    const [head, ...rows] = table;
    blocks.push(
      <div key={key} className="overflow-x-auto my-2">
        <table className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {head.map((h, i) => (
                <th key={i} className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, ri) => (
              <tr key={ri} className="border-t border-gray-200 dark:border-gray-700">
                {r.map((c, ci) => (
                  <td key={ci} className="px-3 py-2 text-gray-700 dark:text-gray-300">{c}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    table = [];
  };

  lines.forEach((line, i) => {
    if (line.startsWith("|")) {
      table.push(line.split("|").slice(1, -1).map((c) => c.trim()));
      return;
    }
    flushTable(`t${i}`);
    if (line.startsWith("## ")) {
      blocks.push(
        <h5 key={i} className="mt-3 mb-1 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {line.slice(3)}
        </h5>
      );
    } else if (line.startsWith("  - ")) {
      blocks.push(
        <p key={i} className="ml-8 pl-3 relative text-sm text-gray-600 dark:text-gray-400 before:content-['–'] before:absolute before:left-0">
          {line.slice(4)}
        </p>
      );
    } else if (line.startsWith("- ")) {
      blocks.push(
        <p key={i} className="ml-2 pl-4 relative text-sm text-gray-700 dark:text-gray-300 before:content-['•'] before:absolute before:left-0 before:text-indigo-500">
          {line.slice(2)}
        </p>
      );
    } else {
      blocks.push(
        <p key={i} className="text-sm text-gray-700 dark:text-gray-300">
          {line}
        </p>
      );
    }
  });
  flushTable("t-end");

  return <div className="space-y-1.5">{blocks}</div>;
};

// ---------- badge art ----------

// Advanced badges are worn on a red felt backing, so the Advanced view shows one
const BadgeArt = ({
  badge,
  size = "md",
  advanced = false,
}: {
  badge: GuideBadge;
  size?: "md" | "lg";
  advanced?: boolean;
}) => {
  const accent = ACCENT[sectionOf(badge)];
  const dims = size === "lg" ? "h-36 w-36" : "h-24 w-24";
  const img = size === "lg" ? "h-24 w-24" : "h-16 w-16";
  const felt = size === "lg" ? "h-[6.75rem] w-[6.75rem]" : "h-[4.5rem] w-[4.5rem]";
  return (
    <div className={`relative ${dims} mx-auto`}>
      <div className={`absolute inset-2 rounded-full blur-xl ${accent.glow}`} />
      <div className={`relative h-full w-full rounded-[28%] bg-gradient-to-br ${accent.ring} p-[3px] shadow-lg rotate-45`}>
        <div className="h-full w-full rounded-[26%] bg-white dark:bg-gray-900" />
      </div>
      <div
        aria-hidden
        className={`absolute inset-0 m-auto ${felt} rounded-full shadow-inner transition-all duration-300 ease-out ${
          advanced ? "opacity-100 scale-100" : "opacity-0 scale-75"
        }`}
        style={{
          background:
            "radial-gradient(circle at 35% 30%, #ef4444 0%, #c81e1e 45%, #8f1414 100%)",
          boxShadow: "inset 0 2px 6px rgba(0,0,0,0.35), 0 2px 6px rgba(143,20,20,0.35)",
        }}
      />
      <img
        src={badge.icon}
        alt=""
        className={`absolute inset-0 m-auto ${img} object-contain drop-shadow transition-transform duration-300 ${
          advanced ? "scale-90" : "scale-100"
        }`}
        onError={(e) => (e.currentTarget.style.visibility = "hidden")}
      />
    </div>
  );
};

// ---------- page ----------

const BadgeGuide = () => {
  const [badges, setBadges] = useState<GuideBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<GuideBadge | null>(null);
  const [level, setLevel] = useState<LevelName>("Basic");
  const [search, setSearch] = useState("");
  const [sectionFilter, setSectionFilter] = useState<string>("all");
  const [presidentOnly, setPresidentOnly] = useState(false);

  useEffect(() => {
    const load = async () => {
      const result = await getDataFromFirebase("badges");
      if (!result.success || !result.data) {
        setError("Couldn't load the badge list. Please try again later.");
        setLoading(false);
        return;
      }
      const list: GuideBadge[] = [];
      Object.entries(result.data as RawBadges).forEach(([category, subs]) => {
        Object.entries(subs || {}).forEach(([subCategory, items]) => {
          Object.entries(items || {}).forEach(([key, b]) => {
            if (!b?.name) return;
            const name = String(b.name).trim();
            const description = b.description;
            const levels: LevelName[] =
              description && typeof description === "object"
                ? (["Basic", "Advanced"] as LevelName[]).filter((l) => description[l])
                : [];
            const isElective = category === "proficiencyAwards" && subCategory !== "compulsory";
            list.push({
              key,
              name,
              category,
              subCategory,
              summary: summaryOf(b.description),
              levels,
              icon: iconFor(name),
              syllabus: SYLLABUS[name],
              presidentRole: PRESIDENT_REQUIRED[name] ? "required" : isElective ? "counts" : undefined,
              presidentNote:
                PRESIDENT_REQUIRED[name] ??
                (isElective ? "Counts towards the 6 electives for the President's Award" : undefined),
            });
          });
        });
      });
      setBadges(list);
      setLoading(false);
    };
    load();
  }, []);

  const grouped = useMemo(() => {
    const query = search.trim().toLowerCase();
    return SECTIONS.filter((section) => sectionFilter === "all" || section.id === sectionFilter)
      .map((section) => ({
        ...section,
        badges: badges
          .filter((b) => sectionOf(b) === section.id)
          .filter((b) => !presidentOnly || !!b.presidentRole)
          .filter((b) => !query || searchTextOf(b).includes(query))
          .sort(compareInSection(section.id)),
      }))
      .filter((s) => s.badges.length > 0);
  }, [badges, search, sectionFilter, presidentOnly]);

  const shownCount = grouped.reduce((sum, s) => sum + s.badges.length, 0);
  const filtersActive = search.trim() !== "" || sectionFilter !== "all" || presidentOnly;

  const openBadge = (badge: GuideBadge) => {
    setSelected(badge);
    setLevel(badge.levels.includes("Basic") ? "Basic" : badge.levels[0] ?? "Basic");
  };

  // Close the pop-up with Escape
  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSelected(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

  const selectedLines =
    selected?.syllabus?.levels?.[level] ?? (selected?.syllabus?.requirements || []);
  const hasLevelTabs = !!selected?.syllabus?.levels && selected.levels.length > 1;
  const singleLevel =
    selected && selected.syllabus?.levels && selected.levels.length === 1 ? selected.levels[0] : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-indigo-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-10">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div className="flex items-start gap-3">
            <Link
              to="/member"
              className="mt-1 p-2 rounded-full bg-white/80 dark:bg-gray-800 text-gray-600 dark:text-gray-300 shadow-sm hover:bg-white dark:hover:bg-gray-700"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                Badge Guide
              </h1>
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                Every Boys' Brigade award and what it takes to earn it. Tap a badge for the full requirements.
              </p>
            </div>
          </div>
          <ThemeToggle className="shrink-0" />
        </div>

        {/* Search and filters */}
        <div className="sticky top-0 z-20 -mx-4 px-4 py-3 mb-6 bg-slate-50/85 dark:bg-gray-950/85 backdrop-blur-md">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search badges or requirements, e.g. swim, first aid, 12km…"
              className="w-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 py-3 pl-12 pr-4 text-gray-900 dark:text-white placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Search badges"
            />
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 -mb-1">
            {[{ id: "all", label: "All" }, ...SECTIONS.map((s) => ({ id: s.id, label: s.title.split(" · ")[0].replace(" Awards", "") }))].map(
              (chip) => (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => setSectionFilter(chip.id)}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                    sectionFilter === chip.id
                      ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                      : "bg-white text-gray-600 shadow-sm hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`}
                >
                  {chip.label}
                </button>
              )
            )}
            <button
              type="button"
              onClick={() => setPresidentOnly((v) => !v)}
              aria-pressed={presidentOnly}
              className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                presidentOnly
                  ? "bg-amber-500 text-white"
                  : "bg-white text-gray-600 shadow-sm hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              <Crown className="h-4 w-4" /> President's Award
            </button>
          </div>
          {filtersActive && !loading && (
            <div className="mt-2 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>
                {shownCount} badge{shownCount === 1 ? "" : "s"} found
              </span>
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSectionFilter("all");
                  setPresidentOnly(false);
                }}
                className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* President's Award legend */}
        <div className="mb-8 flex flex-wrap gap-3 text-sm">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 dark:bg-gray-800 px-3 py-1.5 shadow-sm text-gray-700 dark:text-gray-300">
            <Crown className="h-4 w-4 text-amber-500" /> Required for the President's Award
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 dark:bg-gray-800 px-3 py-1.5 shadow-sm text-gray-700 dark:text-gray-300">
            <Star className="h-4 w-4 text-indigo-500" /> Counts towards the President's Award
          </span>
        </div>

        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-60 rounded-3xl bg-white/70 dark:bg-gray-800/70 animate-pulse" />
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-2xl bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 p-4">{error}</div>
        )}

        {!loading && !error && grouped.length === 0 && (
          <div className="rounded-3xl bg-white/80 dark:bg-gray-900 p-10 text-center text-gray-500 dark:text-gray-400">
            No badges match your search.
          </div>
        )}

        {/* Sections */}
        <div className="space-y-12">
          {grouped.map((section) => (
            <section key={section.id}>
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{section.title}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{section.subtitle}</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {section.badges.map((badge) => (
                  <button
                    key={badge.key}
                    type="button"
                    onClick={() => openBadge(badge)}
                    className="group relative flex flex-col items-center text-center rounded-3xl bg-white dark:bg-gray-900 border border-white/80 dark:border-gray-800 p-4 pt-6 shadow-sm shadow-indigo-100 dark:shadow-none hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-100/80 dark:hover:border-gray-700 transition-all duration-200"
                  >
                    {badge.presidentRole && (
                      <span
                        className="absolute top-3 left-3"
                        title={badge.presidentNote}
                        aria-label={badge.presidentNote}
                      >
                        {badge.presidentRole === "required" ? (
                          <Crown className="h-5 w-5 text-amber-500" />
                        ) : (
                          <Star className="h-4 w-4 text-indigo-400" />
                        )}
                      </span>
                    )}
                    {badge.levels.length > 0 && (
                      <span className="absolute top-3 right-3 rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        {badge.levels.length === 2 ? "2 levels" : badge.levels[0]}
                      </span>
                    )}
                    <BadgeArt badge={badge} />
                    <h3 className="mt-4 font-bold text-gray-900 dark:text-white leading-tight">{badge.name}</h3>
                    <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{badge.summary}</p>
                    <span className="mt-auto pt-3 text-[11px] font-semibold uppercase tracking-wider text-indigo-500 opacity-80 group-hover:opacity-100">
                      View requirements
                    </span>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>

        <p className="mt-12 text-center text-xs text-gray-400">
          Requirements from the Boys' Brigade in Malaysia Senior Members' Handbook (Apr 2024).{" "}
          <a href="/Handbook.pdf" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">
            Open the handbook
          </a>
        </p>
      </div>

      {/* Detail pop-up */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-gray-900/50 backdrop-blur-sm sm:p-4"
          onClick={() => setSelected(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={selected.name}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-gradient-to-b from-sky-50 via-white to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="absolute right-4 top-4 z-10 rounded-full bg-white dark:bg-gray-800 p-2 shadow text-gray-700 dark:text-gray-200 hover:bg-gray-50"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="px-6 pt-8 pb-6 text-center">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white pr-8 sm:pr-0">
                {selected.name}
              </h2>
              <div className="mt-2 flex flex-wrap justify-center gap-2">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${ACCENT[sectionOf(selected)].chip}`}>
                  {selected.category === "serviceAwards"
                    ? "Service Award"
                    : selected.category === "specialAwards"
                    ? "Special Award"
                    : GROUP_LABEL[selected.subCategory] || selected.subCategory}
                </span>
                {selected.levels.map((l) => (
                  <span key={l} className="rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 text-xs font-semibold text-gray-600 dark:text-gray-300">
                    {l}
                  </span>
                ))}
              </div>
              <div className="mt-6">
                <BadgeArt
                  badge={selected}
                  size="lg"
                  advanced={hasLevelTabs && level === "Advanced"}
                />
              </div>
              {selected.presidentNote && (
                <p className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-500/10 px-3 py-1 text-sm font-medium text-amber-800 dark:text-amber-300">
                  {selected.presidentRole === "required" ? <Crown className="h-4 w-4" /> : <Star className="h-4 w-4" />}
                  {selected.presidentNote}
                </p>
              )}
              {selected.syllabus?.intro && (
                <div className="mt-4 text-left sm:text-center">
                  <SyllabusText lines={selected.syllabus.intro} />
                </div>
              )}
            </div>

            <div className="px-6 pb-6">
              {hasLevelTabs && (
                <div className="mb-4 grid grid-cols-2 gap-1 rounded-2xl bg-gray-100 dark:bg-gray-800 p-1">
                  {selected.levels.map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setLevel(l)}
                      className={`rounded-xl py-2 text-sm font-semibold transition ${
                        level === l
                          ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow"
                          : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
                      }`}
                    >
                      {l} Level
                    </button>
                  ))}
                </div>
              )}

              {singleLevel && (
                <div className="mb-3 flex items-center gap-2">
                  <span className="rounded-full bg-indigo-50 dark:bg-indigo-500/15 px-3 py-1 text-sm font-semibold text-indigo-700 dark:text-indigo-300">
                    {singleLevel} Level
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    This award has one level only
                  </span>
                </div>
              )}

              <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950/40 p-4 sm:p-5">
                {selectedLines.length > 0 ? (
                  <SyllabusText lines={selectedLines} />
                ) : (
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selected.summary}</p>
                )}
                {selected.syllabus?.notes && selected.syllabus.notes.length > 0 && (
                  <div className="mt-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 p-3">
                    <SyllabusText lines={selected.syllabus.notes} />
                  </div>
                )}
              </div>

              <a
                href={`/Handbook.pdf#page=${selected.syllabus?.pages?.[0] ?? 109}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-3 font-semibold text-white shadow-lg shadow-indigo-500/20 hover:brightness-110"
              >
                <BookOpen className="h-5 w-5" />
                Open in handbook
                {selected.syllabus?.pages?.length
                  ? ` (p. ${selected.syllabus.pages[0]}${
                      selected.syllabus.pages.length > 1
                        ? `–${selected.syllabus.pages[selected.syllabus.pages.length - 1]}`
                        : ""
                    })`
                  : ""}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BadgeGuide;
