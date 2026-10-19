import { useCallback } from "react";

// The fade grows with the hidden distance, reaching its full height once this much is out of view
const FADE_MAX = 48;
const FADE_RANGE = 240;

const fadeFor = (hidden: number) =>
  hidden < 1 ? 0 : FADE_MAX * Math.min(1, hidden / FADE_RANGE);

// Pinned parts of the content, like a sticky header, marked with data-fade-inset, are kept clear of the fade
const insetFor = (el: HTMLElement, side: "top" | "left") => {
  const pinned = el.querySelector<HTMLElement>(`[data-fade-inset="${side}"]`);
  if (!pinned) return 0;
  return side === "top" ? pinned.offsetHeight : pinned.offsetWidth;
};

/**
 * Fades the edges of a scrolling element where more content is out of view,
 * deeper the more there is. Returns a ref for a scrolling element that has the scroll-fade class.
 */
export const useScrollFade = <T extends HTMLElement>() =>
  useCallback((el: T | null) => {
    if (!el) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const below = el.scrollHeight - el.clientHeight - el.scrollTop;
      const right = el.scrollWidth - el.clientWidth - el.scrollLeft;
      const { style } = el;
      style.setProperty("--fade-top", `${fadeFor(el.scrollTop)}px`);
      style.setProperty("--fade-bottom", `${fadeFor(below)}px`);
      style.setProperty("--fade-left", `${fadeFor(el.scrollLeft)}px`);
      style.setProperty("--fade-right", `${fadeFor(right)}px`);
      style.setProperty("--fade-inset-top", `${insetFor(el, "top")}px`);
      style.setProperty("--fade-inset-left", `${insetFor(el, "left")}px`);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    // the content can grow or shrink without the element itself resizing
    const resize = new ResizeObserver(schedule);
    const watchChildren = () => {
      resize.disconnect();
      resize.observe(el);
      for (const child of el.children) resize.observe(child);
    };
    const mutations = new MutationObserver(() => {
      watchChildren();
      schedule();
    });

    watchChildren();
    mutations.observe(el, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    el.addEventListener("scroll", schedule, { passive: true });
    update();

    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      mutations.disconnect();
      el.removeEventListener("scroll", schedule);
    };
  }, []);
