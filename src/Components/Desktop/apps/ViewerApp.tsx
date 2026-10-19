import { KeyboardEvent, useEffect, useRef, useState } from "react";

import { IconButton } from "@/Components/ui/Button";
import { cx } from "@/Components/ui/cx";
import {
  ArrowBackIcon,
  ArrowForwardIcon,
  FitScreenIcon,
  ZoomInIcon,
} from "@/Components/ui/icons";
import { formatSize } from "@/format";
import { useScrollFade } from "@/hooks/useScrollFade";
import { useViewer } from "../ViewerContext";
import styles from "./ViewerApp.module.css";

export const ViewerApp = () => {
  const { images, index, select } = useViewer();
  const [fit, setFit] = useState(true);
  const [dimensions, setDimensions] = useState<string>("");
  const current = images[index];
  const activeThumb = useRef<HTMLButtonElement>(null);
  const stageRef = useScrollFade<HTMLDivElement>();
  const stripRef = useScrollFade<HTMLDivElement>();

  const step = (delta: number) =>
    select(Math.min(Math.max(index + delta, 0), images.length - 1));

  useEffect(() => {
    activeThumb.current?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [index, images]);

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowRight") step(1);
    else if (event.key === "ArrowLeft") step(-1);
    else return;
    event.preventDefault();
  };

  if (!current) {
    return (
      <div className={styles.empty}>
        <span className="t-caption t-secondary">no images to show</span>
      </div>
    );
  }

  return (
    <div tabIndex={0} onKeyDown={onKeyDown} className={styles.viewer}>
      <div className={styles.toolbar}>
        <IconButton
          aria-label="previous image"
          disabled={index === 0}
          onClick={() => step(-1)}
        >
          <ArrowBackIcon small />
        </IconButton>
        <IconButton
          aria-label="next image"
          disabled={index === images.length - 1}
          onClick={() => step(1)}
        >
          <ArrowForwardIcon small />
        </IconButton>
        <span className={`t-caption t-nowrap ${styles.name}`}>
          {current.name}
          <span className="t-secondary">
            {` · ${index + 1} of ${images.length}`}
            {dimensions && ` · ${dimensions}`}
            {current.bytes !== undefined && ` · ${formatSize(current.bytes)}`}
          </span>
        </span>
        <IconButton
          aria-label={fit ? "show actual size" : "fit to window"}
          onClick={() => setFit(!fit)}
        >
          {fit ? <ZoomInIcon small /> : <FitScreenIcon small />}
        </IconButton>
      </div>

      <div ref={stageRef} className={cx(styles.stage, "scroll-fade")}>
        <img
          key={current.src}
          src={current.src}
          alt={current.name}
          onLoad={(event) =>
            setDimensions(
              `${event.currentTarget.naturalWidth}×${event.currentTarget.naturalHeight}`,
            )
          }
          className={fit ? styles.fit : styles.actual}
        />
      </div>

      {images.length > 1 && (
        <div ref={stripRef} className={cx(styles.strip, "scroll-fade")}>
          {images.map((image, i) => (
            <button
              key={image.src}
              type="button"
              ref={i === index ? activeThumb : undefined}
              aria-label={`show ${image.name}`}
              aria-current={i === index}
              onClick={() => select(i)}
              className={cx(styles.thumb, i === index && styles.current)}
            >
              <img src={image.src} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
