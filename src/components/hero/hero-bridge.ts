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
