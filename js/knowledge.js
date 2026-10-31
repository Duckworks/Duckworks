export const KNOWLEDGE = [
  {
    id: 'outdoor-unit-silent',
    title: 'Outdoor unit is silent',
    tags: ['no cool', 'capacitor', 'contactor', 'compressor', 'disconnect'],
    lead: 'An indoor fan that runs only proves the thermostat is calling and the blower has power. The outdoor unit is a separate circuit. Start at the disconnect and the contactor.',
    checks: [
      'Set the thermostat to cool, drop the setpoint below the room, and leave the fan on auto. A schedule or a dead battery still shows up as a no-cool call.',
      'At the outdoor unit, confirm the disconnect is seated and measure the line side of the contactor. No line voltage means the breaker or the wire to it, so stop there.',
      'Line side live and the contactor pulled in: kill power, discharge the capacitor, and compare microfarads to the number on the part. Replace it when it is outside the tolerance printed on it.',
      'Contactor not pulled in: look for about 24 volts at the coil. No call means the break is upstream — float switch, pressure control, thermostat, or a broken low-voltage wire.',
      'Gauges mean something only after the outdoor unit is actually running.',
    ],
    safety:
      'Kill power at the breaker and the disconnect before you touch a capacitor, and confirm it is discharged. Treat every capacitor as charged until you measure it.',
    stop: 'A breaker that trips again, a bulged or leaking capacitor, burnt wires, or a grounded compressor. Write it up. Leave that breaker off.',
  },
  {
    id: 'runs-but-warm',
    title: 'Both units run and the air is warm',
    tags: ['no cool', 'charge', 'airflow', 'reversing valve', 'filter'],
    lead: 'Both motors running means you have power and a call. Warm air is then airflow, the reversing valve, or the refrigerant circuit — in that order.',
    checks: [
      'Read the filter, the blower wheel, and both coils before you connect gauges. A packed filter or a matted outdoor coil will mimic a low charge.',
      'On a heat pump, confirm it is in cool. Feel the reversing-valve body and check that the solenoid is getting its call. A valve stuck in heat blows warm air with a running outdoor unit.',
      'Indoor split should be about 18–22°F once airflow is right. A weak split with clean coils is when gauges, superheat, and subcool earn their keep.',
      'Use the charging chart for that outdoor unit. The nameplate is the spec. A number you remember from a different brand is not.',
    ],
    safety:
      'Recover refrigerant if you have to open the system. Venting it is illegal, and the certification rules for your work apply.',
    stop: 'Oil at a joint, a flat system, or a compressor that is drawing locked-rotor amps. That is a leak repair or a compressor diagnosis, not a top-off.',
  },
  {
    id: 'frozen-coil',
    title: 'Evaporator coil is frozen',
    tags: ['frozen', 'ice', 'airflow', 'filter', 'low charge'],
    lead: 'Ice on the coil is a symptom. Melt it and find out whether the coil was starved of air or starved of refrigerant. Do not add refrigerant to a block of ice.',
    checks: [
      'Turn cooling off and run the fan until the coil is clear. A heat-pump defrost or a hair dryer on a cabinet is how people warp coils.',
      'Replace a dirty filter, confirm every supply is open, and check the blower wheel and the evaporator face.',
      'After it is clear, measure temperature split and static pressure. Low airflow with a normal split points at the duct, the wheel, or a weak capacitor on the blower.',
      'Airflow that is honestly fine, and a split that collapses, is when you check charge with the coil dry.',
    ],
    safety: 'A frozen coil dumps water when it thaws. Clear the drain and the secondary pan before you walk away.',
    stop: 'Ice inside the compressor shell, or a blower that will not run. Thawing the cabinet and leaving a dead blower just grows the next block of ice.',
  },
  {
    id: 'short-cycling',
    title: 'Unit short cycles',
    tags: ['short cycle', 'pressure', 'high head', 'low pressure', 'oversized'],
    lead: 'A compressor that starts and stops in under a few minutes is protecting itself or losing its call. Find which one before you condemn the compressor.',
    checks: [
      'Watch a full cycle with the panels on. Note whether it dies on the thermostat call, the contactor, or a pressure switch.',
      'High-pressure trips: dirty outdoor coil, failed condenser fan, a blocked filter-drier, or non-condensables. Low-pressure trips: airflow, a low charge, or a stuck valve.',
      'Confirm the thermostat location. A stat in the supply path or a short anticipation setting will cycle a healthy unit.',
      'Check the capacitor and the contactor for chatter. A chattering contactor cooks itself and looks like a pressure problem.',
    ],
    safety: 'Give the pressures time to equalize before you force another start. Rapid restarts overheat the compressor.',
    stop: 'A pressure switch that has been jumped out. Put it back in the circuit. A compressor that trips its internal overload after a clean coil and a correct capacitor needs a deeper diagnosis.',
  },
  {
    id: 'heat-pump-no-heat',
    title: 'Heat pump is blowing cool air',
    tags: ['no heat', 'heat pump', 'strips', 'defrost', 'emergency heat'],
    lead: 'In mild weather a heat pump supply feels cooler than a gas furnace and can still be right. Cool air that never warms the house is a mode problem, a strip-heat problem, or a valve problem.',
    checks: [
      'Thermostat on heat, not cool, and not left in emergency heat unless you meant to test the strips. Raise the setpoint a few degrees so it actually calls.',
      'Outdoor coil clear, outdoor fan running, and the unit not stuck in defrost. A defrost board that never terminates runs the strips and cools the house.',
      'Feel whether auxiliary heat comes on when the thermostat asks. Strips that pull no amps are a sequencer, a breaker, or a burnt heat kit — not a refrigerant charge.',
      'If the outdoor unit runs, the strips work, and the supply stays cold, check the reversing valve call. The valve should shift to heat and the large vapor line should warm up.',
    ],
    safety:
      'Heat strips pull serious current. Check amps with the panel closed and the breaker rated for the kit. An undersized breaker that someone keeps resetting is a fire.',
    stop: 'A heat kit that is discolored, a breaker that trips on a call for heat, or a defrost board you cannot identify. Replace the failed part. Do not tie the strips out to permanent on.',
  },
  {
    id: 'one-room-hot',
    title: 'One room stays hot',
    tags: ['airflow', 'balance', 'duct', 'damper', 'upstairs'],
    lead: 'One hot room with the rest of the house comfortable is almost never a low charge. The refrigerant circuit cannot single out a bedroom.',
    checks: [
      'Compare supply temperature in the hot room to a room that feels right. The same supply temperature means the air is fine and there is not enough of it, or the room gain is high.',
      'Look for a closed damper, a disconnected run, a crushed flex, and a filter the homeowner stuffed into the grille.',
      'Upstairs over a garage or under a flat roof needs airflow and sometimes a return of its own. Measure static before you promise a new system.',
      'Two-zone systems: confirm that zone is calling and its damper is open. A stuck zone damper starves the room and can dead-head the other zone.',
    ],
    safety: 'Attic walk boards only. Flex duct tears if you kneel on it, and a torn vapor barrier becomes the next moisture call.',
    stop: 'A trunk that is collapsed, full of construction debris, or sized by guesswork on a long addition. That is a duct repair, and adding refrigerant will not move more air.',
  },
  {
    id: 'water-at-the-handler',
    title: 'Water at the air handler',
    tags: ['water', 'drain', 'condensate', 'float switch', 'pan'],
    lead: 'Water at the cabinet is a drain problem until the coil and the pan prove otherwise. Find where it is coming from before you quote a coil.',
    checks: [
      'Primary drain: trap, slope, and a cleanout. A dry trap or a trap that is double-trapped will spit water or pull the pan dry and then overflow.',
      'Blow or vacuum the line both ways only after you know where it terminates. Clearing a line into a finished closet is a bad afternoon.',
      'Secondary pan and the float switch. If the switch is open, the system is doing what it was wired to do.',
      'If the drain is clear and the pan still fills, look at insulation on the cabinet, a low refrigerant coil that is icing and thawing, or a cracked pan.',
    ],
    safety:
      'Kill power before you move a float switch in a wet cabinet. Water and the blower capacitor live in the same box.',
    stop: 'A rusted-through pan or a coil that is actively leaking refrigerant oil. Those get replaced. A jumped float switch does not go back into service that way.',
  },
  {
    id: 'dead-system',
    title: 'Nothing runs at all',
    tags: ['no power', 'thermostat', 'transformer', 'breaker', 'float'],
    lead: 'No indoor fan and no outdoor unit means you do not have a call, or you do not have 24 volts. Prove that before you take a panel off the condenser.',
    checks: [
      'Thermostat display on, batteries if it uses them, and the mode actually calling. Many "dead system" calls are a blank stat.',
      'Breaker on, and the door switch or the float switch closed. A tripped float from last night\'s drain clog looks exactly like a bad transformer.',
      'Measure 24 volts at the air handler transformer. High side live and low side dead is a transformer or its fuse. Both dead is the breaker or the disconnect feeding the air handler.',
      '24 volts present and still no contactor and no blower: the stat wire, R to G and R to Y, is the next split.',
    ],
    safety: 'The transformer primary is line voltage. Meter it like line voltage, not like a thermostat wire.',
    stop: 'A transformer that burned the low-voltage wire brown. Find the short before you land a new transformer on the same wires.',
  },
  {
    id: 'what-to-photograph',
    title: 'What to photograph on every call',
    tags: ['nameplate', 'photo', 'model', 'warranty', 'documentation'],
    lead: 'A nameplate photo is the difference between ordering the right capacitor and driving back. Take it before the panel goes back on.',
    checks: [
      'Outdoor nameplate and indoor nameplate, close enough to read model and serial.',
      'Thermostat wiring before you unland any conductor. A picture beats a guess when the phone rings.',
      'Filter size and the static-pressure ports if you took a reading. Write the numbers in the photo note.',
      'The failure itself: bulged capacitor, burnt contactor, wet switch, crushed duct. The office cannot see what you saw.',
    ],
    safety: 'Do not post customer address photos anywhere but the work order.',
    stop: 'If the nameplate is unreadable, write the model from the invoice or the permit before you leave. Ordering from memory is how wrong parts happen.',
  },
  {
    id: 'duct-size-from-the-room',
    title: 'Rough duct size from the room',
    tags: ['duct', 'cfm', 'trunk', 'manual d', 'airflow'],
    lead: 'Duckworks sizes the plan at about 400 CFM per ton, split by room area, with branches near 600 ft/min and the trunk near 900. Use it to talk about the house. Do not stamp it.',
    checks: [
      'A 3-ton system is about 1,200 CFM. A 4-ton is about 1,600. The outdoor nameplate and the blower chart override that rule.',
      'Give each conditioned room a share of that air by floor area. Garages, attics, and closets do not get a supply in this sketch.',
      'Round pipe at 600 ft/min is the branch. The trunk is larger and slower, near 900 ft/min, so it stays quiet.',
      'A long flex run needs to be larger than the straight-pipe number, or it needs to be shortened. Flex is not a straight duct.',
    ],
    safety: 'An undersized return is louder and harder on the blower than a slightly generous supply. Size the return at least as carefully as the trunk.',
    stop: 'Any plan a permit office will see. That needs a real load calculation and Manual D, not a walkthrough sketch.',
  },
  {
    id: 'filter-and-static',
    title: 'Filter and static pressure',
    tags: ['filter', 'static', 'blower', 'cfm', 'maintenance'],
    lead: 'If you do one measurement on a maintenance visit, make it static pressure. It tells you whether the duct can move the air the blower is rated for.',
    checks: [
      'Read the filter size and the arrow. A high-MERV filter in a rack that was built for a one-inch fiberglass filter will kill airflow.',
      'Total external static is the supply reading plus the return reading, taken with the blower on and a dry coil.',
      'Compare it to the maximum on the blower chart. Over the max, the blower is not delivering the CFM on that chart no matter what the charge looks like.',
      'A big jump across the filter, the coil, or the supply trunk tells you which restriction to fix.',
    ],
    safety: 'Drill static ports with the power off, above the drain pan, and cap them. An open port in a return becomes a whistle and a leak.',
    stop: 'A blower already over its static limit with a clean filter and an open coil. The duct has to change. A stronger motor on the same restriction just gets louder.',
  },
  {
    id: 'float-switch',
    title: 'Condensate float switch',
    tags: ['float', 'safety switch', 'drain', 'no cool'],
    lead: 'A float switch that is doing its job looks like a dead system or a no-cool. Find it before you replace a transformer.',
    checks: [
      'Look in the secondary pan and on the primary drain. Lift the float. If the system starts, you have a drain problem, not an electrical one.',
      'Clear the drain, confirm the pan is empty, and let the float drop on its own.',
      'Make sure the switch breaks R or the Y circuit the way it was designed, and that the wire is not corroded through.',
    ],
    safety: 'Test the switch, then put it back in the circuit. A system that can flood a ceiling is not "repaired" with a jumper.',
    stop: 'A switch that is already jumped, or a pan with no secondary protection on a unit over finished space. Install a working switch. Leave the notes that say you found a jumper.',
  },
  {
    id: 'do-not-add-refrigerant-first',
    title: 'When refrigerant is not the first move',
    tags: ['refrigerant', 'charge', 'gauges', 'top off'],
    lead: 'Low suction pressure is a reading, not a diagnosis. Airflow, a dirty coil, a stuck valve, and a low charge can all look similar on a manifold.',
    checks: [
      'Filter, blower, evaporator face, outdoor coil, and the actual mode of a heat pump come before hoses go on.',
      'Confirm the indoor split. If the coil was frozen, thaw it first. Gauges on an iced coil will talk you into a charge the system does not need.',
      'If you do add or remove refrigerant, use the manufacturer chart for that model at the outdoor temperature you actually have. Weigh it. Write the amount on the ticket.',
      'A system that is flat has a leak. Find it or hand it to someone who can. Adding refrigerant to a flat system is a second visit waiting to happen.',
    ],
    safety:
      'Recovery equipment stays on the truck. Refrigerant goes back to a cylinder, not to the atmosphere.',
    stop: 'Any plan to "just add a pound and see" on a system you have not measured. Measure first. The pound can wait.',
  },
  {
    id: 'truck-before-you-leave',
    title: 'Before you leave the shop',
    tags: ['morning', 'truck', 'stock', 'safety', 'sop'],
    lead: 'The morning board is only useful if the parts are on the truck before the first driveway. Stage from the complaints, not from habit.',
    checks: [
      'Meter, manometer if you own one, and a capacitor assortment that matches the nameplates you keep seeing — then still read the nameplate on site.',
      'Common contactors, a condenser fan motor you can return, filters for the maintenance stops, and a float switch.',
      'Nitrogen, a coil cleaner, and a drain gun on maintenance and airflow days. Towels and a wet vac on anything that mentioned water.',
      'Paperwork: the addresses, gate codes, and the photo habit. A missing gate code costs more time than a missing coupling.',
    ],
    safety:
      'Cylinders upright and strapped. Gauges off the face of the sun. A capacitor loose in a tray will get crushed and leak.',
    stop: 'A truck with an empty recovery cylinder on a day you might open a system. Go back and swap it.',
  },
];

export function searchKnowledge(query) {
  const terms = String(query ?? '')
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  if (!terms.length) return KNOWLEDGE.map((item) => ({ item, score: 1 }));
  return KNOWLEDGE.map((item) => {
    const title = item.title.toLowerCase();
    const tags = item.tags.join(' ').toLowerCase();
    const body = `${item.lead} ${item.checks.join(' ')} ${item.safety} ${item.stop}`.toLowerCase();
    let score = 0;
    for (const term of terms) {
      if (title.includes(term)) score += 5;
      else if (tags.includes(term)) score += 3;
      else if (body.includes(term)) score += 1;
      else score -= 2;
    }
    return { item, score };
  })
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title));
}

export function getEntry(id) {
  return KNOWLEDGE.find((item) => item.id === id) ?? null;
}
