import type { KnowledgeArticle } from "../types";

export const ARTICLES: KnowledgeArticle[] = [
  {
    id: "sop-no-cool",
    title: "No-cool call, first 15 minutes",
    category: "charging",
    summary:
      "Confirm the call is real, then split the fault: air, power, or refrigerant. Do not add gas until airflow and electrical check out.",
    when: ["no cool", "not cooling", "warm air", "ac down"],
    steps: [
      "Ask: thermostat mode/setpoint, last time it cooled, breaker trips, water stains.",
      "Indoor: filter, blower running, coil frost, drain pan standing water, return pull.",
      "Outdoor: contactor pulled in, condenser fan, compressor hum vs run, debris.",
      "Electrical: incoming voltage, capacitor (rated ±6%), amp draw vs RLA.",
      "Only then: pressures, line temps, superheat/subcooling against the charging chart.",
    ],
    watchouts: [
      "A dirty filter or closed supply can look like a low-charge call.",
      "If the coil is frozen, thaw and fix airflow before you talk charge.",
    ],
    tags: ["no cool", "diagnosis", "airflow", "capacitor"],
  },
  {
    id: "sop-charge",
    title: "Charge by superheat or subcooling",
    category: "charging",
    summary:
      "TXV/EEV systems are charged to subcooling. Fixed-orifice systems are charged to superheat. Weigh in on a dry system.",
    when: ["superheat", "subcooling", "charge", "undercharge", "410a", "r-32"],
    steps: [
      "Confirm metering device. TXV/EEV → target subcooling from the data plate (often 8–12°F). Piston/cap → target superheat from the chart.",
      "Stabilize 10–15 minutes with indoor fan on and outdoor in the sun as found.",
      "Liquid line temp and liquid pressure → subcooling. Suction temp and suction pressure → superheat.",
      "Add or recover in small amounts. Weigh every ounce. Do not use sight-glass as the only method on 410A.",
      "Record outdoor dry bulb, indoor WB, pressures, SH, SC, and what you added.",
    ],
    watchouts: [
      "R-410A and R-32 are high pressure. Use the right hoses and recovery gear.",
      "A restriction (filter drier, TXV) can show high SC and low SH together — that is not a charge problem.",
    ],
    tags: ["superheat", "subcooling", "r-410a", "r-32", "txv"],
  },
  {
    id: "sop-cap-test",
    title: "Test a run capacitor in the field",
    category: "electrical",
    summary:
      "A weak capacitor is the most common no-cool parts fail. Test it, do not guess from the bulge.",
    when: ["capacitor", "humming", "hard start", "fan won't spin"],
    steps: [
      "Kill power. Confirm 0 VAC at the contactor and compressor.",
      "Discharge the cap with a 20kΩ resistor, not a screwdriver across the terminals.",
      "Pull the wires. Meter on µF. HERM and FAN to C.",
      "Replace if it is more than 6% off the rating or if the can is swollen.",
      "Match µF and meet or exceed VAC. Dual caps: both sides have to land in spec.",
    ],
    watchouts: [
      "A compressor that is drawing locked-rotor after a good cap and good voltage is a compressor problem, not another cap.",
      "Never run a compressor without a known-good run cap.",
    ],
    tags: ["capacitor", "electrical", "compressor", "contactor"],
  },
  {
    id: "sop-condensate",
    title: "Secondary drain and overflow",
    category: "condensate",
    summary:
      "Water on the ceiling is a drain problem until proven otherwise. Clear it, then make sure the safety switch will trip.",
    when: ["leak", "water", "overflow", "wet ceiling", "drain"],
    steps: [
      "Protect floors. Wet-vac the pan. Do not keep running the unit into a full pan.",
      "Clear the primary: wet-vac the trap, then flush. Snake only if you can see the path.",
      "Confirm trap depth and that the secondary is piped or the overflow switch is in the pan.",
      "Test the float or pan switch: lift it, unit should stop. If it does not, fix the interlock.",
      "Tablets or clean-out after you have flow. Tell the customer what will stain if it happens again.",
    ],
    watchouts: [
      "A slime-clogged trap that you only blow out will call you back in a week.",
      "Attic coils need a working overflow switch. Do not leave without one.",
    ],
    tags: ["condensate", "leak", "overflow", "pan switch"],
  },
  {
    id: "sop-furnace-seq",
    title: "Gas furnace sequence of operation",
    category: "gas",
    summary:
      "If you know the sequence, you know which part failed. Do not jump out safeties to 'test'.",
    when: ["no heat", "furnace", "igniter", "flame sensor", "inducer"],
    steps: [
      "Call for heat. Inducer starts. Pressure switch closes.",
      "Hot-surface igniter or spark. Gas valve opens. Flame sense proves in a few seconds.",
      "Blower starts after the heat-on delay. Limit stays closed.",
      "If it lights and dies: clean/replace flame sensor, check ground, confirm flame envelope.",
      "If it never lights: inducer, pressure switch hose, igniter ohms/glow, 24V at the valve.",
    ],
    watchouts: [
      "A cracked heat exchanger is a walk-away until it is replaced. Do not keep firing it.",
      "CO around the flue or in the house ends the diagnostic. Shut it down and ventilate.",
    ],
    tags: ["furnace", "no heat", "flame sensor", "pressure switch"],
  },
  {
    id: "sop-heat-pump",
    title: "Heat pump no-heat and defrost",
    category: "heat_pump",
    summary:
      "In Florida a 'no heat' heat pump is often a defrost, reversing-valve, or aux-heat problem, not a dead compressor.",
    when: ["heat pump", "no heat", "defrost", "reversing valve", "aux"],
    steps: [
      "Mode and setpoint. Outdoor running? Ice on the outdoor coil?",
      "If iced: force defrost. Watch RV shift, outdoor fan stop, and steam-off. Time the cycle.",
      "Check O/B at the thermostat and at the outdoor board. Confirm RV solenoid voltage.",
      "Aux/emergency heat strips: 240V, sequencers, and that the thermostat is actually calling E/AUX.",
      "If it cools in heat mode, the RV is stuck or the O/B config is wrong.",
    ],
    watchouts: [
      "Do not chip ice. Melt it. Bent fins and a cracked coil cost more than the call.",
      "A noisy RV on shift can still work. A silent RV with no pressure swap does not.",
    ],
    tags: ["heat pump", "defrost", "reversing valve", "aux heat"],
  },
  {
    id: "sop-static",
    title: "Total external static pressure",
    category: "duct",
    summary:
      "If TESP is over the blower rating, the system cannot move the air you charged it for. Measure it on every callback that 'still doesn't cool'.",
    when: ["static", "airflow", "duct", "hot rooms", "blower"],
    steps: [
      "Drill or use existing test ports: supply plenum after the unit, return before the unit.",
      "Magnehelic or digital manometer. Fan on high, doors closed, filter in.",
      "TESP = supply + return (absolute). Compare to the blower chart, often 0.50 in. w.c. residential.",
      "High return static: filter, coil, return size. High supply static: coil, dirty coil, undersized trunk, closed dampers.",
      "Write both numbers on the ticket. That is the argument for a duct repair.",
    ],
    watchouts: [
      "A 16x25x1 filter on a 4-ton in a closet will fail TESP every time.",
      "Do not use the same hole for both probes and guess.",
    ],
    tags: ["static pressure", "duct", "airflow", "tesp"],
  },
  {
    id: "sop-duct",
    title: "Sketch a duct layout that can be built",
    category: "duct",
    summary:
      "Trunk first, then takeoffs, then returns. Note sizes in inches, not 'big enough'. Keep flex runs short and pulled tight.",
    when: ["duct", "layout", "flex", "trunk", "takeoff", "floor plan"],
    steps: [
      "Walk the house. Room names, sizes, and what is too hot or loud.",
      "Place the air handler and the outdoor unit. Shortest line-set and condensate path wins.",
      "Draw a supply trunk. Takeoffs toward the end of each room, not the door.",
      "Return: one large central is fine if TESP allows; add a second if bedrooms starve.",
      "Call out insulation, start collars, and any fire or garage separation.",
    ],
    watchouts: [
      "Flex crushed in a joist bay is a restriction, not a duct.",
      "A supply in the floor of a wet-return hallway will short-cycle air.",
    ],
    tags: ["duct", "layout", "manual d", "flex"],
  },
  {
    id: "sop-pm",
    title: "Seasonal maintenance that is actually a maintenance",
    category: "equipment",
    summary:
      "A PM is a measured visit, not a filter and a smile. Leave numbers the next tech can trust.",
    when: ["maintenance", "tune up", "pm", "seasonal"],
    steps: [
      "Filter size and condition. Replace or tell them the MERV they can actually run.",
      "Wash condenser. Rinse the indoor coil only if you can control the water.",
      "Electrical: lugs, cap µF, amp draw, incoming voltage.",
      "Drain: flush, tablets, test the switch.",
      "Charge check: SH/SC or weigh if it is a critically charged mini-split. Record outdoor temp.",
    ],
    watchouts: [
      "Do not 'top off' a 410A system on a PM without a reason and a weight.",
      "A noisy inducer or rusted heat exchanger on a PM is a safety write-up, not a later callback.",
    ],
    tags: ["maintenance", "pm", "coil wash", "filter"],
  },
  {
    id: "sop-safety",
    title: "Lockout, refrigerant, and attic rules",
    category: "safety",
    summary:
      "The job is not worth a fall, a burn, or a charged capacitor. Slow is how you get home.",
    when: ["safety", "lockout", "recovery", "attic", "co"],
    steps: [
      "Lockout/tagout before you open a panel that can come back live. Prove dead.",
      "Recover, do not vent. R-22, 410A, R-32 — same rule.",
      "Attic: boards, light, water, and a way out. No lone-wolf on a rotten deck.",
      "Combustion: CO detector on, flue tight, no cracks you shrug at.",
      "A2L (R-32 / R-454B): no open flame on an open system, ventilate, right recovery gear.",
    ],
    watchouts: [
      "A capacitor holds a charge after the disconnect is pulled.",
      "If you smell gas, the meter comes out before the manifold.",
    ],
    tags: ["safety", "lockout", "a2l", "recovery", "co"],
  },
  {
    id: "eq-carrier-24acc",
    title: "Carrier 24ACC / 24ACC6 condenser notes",
    category: "equipment",
    summary:
      "Common 13–16 SEER single-stage 410A condenser. Dual cap and a Puron charge. Data plate SC is the charge target.",
    when: ["carrier", "24acc", "24acc6", "puron"],
    steps: [
      "Confirm model and serial on the outdoor data plate before you order parts.",
      "Factory charge assumes 15 ft of line set. Weigh for long or short sets.",
      "Typical fail: dual run cap, then contactor, then fan motor.",
      "If pressures are high on both sides, look at the coil and the piston/TXV, not a 'overcharge' guess.",
    ],
    watchouts: ["Puron is R-410A. Pink drum. High pressure. Liquid charge through the liquid king."],
    tags: ["carrier", "24acc", "r-410a", "equipment"],
  },
  {
    id: "eq-goodman-gsx",
    title: "Goodman GSX13 / GSX16 condenser notes",
    category: "equipment",
    summary:
      "Workhorse 410A split condenser. Cheap to keep alive if the coil is clean and the cap is in spec.",
    when: ["goodman", "gsx13", "gsx16"],
    steps: [
      "Louvered panels come off for a real coil wash. Do not just spray the face.",
      "Check the contactor pitting; Goodman contactors fail early in coastal air.",
      "Charge to the data plate SC with the indoor blower on high.",
      "If the compressor is noisy at start and the cap is good, check start components and voltage drop.",
    ],
    watchouts: ["Coastal Largo/Clearwater units eat fins. Comb them; do not pressure-wash the fins flat."],
    tags: ["goodman", "gsx", "coastal", "equipment"],
  },
  {
    id: "eq-trane-xr15",
    title: "Trane XR15 notes",
    category: "equipment",
    summary:
      "Spine-fin 410A condenser. You do not comb a spine-fin like a plate-fin. Charge and airflow still rule the call.",
    when: ["trane", "xr15", "spine fin"],
    steps: [
      "Wash from the inside out if you can access it. Do not drive dirt into the core.",
      "Use Trane-specific caps and the Comfort-R / blower profile at the air handler.",
      "Charge to subcooling. These are TXV indoor matches.",
    ],
    watchouts: ["A flattened spine-fin coil is a replacement conversation, not a comb."],
    tags: ["trane", "xr15", "spine-fin", "equipment"],
  },
];

export function articleById(id: string): KnowledgeArticle | undefined {
  return ARTICLES.find((article) => article.id === id);
}
