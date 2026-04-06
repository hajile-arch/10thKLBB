import { getDatabase, ref, get, set, update } from "firebase/database";
import app from "./firebase";

const YEAR = new Date().getFullYear();

export const getAllSquads = async () => {
  const db = getDatabase(app);
  const snap = await get(ref(db, `squads/${YEAR}`));
  return snap.exists() ? snap.val() : {};
};

export const getSquad = async (squadNumber: number) => {
  const db = getDatabase(app);
  const snap = await get(ref(db, `squads/${YEAR}/${squadNumber}`));
  return snap.exists() ? snap.val() : null;
};

export const initSquadIfMissing = async (squadNumber: number) => {
  const db = getDatabase(app);
  const path = `squads/${YEAR}/${squadNumber}`;
  const snap = await get(ref(db, path));

  if (!snap.exists()) {
    await set(ref(db, path), {
      squadNumber,
      officerName: "",
      memberIds: {},
    });
  }
};

export const updateSquad = async (
  squadNumber: number,
  data: Partial<any>
) => {
  const db = getDatabase(app);
  await update(ref(db, `squads/${YEAR}/${squadNumber}`), data);
};
