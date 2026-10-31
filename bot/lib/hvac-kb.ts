export type KbCard = {
  id: string;
  title: string;
  aliases: string[];
  category: string;
  summary: string;
  steps: string[];
  cautions: string[];
};

export const HVAC_KB: KbCard[] = [
  {
    id: "dual-capacitor",
    title: "Dual-run capacitor (condenser hums, no start)",
    aliases: ["capacitor", "dual cap", "run cap", "humming", "won't start", "wont start"],
    category: "electrical",
    summary:
      "A swollen or out-of-tolerance dual cap is the most common no-start on a 1.5–5 ton condenser. Confirm microfarads against the nameplate before you swap.",
    steps: [
      "Kill power at the disconnect. Confirm 0 VAC at the contactor.",
      "Photo the cap and the nameplate (HERM / FAN / common).",
      "Discharge the cap. Measure µF on HERM and FAN vs nameplate ±6%.",
      "Inspect the contactor face and the compressor windings if the cap is in range.",
      "Match the replacement µF and equal-or-higher voltage. Do not undersize.",
    ],
    cautions: [
      "A 3-ton residential condenser is often 35–45/5 µF. Read the nameplate — do not guess.",
      "A hard-start kit is not a substitute for a failed compressor.",
    ],
  },
  {
    id: "superheat-subcooling",
    title: "Superheat and subcooling",
    aliases: ["superheat", "subcooling", "charge", "410a", "r410", "r-410a", "454b"],
    category: "refrigerant",
    summary:
      "Fixed orifice: charge by superheat. TXV: charge by subcooling. Use the manufacturer's chart for the outdoor WB/DB and indoor WB.",
    steps: [
      "Confirm airflow first (filter, coil, blower). Do not charge a dirty coil.",
      "Stabilize 10–15 minutes with the condenser running.",
      "Superheat = suction line temp − evaporator saturation (low-side P/T).",
      "Subcooling = condenser saturation (high-side P/T) − liquid line temp.",
      "Typical TXV target is 8–12°F subcooling unless the data plate says otherwise.",
    ],
    cautions: [
      "R-410A is high pressure. Recover legally. Do not vent.",
      "R-454B (A2L) needs rated gauges, recovery, and ignition-source awareness.",
    ],
  },
  {
    id: "condensate-overflow",
    title: "Condensate overflow / tripped float",
    aliases: ["drain", "condensate", "overflow", "float switch", "pan"],
    category: "water",
    summary:
      "A clogged primary drain or stuck float shuts the system down. Clear the trap, verify the secondary, and test the switch.",
    steps: [
      "Find whether the float, overflow switch, or wet switch opened the Y or R circuit.",
      "Clear the trap and primary with a wet/dry vac from the cleanout, not the pan.",
      "Flush with water. Tablets only after the line flows.",
      "Confirm the secondary drain or wet switch still works. Leave the pan dry.",
    ],
    cautions: ["Attic overflows ruin ceilings. Do not leave a stuck float bypassed."],
  },
  {
    id: "static-pressure",
    title: "Total external static pressure",
    aliases: ["static", "tesp", "airflow", "blower"],
    category: "airflow",
    summary:
      "High static is the usual reason a coil ices or a house has weak rooms. Measure TESP before you blame charge.",
    steps: [
      "Drill or use existing ports on the return and supply plenums, not the cabinet face.",
      "TESP = supply static + return static (absolute values).",
      "Compare to the blower's rated TESP, often 0.50 in. w.c. on residential.",
      "If high, check filter, coil, flex kinks, and undersized return.",
    ],
    cautions: ["A field sketch is not a Manual D. Flag a redesign when static stays high after obvious fixes."],
  },
  {
    id: "furnace-sequence",
    title: "Gas furnace sequence of operation",
    aliases: ["furnace", "ignitor", "flame sensor", "heat", "limit"],
    category: "heat",
    summary:
      "W call → inducer → pressure switch → ignitor → gas valve → flame sense → blower after heat delay. Stop at the first failed proof.",
    steps: [
      "Watch the board LEDs. Note the flash code before you reset.",
      "Confirm inducer and pressure-switch hose, then 24 VAC to the ignitor/valve.",
      "Clean the flame sensor with a non-scratch pad. Do not sand it to a knife edge.",
      "Check temperature-limit and rollout before you replace parts.",
    ],
    cautions: ["Combustion and gas leaks are stop-work. If you smell gas, shut the cock and ventilate."],
  },
  {
    id: "heat-pump-defrost",
    title: "Heat-pump defrost",
    aliases: ["defrost", "heat pump", "icing", "reversing valve"],
    category: "heat",
    summary:
      "A frosted outdoor coil in heat is normal. A block of ice that never clears is a defrost or airflow problem.",
    steps: [
      "Force a defrost if the board allows it. Reversing valve should shift and outdoor fans stop.",
      "Check outdoor coil airflow, defrost sensor/thermistor, and the board timer.",
      "If it ices in cool mode, that is low airflow or low charge — not defrost.",
    ],
    cautions: ["Do not chip ice off a running coil. Kill power and melt it."],
  },
  {
    id: "recovery-loto",
    title: "Recovery and LOTO",
    aliases: ["loto", "lockout", "recovery", "epa", "vacate"],
    category: "safety",
    summary:
      "Lock it out before you cut. Recover before you open a charged system. Those two rules keep you legal and alive.",
    steps: [
      "Disconnect, lock, tag, try. Prove 0 VAC.",
      "Recover to EPA limits into a rated tank. Weigh in and out.",
      "Pressurize with nitrogen and leak-check before you braze under vacuum.",
      "Evacuate to 500 microns and decay-test before you charge.",
    ],
    cautions: ["Never mix refrigerants in a recovery tank. Never work a live disconnect with the cover off for 'just a second'."],
  },
  {
    id: "coil-clean",
    title: "Evaporator / condenser coil clean",
    aliases: ["coil clean", "coil cleaning", "acid", "fin"],
    category: "maintenance",
    summary:
      "A dirty evaporator looks like a charge problem. Clean it, then re-check superheat/subcooling.",
    steps: [
      "Drop cloths, power off, pull the blower if you cannot reach the coil face.",
      "Use the cleaner the fin stock allows. Rinse until the water runs clear.",
      "Straighten fins. Confirm the drain flows after the wash.",
      "Restore panels and re-check temperature split.",
    ],
    cautions: ["Keep cleaner off the board, the winding, and the customer's floor."],
  },
  {
    id: "duct-takeoff",
    title: "Duct walkthrough and takeoff",
    aliases: ["duct", "flex", "takeoff", "manual d", "boot", "trunk"],
    category: "duct",
    summary:
      "Walk the trunk, count supplies and returns, note kinks and crushed flex, and measure rooms. The sketch is a takeoff aid, not a stamped Manual D.",
    steps: [
      "List rooms with width × depth and supply/return count.",
      "Note trunk size, takeoff size, and flex run length/kinks.",
      "Call `floor_plan` with those rooms and ducts.",
      "Call out crushed flex, missing returns, and attic equipment access.",
    ],
    cautions: ["Do not present CFM or friction-rate numbers as engineered values."],
  },
  {
    id: "nameplate",
    title: "Reading a nameplate",
    aliases: ["model", "serial", "nameplate", "tonnage", "goodman", "trane", "carrier", "rheem"],
    category: "equipment",
    summary:
      "Tonnage, refrigerant, min-circuit ampacity, and cap size live on the data plate. Photograph it before you quote parts.",
    steps: [
      "Photo the indoor and outdoor plates plus the cap.",
      "Decode tonnage from the model (often 18/24/30/36/42/48/60).",
      "Match the replacement to refrigerant, voltage, and meter size.",
    ],
    cautions: ["A model lookup without the plate is a guess. Say that out loud."],
  },
];

function haystack(card: KbCard): string {
  return [card.id, card.title, card.category, card.summary, ...card.aliases].join(" ").toLowerCase();
}

export function lookupEquipment(query: string): KbCard[] {
  const terms = query
    .toLowerCase()
    .split(/[^a-z0-9+]+/)
    .filter((term) => term.length > 1);
  if (terms.length === 0) return HVAC_KB.slice(0, 3);
  const scored = HVAC_KB.map((card) => {
    const text = haystack(card);
    const score = terms.reduce((sum, term) => sum + (text.includes(term) ? 1 : 0), 0);
    return { card, score };
  })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, 3).map((row) => row.card);
}
