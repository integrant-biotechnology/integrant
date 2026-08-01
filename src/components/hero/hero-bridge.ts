/**
 * Shared state bridge between the motion system (which owns ScrollTrigger)
 * and the hero shader (which owns the render loop). Both bundles import the
 * same module instance, so no events or DOM coupling are needed.
 *
 * scroll: 0 at the top of the page → 1 when the pinned hero has fully
 * handed over to the story section. The shader uses it to dim the lamp
 * and sweep the beam as the viewer scrolls away.
 */
export const heroScroll = { value: 0 };

/**
 * morph: 0 = organic biological field → 1 = structured ANN lattice.
 * Scrubbed by the pinned-hero timeline (15%–85% of the pin), read per-frame
 * by the shader. The wave of organization staggers per-particle via aDelay.
 */
export const heroMorph = { value: 0 };
