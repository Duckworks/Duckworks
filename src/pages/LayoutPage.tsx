import { useRef, type PointerEvent } from "react";
import type { FloorPlan, LayoutItem } from "../types";

type Props = {
  walkthrough: string;
  onWalkthrough: (value: string) => void;
  onGenerate: () => void;
  plan?: FloorPlan;
  plans: FloorPlan[];
  onChoosePlan: (id: string) => void;
  onUpdatePlan: (plan: FloorPlan) => void;
};

export function LayoutPage({
  walkthrough,
  onWalkthrough,
  onGenerate,
  plan,
  plans,
  onChoosePlan,
  onUpdatePlan,
}: Props) {
  const drag = useRef<{ id: string; dx: number; dy: number } | null>(null);

  const moveItem = (id: string, x: number, y: number) => {
    if (!plan) return;
    onUpdatePlan({
      ...plan,
      updatedAt: new Date().toISOString(),
      items: plan.items.map((item) => (item.id === id ? { ...item, x, y } : item)),
    });
  };

  const onSketch = (file: File | undefined) => {
    if (!file || !plan) return;
    const reader = new FileReader();
    reader.onload = () => {
      onUpdatePlan({
        ...plan,
        sketchDataUrl: String(reader.result),
        updatedAt: new Date().toISOString(),
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <section>
      <p className="kicker">Floor plans & ducts</p>
      <h1>Layout studio</h1>
      <p className="lede">
        Paste a walkthrough or drop a sketch. Duckworks turns room sizes, the air handler, supplies, and returns into a
        plan you can drag on the truck.
      </p>

      <div className="layout-wrap">
        <div>
          <div className="card">
            <p className="kicker">Walkthrough</p>
            <textarea
              aria-label="Walkthrough notes"
              value={walkthrough}
              onChange={(event) => onWalkthrough(event.target.value)}
            />
            <div className="form-actions">
              <button className="btn btn-amber" onClick={onGenerate}>
                Build plan from notes
              </button>
            </div>
          </div>
          <div className="card">
            <p className="kicker">Sketch overlay</p>
            <input
              type="file"
              accept="image/*"
              aria-label="Upload field sketch"
              onChange={(event) => onSketch(event.target.files?.[0])}
            />
            <p className="lede" style={{ marginTop: 10, marginBottom: 0 }}>
              Phone photo of a napkin sketch sits under the rooms. Trace over it, then move the AHU.
            </p>
          </div>
          {plans.length > 0 && (
            <div className="card">
              <p className="kicker">Saved plans</p>
              <div className="article-list">
                {plans.map((saved) => (
                  <button
                    key={saved.id}
                    className={saved.id === plan?.id ? "selected" : ""}
                    onClick={() => onChoosePlan(saved.id)}
                  >
                    {saved.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          {!plan ? (
            <div className="empty">No plan yet. Build one from the walkthrough on the left.</div>
          ) : (
            <>
              <div className="tools">
                <span className="pill">{plan.name}</span>
                <span className="meta">{plan.items.length} pieces</span>
              </div>
              <div className="canvas-frame">
                <svg
                  className="plan"
                  viewBox="0 0 720 480"
                  role="img"
                  aria-label="Floor plan canvas"
                  onPointerMove={(event) => {
                    if (!drag.current) return;
                    const svg = event.currentTarget;
                    const pt = svg.createSVGPoint();
                    pt.x = event.clientX;
                    pt.y = event.clientY;
                    const cursor = pt.matrixTransform(svg.getScreenCTM()?.inverse());
                    moveItem(drag.current.id, cursor.x - drag.current.dx, cursor.y - drag.current.dy);
                  }}
                  onPointerUp={() => {
                    drag.current = null;
                  }}
                >
                  {plan.sketchDataUrl && (
                    <image href={plan.sketchDataUrl} x="0" y="0" width="720" height="480" opacity="0.35" />
                  )}
                  {plan.items.map((item) => (
                    <Shape
                      key={item.id}
                      item={item}
                      onDragStart={(event) => {
                        const svg = event.currentTarget.ownerSVGElement;
                        if (!svg) return;
                        const pt = svg.createSVGPoint();
                        pt.x = event.clientX;
                        pt.y = event.clientY;
                        const cursor = pt.matrixTransform(svg.getScreenCTM()?.inverse());
                        drag.current = { id: item.id, dx: cursor.x - item.x, dy: cursor.y - item.y };
                        event.currentTarget.setPointerCapture(event.pointerId);
                      }}
                    />
                  ))}
                </svg>
              </div>
              <ul className="pull-list" style={{ marginTop: 12 }}>
                {plan.items
                  .filter((item) => item.kind !== "duct")
                  .map((item) => (
                    <li key={item.id}>
                      <span>{item.label}</span>
                      <span className="who">{item.kind}</span>
                    </li>
                  ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function Shape({
  item,
  onDragStart,
}: {
  item: LayoutItem;
  onDragStart: (event: PointerEvent<SVGElement>) => void;
}) {
  if (item.kind === "duct" && item.points) {
    const d = item.points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x} ${point.y}`).join(" ");
    return <path className="duct" d={d} />;
  }
  if (item.kind === "supply" || item.kind === "return") {
    return (
      <g onPointerDown={onDragStart} style={{ cursor: "grab" }}>
        <rect className={item.kind} x={item.x} y={item.y} width={item.w} height={item.h} rx="2" />
        <text x={item.x} y={item.y - 4} fill="#b5ae96" fontSize="10">
          {item.kind === "supply" ? "S" : "R"}
        </text>
      </g>
    );
  }
  return (
    <g onPointerDown={onDragStart} style={{ cursor: "grab" }}>
      <rect className={item.kind === "equipment" ? "equipment" : "room"} x={item.x} y={item.y} width={item.w} height={item.h} />
      <text x={item.x + 8} y={item.y + 18} fill="#f3ecd8" fontSize="12">
        {item.label.replace(/\s+\d.*/, "")}
      </text>
      <text x={item.x + 8} y={item.y + 34} fill="#b5ae96" fontSize="11">
        {item.label.match(/\d.+$/)?.[0] ?? ""}
      </text>
    </g>
  );
}
