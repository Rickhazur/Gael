# Implementation Plan - Nova City Dashboard

I have successfully replaced the previous dashboard view with a new **Nova City** interface, inspired by the "Arena" aesthetic and the "Nano Banano Pro" reference provided.

## Changes Implemented

### 1. New Component: `NovaCampus.tsx` (Refactored)
I completely rewrote the `components/Campus/NovaCampus.tsx` file to match the requested design.

*   **Style**: Adopted a "Deep Space / Arena" aesthetic with a dark blue/black gradient background, ambient glows, and floating star particles.
*   **Layout**: Positioned 5 interactive "buildings" (elements) in a map-like arrangement, mimicking the reference image.
*   **Elements**:
    1.  **Research Lab (Science)**: Top Left - Blue/Cyan Arch with Flask icon.
    2.  **Global Tower (English/Social)**: Top Right - Yellow Tower with Globe icon.
    3.  **Mission Control (Central)**: Center - Purple/Fuchsia Card with Rocket icon.
    4.  **Math Academy**: Bottom Left - Tilted Blue Square with Calculator icon.
    5.  **The Arena (Games)**: Bottom Right - Red/Orange Rounded Pill with Gamepad icon.
*   **Interactivity**:
    *   Hover effects: Scale up, glow intensification, and floating labels.
    *   Sound effects: Integrated `useNovaSound` for hover and click feedback.
    *   Navigation: Directly linked each element to its respective `ViewState` (Research Center, Buddy Learn, Task Control, Math Tutor, Arena).

### 2. HUD Overlay
Added a sleek, non-intrusive HUD at the top showing:
*   **Level**: Current user level.
*   **Coins**: Current coin balance (from GamificationContext).
*   **Profile**: User simplified ID and name.

## Usage
This new view is automatically accessible to students as the main **Dashboard** (via `ViewState.DASHBOARD` in `MainLayout.tsx`).

## Next Steps
*   Verify that the `useNovaSound` hook has the appropriate audio assets in `public/assets/sounds/`.
*   Ensure the `ViewState` enums align with the navigation targets (they appear correct based on existing code).
