/**
 * Analytics — Plausible goal events.
 *
 * The Plausible script itself is only rendered by Base.astro when
 * PUBLIC_PLAUSIBLE_DOMAIN is set at build time (production). This module is
 * always bundled and is a strict no-op without it: `track` never throws,
 * never blocks navigation, and never runs before the UI has done its work.
 *
 * Markup contract (delegated, one listener for the whole document):
 *   <a data-event="Request Meeting" data-event-location="nav">
 * Every `data-event-*` attribute becomes a property on the event
 * (`data-event-location` → { location }). Programmatic events use `track()`.
 */

export type EventName =
  | 'Request Meeting'
  | 'Email Click'
  | 'Contact Submit'
  | 'View System'
  | 'HCP Gate Accept'
  | '404';

export type EventProps = Record<string, string>;

type Plausible = (name: string, options?: { props?: EventProps }) => void;

declare global {
  interface Window {
    plausible?: Plausible;
  }
}

const EVENT_NAMES: ReadonlySet<string> = new Set<EventName>([
  'Request Meeting',
  'Email Click',
  'Contact Submit',
  'View System',
  'HCP Gate Accept',
  '404',
]);

export function track(name: EventName, props?: EventProps): void {
  try {
    const plausible = window.plausible;
    if (typeof plausible !== 'function') return;
    plausible(name, props && Object.keys(props).length ? { props } : undefined);
  } catch {
    /* analytics must never surface as a page error */
  }
}

/** Collect data-event-* attributes into a props object. */
function propsFrom(el: HTMLElement): EventProps {
  const props: EventProps = {};
  for (const [key, value] of Object.entries(el.dataset)) {
    if (key === 'event' || !key.startsWith('event') || value === undefined) continue;
    const prop = key.slice('event'.length);
    props[prop.charAt(0).toLowerCase() + prop.slice(1)] = value;
  }
  return props;
}

export function initAnalytics(): void {
  try {
    document.addEventListener(
      'click',
      (event) => {
        const target = event.target;
        if (!(target instanceof Element)) return;
        const el = target.closest<HTMLElement>('[data-event]');
        if (!el) return;
        const name = el.dataset.event ?? '';
        if (!EVENT_NAMES.has(name)) return;
        track(name as EventName, propsFrom(el));
      },
      { capture: true, passive: true },
    );

    if (document.querySelector('[data-route="404"]')) {
      track('404', { path: location.pathname });
    }
  } catch {
    /* see above */
  }
}
