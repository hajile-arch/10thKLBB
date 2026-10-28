import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { uploadToFirebase } from "../firebase/firebaseUtils";
import { UserFormInput } from "../components/addBadges/UserFormInput";
import { UserFormMessage } from "../components/addBadges/UserFormMessage";
import { AwardBadgeSelection } from "../pages/AwardBadgelist";
import { ref, get } from "firebase/database";
import { db } from "../firebase/firebaseConfig";
import { RANK_OPTIONS, SQUAD_OPTIONS } from "../enum";
import { ThemeToggle } from "../components/ThemeToggle";
import { Loader2, Send } from "lucide-react";

const calculateAge = (dob: string): number => {
  const birthDate = new Date(dob);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  return age;
};

const getPlatoon = (squad: string): string => {
  const squadNumber = parseInt(squad.split(" ")[1]);
  if (squadNumber === 1 || squadNumber === 2) return "Platoon A";
  if (squadNumber === 3 || squadNumber === 4) return "Platoon B";
  if (squadNumber === 5 || squadNumber === 6) return "Platoon C";
  if (squadNumber === 7 || squadNumber === 8) return "Platoon D";
  return "Unknown";
};

export const Awards: React.FC = () => {
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [rank, setRank] = useState("Recruit");
  const [squad, setSquad] = useState("Squad 1");
  const [yearJoined, setYearJoined] = useState(new Date().getFullYear().toString());
  const [googleDriveLink, setGoogleDriveLink] = useState("");
  const [selectedBadges, setSelectedBadges] = useState<any[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const usersRef = ref(db, "awards");
      const snapshot = await get(usersRef);

      if (snapshot.exists()) {
        const users = snapshot.val();
        const userExists = Object.values(users).some(
          (user: any) => user.name === name && user.dob === dob
        );

        if (userExists) {
          setMessage("This user has already been registered!");
          return;
        }
      }
    } catch (error) {
      console.error("Error checking user existence:", error);
      setMessage("Error checking if user exists. Please try again.");
      return;
    }

    if (!name || !dob || !rank || !squad || !yearJoined || !googleDriveLink) {
      setMessage("All fields, including 'Google Drive Link', are required!");
      return;
    }

    if (!googleDriveLink.includes("drive.google.com")) {
      setMessage("Please enter a valid Google Drive link");
      return;
    }

    const age = calculateAge(dob);
    if (age < 12) {
      setMessage("Member must be at least 12 years old.");
      return;
    }

    if (age > 22) {
      setMessage("Member must be 22 years old or younger.");
      return;
    }

    if (parseInt(yearJoined) < 2011 || parseInt(yearJoined) > new Date().getFullYear()) {
      setMessage("Year Joined must be between 2011 and the current year.");
      return;
    }

    const platoon = getPlatoon(squad);

    setLoading(true);
    const userData = {
      name,
      dob,
      rank,
      squad,
      platoon,
      yearJoined,
      googleDriveLink,
      badges: selectedBadges,
      id: uuidv4(),
      timestamp: Date.now(),
    };

    const response = await uploadToFirebase("Awards", userData);

    if (response.success) {
      setMessage("Application submitted successfully! 🎉");
      resetForm();
    } else {
      setMessage(`Error: ${response.message}`);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setName("");
    setDob("");
    setRank("Recruit");
    setSquad("Squad 1");
    setYearJoined("");
    setGoogleDriveLink("");
    setSelectedBadges([]);
  };

  const inputClass =
    "!rounded-xl !border-gray-200 bg-gray-50/80 focus:!ring-indigo-500 dark:!border-gray-700";

  const submitLabel = loading ? "Submitting..." : "Submit Application";

  return (
  <div className="relative min-h-screen pb-28 lg:pb-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-slate-950 dark:to-indigo-950">
    {/* Decorative glow blobs */}
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-blue-400/30 dark:bg-blue-600/20 blur-3xl" />
      <div className="absolute top-1/3 -right-24 h-80 w-80 rounded-full bg-amber-300/30 dark:bg-amber-500/10 blur-3xl" />
      <div className="absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-fuchsia-300/20 dark:bg-fuchsia-600/10 blur-3xl" />
    </div>

    <div className="relative flex flex-col lg:flex-row">
    {/* User Form Section - Fixed on desktop, shown first on mobile */}
    <div className="w-full lg:w-1/2 lg:fixed lg:top-0 lg:left-0 lg:h-screen lg:overflow-y-auto">
      <div className="flex justify-center items-center p-4 lg:p-6 min-h-full">
        <div className="max-w-md w-full overflow-hidden rounded-3xl border border-white/60 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl shadow-indigo-500/10 dark:shadow-black/40 lg:my-8">
          {/* Hero header */}
          <div className="relative px-6 pt-6 pb-8 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 text-white">
            <div aria-hidden className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,white_0,transparent_40%),radial-gradient(circle_at_80%_0%,white_0,transparent_30%)]" />
            <ThemeToggle className="absolute right-4 top-4 z-10 !text-white hover:!bg-white/20" />
            <div className="relative flex items-center gap-4">
              <img
                src="/images/10thkl-Logo.png"
                alt="10th KL logo"
                className="h-14 w-14 rounded-2xl bg-white/95 p-1.5 shadow-lg object-contain"
              />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">10th KL Boys' Brigade</p>
                <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight">
                  Awards Application 🏅
                </h1>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6 -mt-4 relative rounded-t-3xl bg-white/90 dark:bg-gray-900/90 space-y-4">
          <UserFormMessage message={message} />

          <form id="award-form" onSubmit={handleSubmit} className="space-y-4">
            <UserFormInput
              label="Name"
              type="text"
              value={name}
              onChange={setName}
              required={true}
              className={inputClass}
            />

            <UserFormInput
              label="Date of Birth"
              type="date"
              value={dob}
              onChange={setDob}
              required={true}
              className={inputClass}
            />

            <div className="grid grid-cols-2 gap-3">
              <UserFormInput
                label="Rank"
                type="select"
                value={rank}
                onChange={setRank}
                options={RANK_OPTIONS}
                className={inputClass}
              />

              <UserFormInput
                label="Squad"
                type="select"
                value={squad}
                onChange={setSquad}
                options={SQUAD_OPTIONS}
                hint={`→ ${getPlatoon(squad)}`}
                className={inputClass}
              />
            </div>

            <UserFormInput
              label="Year Joined"
              type="number"
              value={yearJoined}
              onChange={setYearJoined}
              required={true}
              min="2011"
              max={new Date().getFullYear().toString()}
              className={inputClass}
            />
            <div className="space-y-2">
  <iframe
    src="/Handbook.pdf#toolbar=0"
    title="Award guide"
    style={{ colorScheme: "light" }}
    className="w-full h-96 rounded-lg border border-gray-300 dark:border-gray-700 bg-white"
  />
  <a
    href="/Handbook.pdf"
    target="_blank"
    rel="noopener noreferrer"
    className="text-sm underline dark:text-white"
  >
    Open / download the PDF
  </a>
</div>

            <UserFormInput
              label="Google Drive Link"
              type="url"
              value={googleDriveLink}
              onChange={setGoogleDriveLink}
              required={true}
              hint="Must be a drive.google.com link"
              className={inputClass}
            />

            {/* Desktop submit — mobile uses the sticky bar below */}
            <div className="hidden lg:block pt-2">
              <SubmitButton loading={loading} label={submitLabel} count={selectedBadges.length} />
            </div>
          </form>
          </div>
        </div>
      </div>
    </div>

    {/* Badge Selection Section - Scrolls independently */}
    <div className="w-full lg:w-1/2 lg:ml-[50%] lg:p-2">
      <AwardBadgeSelection
        selectedBadges={selectedBadges}
        setSelectedBadges={setSelectedBadges}
      />
    </div>
    </div>

    {/* Mobile sticky submit bar */}
    <div className="lg:hidden fixed inset-x-0 bottom-0 z-30 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] border-t border-gray-200/70 dark:border-gray-800 bg-white/85 dark:bg-gray-900/85 backdrop-blur-xl">
      <SubmitButton loading={loading} label={submitLabel} count={selectedBadges.length} form="award-form" />
    </div>
  </div>
);
};

const SubmitButton: React.FC<{ loading: boolean; label: string; count: number; form?: string }> = ({
  loading,
  label,
  count,
  form,
}) => (
  <button
    type="submit"
    form={form}
    disabled={loading}
    className={`group w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl font-bold text-white shadow-lg transition-all duration-300 ${
      loading
        ? "bg-gray-400 dark:bg-gray-700 cursor-not-allowed shadow-none"
        : "bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-4 focus:ring-indigo-500/30"
    }`}
  >
    {loading ? (
      <Loader2 className="h-5 w-5 animate-spin" />
    ) : (
      <Send className="h-5 w-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    )}
    {label}
    <span className="ml-1 px-2 py-0.5 rounded-full bg-white/20 text-sm">
      🏅 {count}
    </span>
  </button>
);

export default Awards;
