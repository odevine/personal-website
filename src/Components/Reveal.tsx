import { PropsWithChildren } from "react";
import { animated, useInView } from "react-spring";

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Fades and lifts its children into place the first time they scroll into view
export const Reveal = ({ children }: PropsWithChildren) => {
  const reduced = prefersReducedMotion();
  const [ref, springs] = useInView(
    () => ({
      from: { opacity: reduced ? 1 : 0, y: reduced ? 0 : 24 },
      to: { opacity: 1, y: 0 },
      config: { tension: 170, friction: 26 },
    }),
    { once: true, amount: 0.2 },
  );

  return (
    <animated.div
      ref={ref}
      style={{
        opacity: springs.opacity,
        transform: springs.y.to((y) => `translateY(${y}px)`),
      }}
    >
      {children}
    </animated.div>
  );
};
