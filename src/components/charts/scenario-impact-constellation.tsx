import { IndexValue } from '@/components/ui/formatted-values';
import type { ScenarioImpact } from '@/data';

interface ScenarioImpactConstellationProps {
  impact: ScenarioImpact;
}

function finiteIndex(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? Math.round(value) : 0;
}

function shiftWidth(beforeIndex: number, afterIndex: number) {
  return Math.max(8, Math.min(100, Math.round((Math.max(beforeIndex, afterIndex) / 220) * 100)));
}

export function ScenarioImpactConstellation({ impact }: ScenarioImpactConstellationProps) {
  const shifts = impact.constellationShift
    .map((shift) => ({
      segmentId: shift.segmentId,
      label: shift.label,
      beforeIndex: finiteIndex(shift.beforeIndex),
      afterIndex: finiteIndex(shift.afterIndex),
    }))
    .filter((shift) => shift.segmentId && shift.label);

  return (
    <figure
      aria-label="Scenario constellation shift"
      className="overflow-hidden rounded-lg border border-galaxy-border bg-[radial-gradient(circle_at_top_right,rgba(201,164,92,0.14),transparent_42%),linear-gradient(135deg,rgba(10,10,14,0.92),rgba(25,24,30,0.9))] p-4 sm:p-5"
    >
      <figcaption>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-galaxy-gold">Scenario constellation</p>
        <h2 className="mt-2 font-serif text-2xl text-galaxy-cream">Segment index movement</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-galaxy-muted">
          Before and after positions use modelled CDE opportunity signals only.
        </p>
      </figcaption>

      {shifts.length > 0 ? (
        <div className="mt-5 space-y-4">
          {shifts.map((shift) => {
            const width = shiftWidth(shift.beforeIndex, shift.afterIndex);

            return (
              <article key={shift.segmentId} className="rounded-lg border border-galaxy-border bg-galaxy-ink/42 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h3 className="font-semibold text-galaxy-cream">{shift.label}</h3>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <span className="text-galaxy-muted">
                      Before <span className="font-semibold text-galaxy-cream"><IndexValue value={shift.beforeIndex} label="CDE before signal" /></span>
                    </span>
                    <span className="text-galaxy-muted">
                      After <span className="font-semibold text-galaxy-cream"><IndexValue value={shift.afterIndex} label="CDE after signal" /></span>
                    </span>
                  </div>
                </div>
                <div className="mt-4 h-3 overflow-hidden rounded-full bg-galaxy-market">
                  <div
                    className="h-full rounded-full bg-galaxy-gold"
                    style={{ width: `${width}%` }}
                    aria-label={`${shift.label} after CDE opportunity signal ${shift.afterIndex}`}
                  />
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="mt-5 rounded-lg border border-galaxy-border bg-galaxy-ink/42 p-4">
          <p className="font-semibold text-galaxy-cream">No scenario shift available yet.</p>
          <p className="mt-2 text-sm leading-6 text-galaxy-muted">
            Choose a segment and adjust the levers to generate a finite CDE signal movement.
          </p>
          <p className="mt-4 text-sm font-semibold text-galaxy-muted">
            Baseline <span className="text-galaxy-cream"><IndexValue value={0} label="CDE baseline signal" /></span>
          </p>
        </div>
      )}
    </figure>
  );
}
