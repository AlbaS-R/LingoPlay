import { useState } from "react";
import { auth } from "~/firebaseConfig";
import { updateDailyGoal } from "~/services/userService";

const DailyGoalEditor = () => {
  const [selectedGoal, setSelectedGoal] = useState<number>(30);
  const [saving, setSaving] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("No has iniciado sesión");
      return;
    }

    setSaving(true);
    try {
      console.log("👤 UID del usuario:", user.uid);
      console.log("📥 Nueva meta diaria:", selectedGoal);
      await updateDailyGoal(user.uid, selectedGoal);
      setSuccess(true);
    } catch (error) {
      console.error("❌ Error guardando meta diaria:", error);
      alert("Error al guardar la meta diaria");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <label htmlFor="daily-goal" className="text-lg font-semibold">Edit your daily goal:</label>
      <select
        id="daily-goal"
        value={selectedGoal}
        onChange={(e) => setSelectedGoal(Number(e.target.value))}
        className="rounded border p-2"
      >
        {[1, 10, 20, 30, 50].map((value) => (
          <option key={value} value={value}>
            {value} XP per day
          </option>
        ))}
      </select>

      <button
        onClick={handleSave}
        disabled={saving}
        className={`rounded px-4 py-2 text-white transition ${
          saving ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {saving ? "Saving..." : "Save changes"}
      </button>

      {success && <p className="text-green-500">Meta diaria guardada ✅</p>}
    </div>
  );
};

export default DailyGoalEditor;
