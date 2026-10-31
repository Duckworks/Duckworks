---
description: Use when the tech shares a walkthrough video, a sketch, room sizes, or asks for a floor plan or duct layout.
---

# Walkthrough to duct sketch

1. From the video, photo, or notes, list each room's name, width, and length in feet. Note doors, the air handler, existing returns, and obstacles.
2. Put the rooms on one plan. x increases east and y increases north. If the tech did not give positions, set the first room at x 0 y 0 and tile the others so they share walls. Say that you assumed the arrangement.
3. If a dimension is missing and it would change a duct size, ask for that dimension before you draw. Do not invent feet.
4. Call `duct_layout`. Use `style: "home-run"` for flex home runs. Use `style: "trunk"` when they want a trunk and branches. Pass `tons` only when they gave tonnage.
5. Show the SVG, the CFM basis, each run's size and length, and every warning. Repeat the disclaimer from the tool. This is a field sketch, not a permit drawing.
6. If you cannot see an attached video or photo, say so and ask for room sizes or a sketch with dimensions.
