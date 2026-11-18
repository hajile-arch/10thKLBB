import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Quote } from "lucide-react";
import { OFFICER_RANKS, Officer, OfficerRank, getOfficers } from "../firebase/officerService";
import OfficerPhoto from "../components/OfficerPhoto";

// Colour for each rank: a thin accent used on labels, borders and glows
const RANK_STYLE: Record<OfficerRank, { label: string; accent: string; text: string; border: string; glow: string }> = {
  Captain: {
    label: "Captain",
    accent: "from-amber-200 via-yellow-400 to-amber-600",
    text: "text-amber-300",
    border: "border-amber-400/60",
    glow: "shadow-amber-500/20",
  },
  Lieutenant: {
    label: "Lieutenants",
    accent: "from-slate-100 via-slate-300 to-slate-500",
    text: "text-slate-200",
    border: "border-slate-300/40",
    glow: "shadow-slate-300/10",
  },
  "Warrant Officer": {
    label: "Warrant Officers",
    accent: "from-orange-200 via-orange-400 to-amber-700",
    text: "text-orange-300",
    border: "border-orange-400/40",
    glow: "shadow-orange-500/10",
  },
  Instructor: {
    label: "Instructors",
    accent: "from-teal-200 via-teal-400 to-teal-700",
    text: "text-teal-300",
    border: "border-teal-400/40",
    glow: "shadow-teal-500/10",
  },
  "Staff Sergeant": {
    label: "Staff Sergeants",
    accent: "from-red-300 via-red-600 to-red-900",
    text: "text-red-300",
    border: "border-red-500/40",
    glow: "shadow-red-600/10",
  },
};

const Photo = ({ officer, className }: { officer: Officer; className: string }) => (
  <OfficerPhoto officer={officer} className={className} />
);

// Featured card for the Company Captain
const CaptainCard = ({ officer }: { officer: Officer }) => {
  const style = RANK_STYLE.Captain;
  return (
    <div className={`relative overflow-hidden rounded-3xl border ${style.border} bg-gradient-to-br from-white/[0.07] to-white/[0.02] shadow-2xl ${style.glow}`}>
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${style.accent}`} />
      <div className="grid md:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] md:items-center">
        <div className="relative aspect-[3/4] w-full max-w-md mx-auto md:max-w-none">
          {/* Faces are near the top of most photos, so crop from the top */}
          <Photo officer={officer} className="absolute inset-0 h-full w-full object-cover object-[center_15%]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-[#141414]/90" />
        </div>
        <div className="relative flex flex-col justify-center gap-4 p-6 sm:p-10">
          <p className={`font-bebas text-xl tracking-[0.3em] ${style.text}`}>Company Captain</p>
          <h2 className="font-bebas text-5xl sm:text-6xl leading-none tracking-wide text-white">
            {officer.name}
          </h2>
          {officer.role && officer.role.toLowerCase() !== "company captain" && (
            <p className="text-sm uppercase tracking-widest text-gray-400">{officer.role}</p>
          )}
          {officer.quote && (
            <blockquote className="relative mt-2 pl-8">
              <Quote className={`absolute left-0 top-1 h-5 w-5 ${style.text} opacity-70`} />
              <p className="font-dmSerif text-xl sm:text-2xl italic leading-snug text-gray-100">
                {officer.quote}
              </p>
            </blockquote>
          )}
        </div>
      </div>
    </div>
  );
};

// Portrait card; the quote slides up on hover (or on tap on phones)
const OfficerCard = ({ officer }: { officer: Officer }) => {
  const style = RANK_STYLE[officer.rank];
  const [showQuote, setShowQuote] = useState(false);
  const hasQuote = !!officer.quote;

  return (
    <button
      type="button"
      onClick={() => hasQuote && setShowQuote((v) => !v)}
      className={`group relative block w-full overflow-hidden rounded-2xl border ${style.border} bg-white/[0.03] text-left shadow-xl ${style.glow} transition duration-300 hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${hasQuote ? "cursor-pointer" : "cursor-default"}`}
      aria-label={hasQuote ? `${officer.name}: show quote` : officer.name}
    >
      <div className="relative aspect-[3/4]">
        <Photo
          officer={officer}
          className="absolute inset-0 h-full w-full object-cover object-[center_15%] grayscale-[35%] transition duration-500 group-hover:grayscale-0 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

        {hasQuote && (
          <div
            className={`absolute inset-0 flex items-center bg-black/80 p-5 backdrop-blur-sm transition-opacity duration-300 ${
              showQuote ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}
          >
            <p className="font-dmSerif text-lg italic leading-snug text-gray-100">“{officer.quote}”</p>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 p-4">
          <div className={`mb-2 h-0.5 w-10 bg-gradient-to-r ${style.accent}`} />
          <h3 className="font-bebas text-2xl leading-none tracking-wide text-white">{officer.name}</h3>
          <p className={`mt-1 text-xs font-semibold uppercase tracking-widest ${style.text}`}>
            {officer.role || officer.rank}
          </p>
        </div>
      </div>
    </button>
  );
};

const Officers = () => {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getOfficers()
      .then(setOfficers)
      .catch((err) => {
        console.error("Error loading officers:", err);
        setError("Couldn't load the officers. Please try again later.");
      })
      .finally(() => setLoading(false));
  }, []);

  const captain = officers.find((o) => o.rank === "Captain");
  const tiers = useMemo(
    () =>
      OFFICER_RANKS.map((rank) => ({
        rank,
        people: officers.filter((o) => o.rank === rank && o !== captain),
      })).filter((t) => t.people.length > 0),
    [officers, captain]
  );

  return (
    <div className="min-h-screen bg-[#111] bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.06),transparent_60%)] text-white">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:py-14">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition"
        >
          <ArrowLeft className="h-4 w-4" /> Home
        </Link>

        <header className="mt-6 mb-10 sm:mb-14">
          <p className="font-bebas text-lg tracking-[0.4em] text-gray-500">10th KL Boys' Brigade</p>
          <h1 className="font-bebas text-6xl sm:text-8xl leading-none tracking-wide">Our Officers</h1>
          <p className="mt-3 max-w-xl text-gray-400">
            The people who lead, teach and look after the Company. Sure &amp; Stedfast.
          </p>
        </header>

        {loading && (
          <div className="space-y-8">
            <div className="h-80 rounded-3xl bg-white/5 animate-pulse" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-[3/4] rounded-2xl bg-white/5 animate-pulse" />
              ))}
            </div>
          </div>
        )}

        {error && <p className="rounded-2xl bg-red-900/40 p-4 text-red-200">{error}</p>}

        {!loading && !error && officers.length === 0 && (
          <p className="text-gray-400">No officers have been added yet.</p>
        )}

        {captain && (
          <section className="mb-14">
            <CaptainCard officer={captain} />
          </section>
        )}

        <div className="space-y-14">
          {tiers.map(({ rank, people }) => {
            const style = RANK_STYLE[rank];
            return (
              <section key={rank}>
                <div className="mb-5 flex items-center gap-4">
                  <h2 className={`font-bebas text-3xl sm:text-4xl tracking-wider ${style.text}`}>
                    {people.length === 1 && rank !== "Captain" ? rank : style.label}
                  </h2>
                  <div className={`h-px flex-1 bg-gradient-to-r ${style.accent} opacity-40`} />
                  <span className="font-bebas text-xl text-gray-500">{people.length}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
                  {people.map((officer) => (
                    <OfficerCard key={officer.id} officer={officer} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <p className="mt-16 text-center font-bebas text-lg tracking-[0.4em] text-gray-600">Sure &amp; Stedfast</p>
      </div>
    </div>
  );
};

export default Officers;
