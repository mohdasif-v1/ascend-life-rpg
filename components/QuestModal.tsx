import React from "react";

interface QuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description: string;
    category: string;
    attribute: string;
    difficulty: string;
  }) => Promise<void>;
  initialData?: {
    id?: string;
    title: string;
    description?: string;
    category: string;
    attribute: string;
    difficulty: string;
  } | null;
  loading: boolean;
}

export default function QuestModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  loading,
}: QuestModalProps) {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [category, setCategory] = React.useState("Coding");
  const [attribute, setAttribute] = React.useState("intellect");
  const [difficulty, setDifficulty] = React.useState("easy");
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setDescription(initialData.description || "");
      setCategory(initialData.category || "Coding");
      setAttribute(initialData.attribute || "intellect");
      setDifficulty(initialData.difficulty || "easy");
    } else {
      setTitle("");
      setDescription("");
      setCategory("Coding");
      setAttribute("intellect");
      setDifficulty("easy");
    }
    setError("");

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [initialData, isOpen, onClose]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    setError("");
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        attribute,
        difficulty,
      });
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to save quest");
      }
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quest-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-lg rounded-2xl border border-obsidian-800 bg-obsidian-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-obsidian-800">
          <h2 id="quest-modal-title" className="text-lg font-bold font-display tracking-wide text-white">
            {initialData?.id ? "Edit Quest" : "Forge New Quest"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-lg p-1.5 text-neutral-400 hover:text-white hover:bg-obsidian-800 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-arcane"
          >
            ✕
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="quest-title"
              className="block text-xs font-semibold uppercase tracking-wider text-neutral-400"
            >
              Quest Title
            </label>
            <input
              id="quest-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Master dynamic programming fundamentals"
              className="mt-1 w-full rounded-lg border border-obsidian-750 bg-obsidian-850 px-3.5 py-2 text-sm text-white placeholder-neutral-500 focus:border-arcane focus:outline-none focus:ring-1 focus:ring-arcane"
            />
          </div>

          <div>
            <label
              htmlFor="quest-description"
              className="block text-xs font-semibold uppercase tracking-wider text-neutral-400"
            >
              Description (Optional)
            </label>
            <textarea
              id="quest-description"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Solve 3 medium problems on recursion"
              className="mt-1 w-full rounded-lg border border-obsidian-750 bg-obsidian-850 px-3.5 py-2 text-sm text-white placeholder-neutral-500 focus:border-arcane focus:outline-none focus:ring-1 focus:ring-arcane"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label
                htmlFor="quest-category"
                className="block text-xs font-semibold uppercase tracking-wider text-neutral-400"
              >
                Category
              </label>
              <input
                id="quest-category"
                type="text"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Coding, Fitness..."
                className="mt-1 w-full rounded-lg border border-obsidian-750 bg-obsidian-850 px-3 py-2 text-sm text-white focus:border-arcane focus:outline-none focus:ring-1 focus:ring-arcane"
              />
            </div>

            <div>
              <label
                htmlFor="quest-attribute"
                className="block text-xs font-semibold uppercase tracking-wider text-neutral-400"
              >
                Attribute
              </label>
              <select
                id="quest-attribute"
                value={attribute}
                onChange={(e) => setAttribute(e.target.value)}
                className="mt-1 w-full rounded-lg border border-obsidian-750 bg-obsidian-850 px-3 py-2 text-sm text-white focus:border-arcane focus:outline-none focus:ring-1 focus:ring-arcane"
              >
                <option value="intellect">Intellect</option>
                <option value="strength">Strength</option>
                <option value="vitality">Vitality</option>
                <option value="focus">Focus</option>
                <option value="discipline">Discipline</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="quest-difficulty"
                className="block text-xs font-semibold uppercase tracking-wider text-neutral-400"
              >
                Difficulty
              </label>
              <select
                id="quest-difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="mt-1 w-full rounded-lg border border-obsidian-750 bg-obsidian-850 px-3 py-2 text-sm text-white focus:border-arcane focus:outline-none focus:ring-1 focus:ring-arcane"
              >
                <option value="easy">Easy (50 XP)</option>
                <option value="medium">Medium (80 XP)</option>
                <option value="hard">Hard (120 XP)</option>
                <option value="epic">Epic (200 XP)</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-obsidian-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-obsidian-750 px-4 py-2 text-sm font-medium text-neutral-400 hover:text-white hover:bg-obsidian-800 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-arcane"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-arcane px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-arcane/20 transition hover:bg-arcane-light disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-arcane"
            >
              {loading
                ? "Saving..."
                : initialData?.id
                ? "Update Quest"
                : "Forge Quest"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
