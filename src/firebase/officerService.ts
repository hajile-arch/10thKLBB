import { getDatabase, ref, get, push, set, update, remove } from "firebase/database";
import app from "./firebase";

// Officer ranks, most senior first
export const OFFICER_RANKS = [
  "Captain",
  "Lieutenant",
  "Warrant Officer",
  "Instructor",
  "Staff Sergeant",
] as const;
export type OfficerRank = (typeof OFFICER_RANKS)[number];

export interface Officer {
  id: string;
  name: string;
  rank: OfficerRank;
  role?: string; // appointment, e.g. "Company Captain", "Drill Instructor"
  quote?: string;
  order?: number; // seniority within the rank (lower = more senior)
  photo?: string; // file name in /images/pfp/, if it isn't the name-based default
}

export type OfficerInput = Omit<Officer, "id">;

const db = () => getDatabase(app);

// File name made from the officer's name: "Mr Nigel" -> "mr-nigel"
export const photoSlug = (name: string) => name.trim().toLowerCase().replace(/\s+/g, "-");

const PHOTO_EXTENSIONS = ["jpg", "png", "jpeg", "webp"];

// Photo paths to try, in order: the chosen file name if one is set, else the
// name-based file in each common format ("mr-nigel.jpg", "mr-nigel.png", ...)
export const officerPhotoCandidates = (officer: Pick<Officer, "name" | "photo">) =>
  officer.photo?.trim()
    ? [`/images/pfp/${officer.photo.trim()}`]
    : PHOTO_EXTENSIONS.map((ext) => `/images/pfp/${photoSlug(officer.name)}.${ext}`);

// First photo path to try (used for hints and simple previews)
export const officerPhoto = (officer: Pick<Officer, "name" | "photo">) =>
  officerPhotoCandidates(officer)[0];

export const DEFAULT_PHOTO = "/images/pfp/default.jpg";

const rankIndex = (rank: string) => {
  const i = OFFICER_RANKS.indexOf(rank as OfficerRank);
  return i === -1 ? OFFICER_RANKS.length : i;
};

// Most senior first: by rank, then seniority order, then name
export const sortOfficers = (officers: Officer[]) =>
  [...officers].sort(
    (a, b) =>
      rankIndex(a.rank) - rankIndex(b.rank) ||
      (a.order ?? 9999) - (b.order ?? 9999) ||
      a.name.localeCompare(b.name)
  );

export const getOfficers = async (): Promise<Officer[]> => {
  const snap = await get(ref(db(), "officers"));
  if (!snap.exists()) return [];
  const data = snap.val() as Record<string, Partial<Officer>>;
  return sortOfficers(
    Object.entries(data)
      .filter(([, o]) => o && o.name)
      .map(([id, o]) => ({
        id,
        name: String(o.name).trim(),
        rank: (o.rank || "Staff Sergeant") as OfficerRank,
        role: o.role || "",
        quote: o.quote || "",
        order: typeof o.order === "number" ? o.order : undefined,
        photo: o.photo || "",
      }))
  );
};

// Only the fields this page manages are written, so any other details
// already stored on an officer (e.g. their old badge list) are kept
const editableFields = (input: OfficerInput) => ({
  name: input.name.trim(),
  rank: input.rank,
  role: input.role?.trim() || null,
  quote: input.quote?.trim() || null,
  photo: input.photo?.trim() || null,
  order: typeof input.order === "number" ? input.order : null,
});

export const addOfficer = async (input: OfficerInput): Promise<string> => {
  const newRef = push(ref(db(), "officers"));
  await set(newRef, editableFields(input));
  return newRef.key as string;
};

export const updateOfficer = async (id: string, input: OfficerInput) => {
  await update(ref(db(), `officers/${id}`), editableFields(input));
};

export const deleteOfficer = async (id: string) => {
  await remove(ref(db(), `officers/${id}`));
};

// Save a new seniority order for the officers of one rank (0 = most senior)
export const saveOrder = async (orderedIds: string[]) => {
  const updates: Record<string, number> = {};
  orderedIds.forEach((id, index) => {
    updates[`officers/${id}/order`] = index;
  });
  await update(ref(db()), updates);
};
