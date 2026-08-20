"use client";

import { useState } from "react";

const OTHER_VALUE = "__other__";
const FIELD_CLASSES =
  "mt-1 w-full border border-hairline bg-transparent px-3 py-2 text-sm text-ink placeholder:text-ink/40 focus:border-ink focus:outline-none dark:border-hairline-dark dark:text-ink-dark dark:placeholder:text-ink-dark/40 dark:focus:border-ink-dark";

// Existing categories only get updated by redeploy in most stacks — this
// dropdown instead reflects whatever's actually in the courses table right
// now (passed in from the server), so a category created via "Other"
// yesterday already shows up as a normal option today.
export default function CategoryField({ categories }: { categories: string[] }) {
  const [selected, setSelected] = useState("");
  const isOther = selected === OTHER_VALUE;

  return (
    <div>
      <label className="text-sm font-medium text-ink dark:text-ink-dark">
        Category
        <select
          name={isOther ? undefined : "category"}
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className={FIELD_CLASSES}
        >
          <option value="">Select a category…</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
          <option value={OTHER_VALUE}>Other (new category)</option>
        </select>
      </label>
      {isOther && (
        <input
          name="category"
          type="text"
          required
          placeholder="New category name"
          className={`${FIELD_CLASSES} mt-2`}
        />
      )}
    </div>
  );
}
