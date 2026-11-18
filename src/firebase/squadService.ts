import { getDatabase, ref, get } from "firebase/database";
import app from "./firebase";
import { Member, Squad } from "../enum";

export type SquadRoleLabel = "Squad Leader" | "Assistant Squad Leader" | "Member";

// Squads for one year, in squad-number order. Firebase returns the year either
// as an object or as a list (when the keys are 1, 2, 3...), and drops empty
// lists/objects, so every squad is normalised here.
export const getSquadsForYear = async (
  year: number = new Date().getFullYear()
): Promise<Squad[]> => {
  const db = getDatabase(app);
  const snap = await get(ref(db, `squads/${year}`));
  if (!snap.exists()) return [];

  const raw = snap.val();
  const entries: [string, any][] = Array.isArray(raw)
    ? raw.map((value, index): [string, any] => [String(index), value])
    : Object.entries(raw);

  return entries
    .filter(([, value]) => value && typeof value === "object")
    .map(([key, value]) => ({
      ...value,
      year: value.year ?? year,
      squadNumber: Number(value.squadNumber ?? key),
      assistantSquadLeaderIds: value.assistantSquadLeaderIds || [],
      members: value.members || {},
    }))
    .filter((squad) => !isNaN(squad.squadNumber))
    .sort((a, b) => a.squadNumber - b.squadNumber);
};

// A member's role within their squad for the given year's squads
export const getSquadRole = (
  memberId: string,
  squads: Squad[]
): SquadRoleLabel => {
  for (const squad of squads) {
    if (squad.squadLeaderId === memberId) return "Squad Leader";
    if (squad.assistantSquadLeaderIds.includes(memberId))
      return "Assistant Squad Leader";
  }
  return "Member";
};

// Everyone in a squad: leader first, then assistants, then members by name
export const getSquadPeople = (squad: Squad, members: Member[]) => {
  const byId = new Map(members.map((m) => [m.id, m]));
  const leader = squad.squadLeaderId ? byId.get(squad.squadLeaderId) : undefined;
  const assistants = squad.assistantSquadLeaderIds
    .map((id) => byId.get(id))
    .filter((m): m is Member => !!m);
  const leadershipIds = new Set(
    [squad.squadLeaderId, ...squad.assistantSquadLeaderIds].filter(Boolean)
  );
  const regulars = Object.keys(squad.members)
    .filter((id) => !leadershipIds.has(id))
    .map((id) => byId.get(id))
    .filter((m): m is Member => !!m)
    .sort((a, b) => a.name.localeCompare(b.name));
  return { leader, assistants, regulars };
};
