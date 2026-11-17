"use client";

import { useEffect } from "react";

export function HomeHeroMotion() {
  useEffect(() => {
    const hero = document.querySelector<HTMLElement>(".home-hero");
    const header = document.querySelector<HTMLElement>(".site-header");
    const wordmark = header?.querySelector<HTMLElement>(".wordmark");
    const content = hero?.querySelector<HTMLElement>(".home-hero__content");
    if (!hero || !header || !wordmark || !content) return;

    const image = hero.querySelector("img");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      hero.classList.add("is-ready");
      return;
    }

    let frame = 0;
    const update = () => {
      frame = 0;
      const heroBounds = hero.getBoundingClientRect();
      const parent = wordmark.offsetParent as HTMLElement | null;
      const parentBounds = parent?.getBoundingClientRect();
      if (!parentBounds) return;
      const logoCenterX = parentBounds.left + wordmark.offsetLeft + wordmark.offsetWidth / 2;
      const logoCenterY = parentBounds.top + wordmark.offsetTop + wordmark.offsetHeight / 2;
      const travel = Math.max(0, header.offsetHeight - heroBounds.top);
      const distance = Math.min(heroBounds.height * 0.32, 260);
      const progress = Math.min(1, travel / distance);
      const remaining = 1 - progress;
      const scale = Math.min(2.7, (window.innerWidth * 0.75) / wordmark.offsetWidth);
      const dx = (window.innerWidth / 2 - logoCenterX) * remaining;
      const dy = (header.offsetHeight + heroBounds.height / 2 - logoCenterY) * remaining;

      wordmark.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale(${1 + (scale - 1) * remaining})`;
      content.style.opacity = String(Math.min(1, Math.max(0, (progress - 0.48) / 0.5)));
      content.style.transform = `translate3d(0, ${Math.min(travel * 0.22, heroBounds.height * 0.18)}px, 0)`;
      hero.style.setProperty("--hero-parallax", `${Math.min(travel * 0.18, heroBounds.height * 0.18)}px`);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    const reveal = () => hero.classList.add("is-ready");
    if (!image || (image.complete && image.naturalWidth > 0)) reveal();
    else {
      image.addEventListener("load", reveal, { once: true });
      image.addEventListener("error", reveal, { once: true });
    }
    const revealTimeout = window.setTimeout(reveal, 5000);

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
      window.clearTimeout(revealTimeout);
      image?.removeEventListener("load", reveal);
      image?.removeEventListener("error", reveal);
      wordmark.style.removeProperty("transform");
      content.style.removeProperty("opacity");
      content.style.removeProperty("transform");
    };
  }, []);
  return null;
}
