import {
  COUNTRIES,
  COUNTRY_FLAGS,
  COUNTRY_NAMES,
  type CountryFilter,
  type TypeFilter,
} from "@/lib/worlds";

export interface FilterState {
  type: TypeFilter;
  country: CountryFilter;
  normalOnly: boolean;
  search: string;
}

interface FilterBarProps {
  filters: FilterState;
  onChange: (next: Partial<FilterState>) => void;
}

const inputClass =
  "w-full h-10 px-3 rounded bg-surface border border-border text-fg focus:outline-none focus:border-muted transition-colors";

export function FilterBar({ filters, onChange }: FilterBarProps) {
  return (
    <section className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Field label="Type">
          <select
            value={filters.type}
            onChange={(e) => onChange({ type: e.target.value as TypeFilter })}
            className={inputClass}
          >
            <option value="all">All</option>
            <option value="Members">Members only</option>
            <option value="Free">Free-to-Play only</option>
          </select>
        </Field>

        <Field label="Country">
          <select
            value={filters.country}
            onChange={(e) => onChange({ country: e.target.value as CountryFilter })}
            className={inputClass}
          >
            <option value="all">All</option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {COUNTRY_FLAGS[c]} {COUNTRY_NAMES[c]}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Search">
          <input
            value={filters.search}
            onChange={(e) => onChange({ search: e.target.value })}
            placeholder="World #, activity..."
            className={`${inputClass} placeholder:text-muted`}
          />
        </Field>
      </div>

      <label className="inline-flex items-center gap-2 cursor-pointer text-sm select-none">
        <input
          type="checkbox"
          checked={filters.normalOnly}
          onChange={(e) => onChange({ normalOnly: e.target.checked })}
          className="h-4 w-4 accent-accent"
        />
        Normal worlds only (no PvP / skill total / minigames)
      </label>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wide text-muted mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}
