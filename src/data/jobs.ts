import type { Job } from "../types";

export const DEMO_JOBS: Job[] = [
  {
    id: "job-demo-1",
    source: "demo",
    receivedAt: "2026-10-31T07:12:00.000Z",
    windowStart: "2026-10-31T11:30:00.000Z",
    windowLabel: "7:30–8:30 AM",
    customer: "Maria Alvarez",
    phone: "727-555-0144",
    address: "814 West Bay Dr",
    city: "Largo",
    type: "no_cool",
    priority: "stat",
    equipment: "Goodman GSX16 / ARUF",
    refrigerant: "R-410A",
    notes: "House warm since last night. Outdoor fan spinning, air handler blowing lukewarm. Filter looks packed.",
    partsHints: ["dual run capacitor", "contactor", "1\" filter 16x25", "R-410A gauges"],
    sopIds: ["sop-no-cool", "sop-cap-test", "eq-goodman-gsx"],
    rawEmail: `Job #48211
Customer: Maria Alvarez
Phone: 727-555-0144
Address: 814 West Bay Dr
City: Largo
Time: 7:30-8:30 AM
Type: No cool
Equipment: Goodman GSX16 / ARUF
Refrigerant: R-410A
Notes: House warm since last night. Outdoor fan spinning, air handler blowing lukewarm. Filter looks packed.`,
  },
  {
    id: "job-demo-2",
    source: "demo",
    receivedAt: "2026-10-31T07:14:00.000Z",
    windowStart: "2026-10-31T14:00:00.000Z",
    windowLabel: "10:00–11:00 AM",
    customer: "Don Ellison",
    phone: "727-555-0190",
    address: "2219 Nursery Rd",
    city: "Clearwater",
    type: "maintenance",
    priority: "today",
    equipment: "Trane XR15 / TEM4",
    refrigerant: "R-410A",
    notes: "Fall PM. Customer mentioned the hallway is louder this year. 1\" filter on a 3.5 ton.",
    partsHints: ["16x25x1 filter", "no-rinse coil cleaner", "static tips"],
    sopIds: ["sop-pm", "sop-static", "eq-trane-xr15"],
  },
  {
    id: "job-demo-3",
    source: "demo",
    receivedAt: "2026-10-31T07:18:00.000Z",
    windowStart: "2026-10-31T17:00:00.000Z",
    windowLabel: "1:00–2:00 PM",
    customer: "Priya Shah",
    phone: "727-555-0118",
    address: "1348 Park Blvd N",
    city: "Seminole",
    type: "no_heat",
    priority: "stat",
    equipment: "Carrier 25HCB6 heat pump",
    refrigerant: "R-410A",
    notes: "Heat pump running, house at 66°. Outdoor coil has ice. Aux strips not coming on.",
    partsHints: ["defrost board notes", "heat strips sequencers", "O/B jumper check"],
    sopIds: ["sop-heat-pump", "sop-no-cool"],
  },
  {
    id: "job-demo-4",
    source: "demo",
    receivedAt: "2026-10-31T07:20:00.000Z",
    windowStart: "2026-10-31T19:30:00.000Z",
    windowLabel: "3:30–5:00 PM",
    customer: "Ken Hodge",
    phone: "727-555-0162",
    address: "5401 80th Ave N",
    city: "Pinellas Park",
    type: "estimate",
    priority: "flex",
    equipment: "1998 3-ton piston, uninsulated flex",
    notes: "Add a supply to the back addition. Walk the attic and sketch a trunk takeoff. Customer wants a number today.",
    partsHints: ["tape measure", "static tips", "flex + start collar notes"],
    sopIds: ["sop-duct", "sop-static"],
  },
];

export const SAMPLE_DISPATCH = `Work order 49002
Customer: Angela Brooks
Phone: 727-555-0177
Address: 312 Harbor View Ln
City: Safety Harbor
Time: 4:00 PM
Type: Water on ceiling / leak
Equipment: Carrier 24ACC6
Refrigerant: R-410A
Notes: Secondary drain dripping in the hallway. Unit still running. Attic coil.`;

export const SAMPLE_WALKTHROUGH = `Walkthrough, Hodge addition, Pinellas Park.
Foyer 8x6. Living room 16x14. Kitchen 12x10. Hallway 10x4.
Bedroom 1 12x11. Bedroom 2 11x10. Primary bedroom 14x12.
Garage 20x20 with the air handler on the platform.
AHU in the garage. Condenser on the south pad.
Supply to living, kitchen, bedroom 1, bedroom 2, and primary.
Return in the hallway and the living room.
Flex crushed over the addition — new 8" takeoff off the existing trunk toward the back wall.`;
