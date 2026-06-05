/// <reference types="vite/client" />

// The View Transitions API isn't in the bundled DOM lib types yet.
interface ViewTransition {
  readonly ready: Promise<void>;
  readonly finished: Promise<void>;
  readonly updateCallbackDone: Promise<void>;
  skipTransition(): void;
}

interface Document {
  startViewTransition?: (callback: () => void | Promise<void>) => ViewTransition;
}
