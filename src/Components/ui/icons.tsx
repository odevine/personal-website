import { ComponentType, SVGProps } from "react";
import {
  AppWindow,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Braces,
  Check,
  ChevronRight,
  Code,
  Copy,
  ExternalLink,
  Eye,
  FileText,
  Folder,
  FolderHeart,
  FolderOpen,
  House,
  Image,
  Info,
  Lock,
  LucideProps,
  Maximize2,
  Minus,
  Pin,
  PinOff,
  Plus,
  Scan,
  SlidersHorizontal,
  Star,
  SquareTerminal,
  Trophy,
  User,
  X,
  ZoomIn,
} from "lucide-react";

import { cx } from "./cx";

export type IconProps = LucideProps & { small?: boolean };
export type Icon = ComponentType<IconProps>;

// Icons size with the font, like text, so a parent can set font-size to resize them
const sized = (Lucide: ComponentType<LucideProps>): Icon => {
  const SizedIcon = ({ small, className, ...props }: IconProps) => (
    <Lucide
      size="1em"
      aria-hidden
      className={cx("icon", small && "icon-sm", className)}
      {...props}
    />
  );
  return SizedIcon;
};

export const AddIcon = sized(Plus);
export const ArrowBackIcon = sized(ArrowLeft);
export const ArrowForwardIcon = sized(ArrowRight);
export const ArrowUpIcon = sized(ArrowUp);
export const CheckIcon = sized(Check);
export const ChevronRightIcon = sized(ChevronRight);
export const CloseIcon = sized(X);
export const CodeIcon = sized(Code);
export const CopyIcon = sized(Copy);
export const DataObjectIcon = sized(Braces);
export const DescriptionIcon = sized(FileText);
export const FitScreenIcon = sized(Scan);
export const FolderIcon = sized(Folder);
export const FolderOpenIcon = sized(FolderOpen);
export const FolderSpecialIcon = sized(FolderHeart);
export const HomeIcon = sized(House);
export const ImageIcon = sized(Image);
export const InfoIcon = sized(Info);
export const LockIcon = sized(Lock);
export const MaximizeIcon = sized(Maximize2);
export const MinimizeIcon = sized(Minus);
export const OpenInNewIcon = sized(ExternalLink);
export const PersonIcon = sized(User);
export const PinIcon = sized(Pin);
export const PinOffIcon = sized(PinOff);
export const SettingsIcon = sized(SlidersHorizontal);
export const StarIcon = sized(Star);
export const TerminalIcon = sized(SquareTerminal);
export const TrophyIcon = sized(Trophy);
export const VisibilityIcon = sized(Eye);
export const WindowIcon = sized(AppWindow);
export const ZoomInIcon = sized(ZoomIn);

// lucide has no brand marks, this is the GitHub mark from Simple Icons (CC0)
export const GitHubIcon = ({
  small,
  className,
  ...props
}: SVGProps<SVGSVGElement> & { small?: boolean }) => (
  <svg
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    fill="currentColor"
    aria-hidden
    className={cx("icon", small && "icon-sm", className)}
    {...props}
  >
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 1.995 0 1.365-.015 2.46-.015 2.79 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);
