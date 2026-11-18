import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowLeft, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import OfficerPhoto from "../components/OfficerPhoto";
import {
  OFFICER_RANKS,
  Officer,
  OfficerInput,
  OfficerRank,
  addOfficer,
  deleteOfficer,
  getOfficers,
  photoSlug,
  saveOrder,
  updateOfficer,
} from "../firebase/officerService";

const EMPTY: OfficerInput = { name: "", rank: "Lieutenant", role: "", quote: "", photo: "" };

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500";

const OfficerManage = () => {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null); // null = adding
  const [form, setForm] = useState<OfficerInput>(EMPTY);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const load = async () => {
    try {
      setOfficers(await getOfficers());
    } catch (err) {
      console.error(err);
      setMessage({ ok: false, text: "Couldn't load officers." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm(EMPTY);
  };

  const startEdit = (officer: Officer) => {
    setEditingId(officer.id);
    setForm({
      name: officer.name,
      rank: officer.rank,
      role: officer.role || "",
      quote: officer.quote || "",
      photo: officer.photo || "",
      order: officer.order,
    });
    setMessage(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setMessage({ ok: false, text: "Name is required." });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      if (editingId) {
        const before = officers.find((o) => o.id === editingId);
        // Moving to another rank puts them last in that rank
        const order =
          before && before.rank !== form.rank
            ? officers.filter((o) => o.rank === form.rank).length
            : form.order;
        await updateOfficer(editingId, { ...form, order });
        setMessage({ ok: true, text: `Saved ${form.name.trim()}.` });
      } else {
        const order = officers.filter((o) => o.rank === form.rank).length;
        await addOfficer({ ...form, order });
        setMessage({ ok: true, text: `Added ${form.name.trim()}.` });
      }
      resetForm();
      await load();
    } catch (err) {
      console.error(err);
      setMessage({ ok: false, text: "Save failed. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (officer: Officer) => {
    if (!window.confirm(`Remove ${officer.name} from the officers list? This can't be undone.`)) return;
    setSaving(true);
    try {
      await deleteOfficer(officer.id);
      if (editingId === officer.id) resetForm();
      setMessage({ ok: true, text: `Removed ${officer.name}.` });
      await load();
    } catch (err) {
      console.error(err);
      setMessage({ ok: false, text: "Remove failed. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  // Move an officer up or down within their rank (seniority)
  const move = async (rank: OfficerRank, index: number, delta: -1 | 1) => {
    const group = officers.filter((o) => o.rank === rank);
    const target = index + delta;
    if (target < 0 || target >= group.length) return;
    const ids = group.map((o) => o.id);
    [ids[index], ids[target]] = [ids[target], ids[index]];
    setSaving(true);
    try {
      await saveOrder(ids);
      await load();
    } catch (err) {
      console.error(err);
      setMessage({ ok: false, text: "Couldn't change the order. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Manage Officers</h1>
            <p className="text-sm text-gray-600">Changes show on the public Officers page straight away.</p>
          </div>
          <Link
            to="/officer"
            className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" /> View page
          </Link>
        </div>

        {message && (
          <div
            className={`mb-4 rounded-lg px-4 py-3 text-sm ${
              message.ok ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Add / edit form */}
        <form onSubmit={handleSubmit} className="mb-8 rounded-xl bg-white p-4 sm:p-6 shadow space-y-4">
          <h2 className="text-lg font-semibold">{editingId ? "Edit officer" : "Add an officer"}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Name *</span>
              <input
                className={inputClass}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Full name"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Rank *</span>
              <select
                className={`${inputClass} bg-white`}
                value={form.rank}
                onChange={(e) => setForm({ ...form, rank: e.target.value as OfficerRank })}
              >
                {OFFICER_RANKS.map((rank) => (
                  <option key={rank} value={rank}>
                    {rank}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Role / appointment</span>
              <input
                className={inputClass}
                value={form.role || ""}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                placeholder="e.g. Platoon A Officer"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Photo file (optional)</span>
              <input
                className={inputClass}
                value={form.photo || ""}
                onChange={(e) => setForm({ ...form, photo: e.target.value })}
                placeholder={
                  form.name.trim() ? `${photoSlug(form.name)}.jpg or .png` : "e.g. jane-tan.jpg"
                }
              />
              <span className="mt-1 block text-xs text-gray-500">
                Put the photo in <code>public/images/pfp/</code>. Leave blank to use the name-based file
                shown (.jpg, .png, .jpeg or .webp all work).
              </span>
            </label>
          </div>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Quote</span>
            <textarea
              className={inputClass}
              rows={2}
              value={form.quote || ""}
              onChange={(e) => setForm({ ...form, quote: e.target.value })}
              placeholder="A favourite saying or verse"
            />
          </label>
          <div className="flex justify-end gap-3">
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-gray-400"
            >
              {editingId ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {saving ? "Saving..." : editingId ? "Save changes" : "Add officer"}
            </button>
          </div>
        </form>

        {/* List by rank */}
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
          <div className="space-y-6">
            {OFFICER_RANKS.map((rank) => {
              const group = officers.filter((o) => o.rank === rank);
              return (
                <section key={rank} className="rounded-xl bg-white shadow">
                  <h2 className="border-b px-4 py-3 font-semibold">
                    {rank} <span className="text-sm font-normal text-gray-500">({group.length})</span>
                  </h2>
                  {group.length === 0 ? (
                    <p className="px-4 py-3 text-sm text-gray-500">None yet.</p>
                  ) : (
                    <ul className="divide-y">
                      {group.map((officer, index) => (
                        <li key={officer.id} className="flex items-center gap-3 px-4 py-3">
                          <OfficerPhoto
                            officer={officer}
                            alt=""
                            className="h-10 w-10 rounded-full object-cover bg-gray-200"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium truncate">{officer.name}</p>
                            <p className="text-sm text-gray-500 truncate">{officer.role || "No role set"}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => move(rank, index, -1)}
                              disabled={saving || index === 0}
                              className="rounded p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-30"
                              aria-label={`Move ${officer.name} up`}
                            >
                              <ArrowUp className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => move(rank, index, 1)}
                              disabled={saving || index === group.length - 1}
                              className="rounded p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-30"
                              aria-label={`Move ${officer.name} down`}
                            >
                              <ArrowDown className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => startEdit(officer)}
                              disabled={saving}
                              className="rounded p-2 text-blue-600 hover:bg-blue-50"
                              aria-label={`Edit ${officer.name}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(officer)}
                              disabled={saving}
                              className="rounded p-2 text-red-600 hover:bg-red-50"
                              aria-label={`Remove ${officer.name}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OfficerManage;
