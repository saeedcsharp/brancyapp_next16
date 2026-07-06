import React from "react";

interface SVGProps {
  size?: number;
  color?: string;
  className?: string;
}

const Icon = ({ size = 16, color = "currentColor", children, className }: SVGProps & { children: React.ReactNode }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={{ color }}
    aria-hidden="true">
    {children}
  </svg>
);

export const DragHandleIcon = (p: SVGProps) => (
  <Icon {...p}>
    <path d="M16 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0m-6 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0m6 12a1 1 0 1 1-2 0 1 1 0 0 1 2 0m0-6a1 1 0 1 1-2 0 1 1 0 0 1 2 0m-6 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0m0-6a1 1 0 1 1-2 0 1 1 0 0 1 2 0" />
  </Icon>
);

export const BlockMenuIcon = (p: SVGProps) => (
  <Icon {...p}>
    <circle cx="12" cy="5" r="1" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    <circle cx="12" cy="19" r="1" fill="currentColor" stroke="none" />
  </Icon>
);

export const BoldIcon = (p: SVGProps) => (
  <Icon {...p}>
    <path d="M5 6q-.1-2 .4-2.6Q6 3 8 3h4.6C15 3 17 5 17 7.5S15 12 12.6 12H5z" />
    <path d="M12.4 12h1.3c2.4 0 4.3 2 4.3 4.5S16 21 13.7 21H8q-2 .1-2.6-.4Q5 20 5 18v-6" />
  </Icon>
);

export const ItalicIcon = (p: SVGProps) => (
  <Icon {...p}>
    <path d="M12 4h7M8 20l8-16M5 20h7" />
  </Icon>
);

export const UnderlineIcon = (p: SVGProps) => (
  <Icon {...p}>
    <path d="M5.5 3v8.5a6.5 6.5 0 1 0 13 0V3 M3 21h18" />
  </Icon>
);

export const StrikeIcon = (p: SVGProps) => (
  <Icon {...p}>
    <path d="M4 12h16 M17.5 7.7C17.5 5 15 3 12 3S6.5 5 6.5 7.7q0 .7.2 1.3M6 16.3C6 19 8.7 21 12 21s6-1.3 6-4.7q0-3.5-3-4.3" />
  </Icon>
);

export const SuperscriptIcon = (p: SVGProps) => (
  <Icon {...p}>
    <path d="M4 19l8-8" />
    <path d="M12 19L4 11" />
    <path d="M20 12h-4c0-1.5.442-2 1.5-2.5S20 8.334 20 7.002c0-.472-.17-.93-.484-1.29a2.105 2.105 0 0 0-2.617-.436c-.42.239-.738.614-.899 1.06" />
  </Icon>
);

export const SubscriptIcon = (p: SVGProps) => (
  <Icon {...p}>
    <path d="M4 5l8 8" />
    <path d="M12 5L4 13" />
    <path d="M20 21h-4c0-1.5.442-2 1.5-2.5S20 17.334 20 16.002c0-.472-.17-.93-.484-1.29a2.105 2.105 0 0 0-2.617-.436c-.42.239-.738.614-.899 1.06" />
  </Icon>
);

export const CodeInlineIcon = (p: SVGProps) => (
  <Icon {...p}>
    <path d="M2.5 12c0-4.5 0-6.7 1.4-8.1S7.5 2.5 12 2.5s6.7 0 8.1 1.4 1.4 3.6 1.4 8.1 0 6.7-1.4 8.1-3.6 1.4-8.1 1.4-6.7 0-8.1-1.4-1.4-3.6-1.4-8.1 M9.5 9.5 8 10.8q-1 .8-1 1.2t1 1.2l1.5 1.3m5-5 1.5 1.3q1 .8 1 1.2t-1 1.2l-1.5 1.3" />
  </Icon>
);

export const ClearFormatIcon = (p: SVGProps) => (
  <Icon {...p}>
    <path d="m4 6.5.2-.6q.5-1.4 1-1.6.4-.4 1.8-.3h11.1q1.3.4 1.2 1.8l-.3.7M4.5 20h6m2-16-5 16m7.5-5 5 5m-5 0 5-5" />
  </Icon>
);

export const AlignLeftIcon = (p: SVGProps) => (
  <Icon {...p}>
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="15" y2="12" />
    <line x1="3" y1="18" x2="18" y2="18" />
  </Icon>
);

export const AlignCenterIcon = (p: SVGProps) => (
  <Icon {...p}>
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="6" y1="12" x2="18" y2="12" />
    <line x1="4" y1="18" x2="20" y2="18" />
  </Icon>
);

export const AlignRightIcon = (p: SVGProps) => (
  <Icon {...p}>
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="9" y1="12" x2="21" y2="12" />
    <line x1="6" y1="18" x2="21" y2="18" />
  </Icon>
);

export const AlignJustifyIcon = (p: SVGProps) => (
  <Icon {...p}>
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </Icon>
);

export const BulletListIcon = (p: SVGProps) => (
  <Icon {...p}>
    <path d="M9 5h12M9 12h12M9 19h12M4.5 5H4m1 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0m-.5 7H4m1 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0m-.5 7H4m1 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0" />
  </Icon>
);

export const OrderedListIcon = (p: SVGProps) => (
  <Icon {...p}>
    <path d="M11 6h10m-10 6h10m-10 6h10 M3 15h2q.8.2 1 1v1q-.2.8-1 1H4q-.8.2-1 1v1.9l.6.1H6M3 9h1.5m0 0H6M4.5 9V4q0-.7-.2-.9L3.5 3H3" />
  </Icon>
);

export const TaskListIcon = (p: SVGProps) => (
  <Icon {...p}>
    <path d="M15 4h6m-6 11h6m-6-6h6m-6 11h6" />
    <circle cx="6.5" cy="6.5" r="3.5" />
    <circle cx="6.5" cy="17.5" r="3.5" />
  </Icon>
);

export const QuoteIcon = (p: SVGProps) => (
  <Icon {...p}>
    <path d="M9 6h8m-8 6h10M9 18h8 M5 3v18" />
  </Icon>
);

export const HRIcon = (p: SVGProps) => (
  <Icon {...p}>
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" opacity="0.3" />
    <line x1="3" y1="18" x2="21" y2="18" opacity="0.3" />
  </Icon>
);

export const TableIcon = (p: SVGProps) => (
  <Icon {...p}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="3" y1="15" x2="21" y2="15" />
    <line x1="9" y1="9" x2="9" y2="21" />
    <line x1="15" y1="9" x2="15" y2="21" />
  </Icon>
);

export const CodeBlockIcon = (p: SVGProps) => (
  <Icon {...p}>
    <path d="M15 4 9 20m-3-4s-4-3-4-4 4-4 4-4m12 0s4 3 4 4-4 4-4 4" />
  </Icon>
);

export const LinkIcon = (p: SVGProps) => (
  <Icon {...p}>
    <path d="m10 13.2.5.7a3.6 3.6 0 0 0 5.2 0l3.2-3.4a4 4 0 0 0 0-5.4 3.6 3.6 0 0 0-5.2 0L13 6" />
    <path d="m11 18.1-.7.8a3.6 3.6 0 0 1-5.2 0 4 4 0 0 1 0-5.4L8.3 10a3.6 3.6 0 0 1 5.7.7" />
  </Icon>
);

export const brakLinkIcon = (p: SVGProps) => (
  <Icon {...p}>
    <path d="m10 13.2.5.7a3.6 3.6 0 0 0 5.2 0l3.2-3.4a4 4 0 0 0 0-5.4 3.6 3.6 0 0 0-5.2 0L13 6" />
    <path d="m11 18.1-.7.8a3.6 3.6 0 0 1-5.2 0 4 4 0 0 1 0-5.4L8.3 10a3.6 3.6 0 0 1 5.7.7" />
    <path d="M21 16h-2m-3 5v-2M3 8h2m3-5v2" />
  </Icon>
);

export const EmojiIcon = (p: SVGProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <line x1="9" y1="9" x2="9.01" y2="9" />
    <line x1="15" y1="9" x2="15.01" y2="9" />
  </Icon>
);

export const UndoIcon = (p: SVGProps) => (
  <Icon {...p}>
    <polyline points="9 14 4 9 9 4" />
    <path d="M20 20v-7a4 4 0 0 0-4-4H4" />
  </Icon>
);

export const RedoIcon = (p: SVGProps) => (
  <Icon {...p}>
    <polyline points="15 14 20 9 15 4" />
    <path d="M4 20v-7a4 4 0 0 1 4-4h12" />
  </Icon>
);

export const SettingsIcon = (p: SVGProps) => (
  <Icon {...p}>
    <path d="M2.5 12c0-4.5 0-6.7 1.4-8.1S7.5 2.5 12 2.5s6.7 0 8.1 1.4 1.4 3.6 1.4 8.1 0 6.7-1.4 8.1-3.6 1.4-8.1 1.4-6.7 0-8.1-1.4-1.4-3.6-1.4-8.1Z" />
    <path d="M8.5 10a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm7 7a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
    <path d="M10 8.5h7m-3 7H7" />
  </Icon>
);

export const CopyIcon = (p: SVGProps) => (
  <Icon {...p}>
    <path d="M9 15c0-2.8 0-4.2.9-5.1S12.2 9 15 9h1c2.8 0 4.2 0 5.1.9s.9 2.3.9 5.1v1c0 2.8 0 4.2-.9 5.1s-2.3.9-5.1.9h-1c-2.8 0-4.2 0-5.1-.9S9 18.8 9 16z" />
    <path d="M17 9c0-3 0-4.5-.9-5.5l-.6-.6c-1-.9-2.7-.9-6-.9s-5 0-6 .9l-.6.6c-.9 1-.9 2.7-.9 6s0 5 .9 6l.6.6c1 .8 2.5.9 5.5.9" />
  </Icon>
);

export const CutIcon = (p: SVGProps) => (
  <Icon {...p}>
    <path d="M2.5 12c0-4.5 0-6.7 1.4-8.1S7.5 2.5 12 2.5s6.7 0 8.1 1.4 1.4 3.6 1.4 8.1 0 6.7-1.4 8.1-3.6 1.4-8.1 1.4-6.7 0-8.1-1.4-1.4-3.6-1.4-8.1Z" />
    <path d="M13.4 9.6 10.6 12m0 0L7 15m3.6-3 2.9 2.4M10.6 12 7 9m9-.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0 7a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0" />
  </Icon>
);

export const PasteIcon = (p: SVGProps) => (
  <Icon {...p}>
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" />
  </Icon>
);

export const ImportIcon = (p: SVGProps) => (
  <Icon {...p}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </Icon>
);

export const TrashIcon = (p: SVGProps) => (
  <Icon {...p}>
    <path d="m19.5 5.5-.6 10c-.2 2.6-.3 3.9-.9 4.8l-1.2 1.1c-1 .6-2.2.6-4.8.6s-3.9 0-4.8-.6L6 20.3c-.7-1-.7-2.2-.9-4.8l-.6-10M3 5.5h18m-5 0-.6-1.4q-.6-1.4-1.1-1.7l-.3-.2q-.6-.2-2-.2-1.5 0-2 .2l-.3.2q-.5.4-1 1.8L8 5.5m1.5 11v-6m5 6v-6" />
  </Icon>
);

export const DuplicateIcon = (p: SVGProps) => (
  <Icon {...p}>
    <rect x="8" y="8" width="13" height="13" rx="2" />
    <path d="M4 14H3a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </Icon>
);

export const MoveUpIcon = (p: SVGProps) => (
  <Icon {...p}>
    <polyline points="18 15 12 9 6 15" />
  </Icon>
);

export const MoveDownIcon = (p: SVGProps) => (
  <Icon {...p}>
    <polyline points="6 9 12 15 18 9" />
  </Icon>
);

export const AIIcon = (p: SVGProps) => (
  <Icon {...p}>
    <path d="m10 7-.5 1.4q-.8 2.5-1.7 3.4t-3.4 1.7L3 14l1.4.5q2.5.8 3.4 1.7t1.7 3.4L10 21l.5-1.4q.8-2.5 1.7-3.4t3.4-1.7L17 14l-1.4-.5q-2.5-.8-3.4-1.7t-1.7-3.4zm8-4-.2.6-.7 1.5-1.5.7-.6.2.6.2 1.5.7.7 1.5.2.6.2-.6.7-1.5 1.5-.7.6-.2-.6-.2-1.5-.7-.7-1.5z" />
  </Icon>
);

export const SaveIcon = (p: SVGProps) => (
  <Icon {...p}>
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </Icon>
);

export const ChevronDownIcon = (p: SVGProps) => (
  <Icon {...p}>
    <polyline points="6 9 12 15 18 9" />
  </Icon>
);

export const CloseIcon = (p: SVGProps) => (
  <Icon {...p}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </Icon>
);

export const TextColorIcon = (p: SVGProps) => (
  <Icon {...p}>
    <path d="M3 21h18m-2-3-3.4-8.8C14.1 5 13.3 3 12 3s-2 2-3.6 6.2L5 18m3-7h8" />
  </Icon>
);

export const BgColorIcon = (p: SVGProps) => (
  <Icon {...p}>
    <path
      d="M1.7 23.7 1 23l3-3h1.4zm4 0L5 23l3-3h1.4zm8.3-5 .2.6-4.5 4.4L9 23l4.8-4.8zm-.3 5L13 23l3-3h1.4zm4 0L17 23l3-3h1.4zm6-2-2 2-.7-.7 2-2zM12 17.4l-2.4 2.4.4-1 .5-1.3zm-8.8-.2-1 2-.5.5L1 19l2.5-2.5zm20.5.5L22 19.5l-.4-1L23 17zm0-4-3 3-.5-.9L23 13zm-18-2-4 4L1 15l6-6zm18-2L19.4 14l-.5-1L23 9zm-12-8L9.4 4l-.2.2-7.5 7.5L1 11 11 1zm12 4-5.6 5.6-.5-1L23 5zm0-4-6.9 6.9-.4-1L23 1zm-16 0-6 6L1 7l6-6zm12 0L15.5 6l-.3-.7-.1-.3L19 1zm-4 0L13.4 4h-1v-.3L15 1zm-12 0-2 2L1 3l2-2z"
      strokeWidth="0.5"
      fill="currentColor"
      opacity="0.6"
    />
    <path
      d="m5 18 5.6-12h2.8L19 18h-3.2L12 8.3 8.2 18zm4.2-2.6.9-2.3h3.8l.9 2.3z"
      strokeWidth="1"
      fill="currentColor"
    />
  </Icon>
);

export const TextIcon = (p: SVGProps) => (
  <Icon {...p}>
    <path d="M15 21H9 M12 3v18m0-18 4.6.2q.9 0 1.1.2.9.4 1.2 1.3l.1 1.2M12 3l-4.6.2q-.8 0-1.2.2a2 2 0 0 0-1.1 1.3L5 5.9" />
  </Icon>
);

export const HeadingIcon = (p: SVGProps) => (
  <Icon {...p}>
    <path d="M6 4v16M18 4v16M6 12h12" />
  </Icon>
);

export const Heading1Icon = (p: SVGProps) => (
  <Icon {...p}>
    <path d="M5 6v12m8-12v12m-8-6h8 M17 11.2c.7-.5 1.3-1.3 1.7-1.2q.4.3.3 1.4V18" />
  </Icon>
);

export const Heading2Icon = (p: SVGProps) => (
  <Icon {...p}>
    <path d="M3.5 6v12m8-12v12m-8-6h8m9.5 6h-5v-1.4l.9-.6 3.2-2.6q.8-.8.9-2v-.2q0-.8-.7-1.5T18.5 9t-1.8.7q-.6.7-.7 1.6v.4" />
  </Icon>
);

export const Heading3Icon = (p: SVGProps) => (
  <Icon {...p}>
    <path d="M3.5 6v12m8-12v12m-8-6h8m5-2h1q2-.1 2.6.4.5.6.4 2.6v2q.1 2-.4 2.6-.6.5-2.6.4h-1m1-4H20" />
  </Icon>
);

export const Heading4Icon = (p: SVGProps) => (
  <Icon {...p}>
    <path d="M3.5 6v12m8-12v12m-8-6h8m9-2v8m-.5-4h-.5q-2 .1-2.6-.4-.5-.6-.4-2.6v-1" />
  </Icon>
);

export const Heading5Icon = (p: SVGProps) => (
  <Icon {...p}>
    <path d="M3.5 6v12m8-12v12m-8-6h8m9-2h-2.9a2 2 0 0 0-1 1.1l-.1.9v.9q.3.9 1.1 1l.9.1h.9q.9.3 1 1.1l.1.9v.9a2 2 0 0 1-1.1 1l-.9.1h-2" />
  </Icon>
);

export const Heading6Icon = (p: SVGProps) => (
  <Icon {...p}>
    <path d="M3.5 6v12m8-12v12m-8-6h8m5 4v-.4l.1-1 .5-.5 1-.1h1.3q.9.3 1 1.1l.1.9v.9a2 2 0 0 1-1.1 1l-.9.1h-.9a2 2 0 0 1-1-1.1zm0 0v-3q-.1-2 .4-2.6c.5-.6 1.2-.4 2.6-.4h1" />
  </Icon>
);

export const FontSizeIcon = (p: SVGProps) => (
  <Icon {...p}>
    <polyline points="4 7 4 4 20 4 20 7" />
    <line x1="9" y1="20" x2="15" y2="20" />
    <line x1="12" y1="4" x2="12" y2="20" />
  </Icon>
);

export const FontFamilyIcon = (p: SVGProps) => (
  <Icon {...p}>
    <path d="m14 19-2.9-8.2C9.8 6.9 9.1 5 8 5s-1.8 2-3.1 5.8L2 19m2.5-7h7M22 14v4.4m0-4.5v-2c-.3-1.1-1.6-1.9-2.8-2q-1.6-.4-3 1.5M22 14h-3l-1.3.2c-2.6.7-2.4 4.3.2 4.7l.9.1q1-.1 1.8-.8Q22 17.4 22 16z" />
  </Icon>
);

export const RTLIcon = (p: SVGProps) => (
  <Icon {...p}>
    <path
      strokeWidth="1"
      d="M2.3 19v-7h2.6q1.4 0 2 .6.8.7.8 1.8 0 .8-.3 1.3t-1 .8-1.5.3H2.7l.3-.4V19zM7 19l-1.8-2.5H6L7.8 19zm-4-2.5-.3-.4h2.2q1 0 1.5-.4t.6-1.3-.6-1.3-1.5-.5H2.7l.3-.3zm8.7 2.5v-6.4H9.3V12h5.6v.6h-2.4V19zm5.4 0v-7h.8v6.4h3.9v.6z"
      fill="#fff"
    />
    <path d="M10 2S5 3.8 5 5s5 3 5 3M6 5h12" />
  </Icon>
);

export const LTRIcon = (p: SVGProps) => (
  <Icon {...p}>
    <path d="M13 8s5-1.8 5-3-5-3-5-3m4 3H5" />
    <path
      strokeWidth="1"
      d="M1 19v-7h.8v6.4h4v.6zm7.7 0v-6.4H6.2V12H12v.6H9.5V19zm5.5 0v-7H17q1.5 0 2.2.6t.8 1.8q0 .8-.4 1.3-.3.5-1 .8l-1.6.3h-2.2l.3-.4V19zm5 0-1.9-2.5h.8L20 19zM15 16.5l-.3-.4h2.2q1 0 1.7-.4.5-.4.5-1.3t-.5-1.3-1.7-.5h-2.2l.3-.3z"
    />
  </Icon>
);

export const IndentIcon = (p: SVGProps) => (
  <Icon {...p}>
    <path d="M15 4.5h5m-5 5h3m-3 5h5m-5 5h3M11 3v18M4 8.5l1.5 1.2q2 1.4 2 2.3c0 .7-.7 1.2-2 2.3L4 15.5" />
  </Icon>
);

export const OutdentIcon = (p: SVGProps) => (
  <Icon {...p}>
    <path d="M4 4.5h5m-3 5h3m-5 5h5m-3 5h3M13 3v18m7-12.5-1.5 1.2q-2 1.4-2 2.3c0 .7.7 1.2 2 2.3l1.5 1.2" />
  </Icon>
);

export const ExportIcon = (p: SVGProps) => (
  <Icon {...p}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </Icon>
);

export const CharacterIcon = (p: SVGProps) => (
  <Icon {...p}>
    <path d="M15 21H9 M12 3v18m0-18 4.6.2q.8 0 1.2.2.9.4 1.1 1.3l.1 1.2M12 3l-5.8.4a2 2 0 0 0-1.1 1.3L5 5.9" />
  </Icon>
);
export const WordIcon = (p: SVGProps) => (
  <Icon {...p}>
    <path d="m14 19-2.9-8.3C9.8 7 9.1 5 8 5q-1.3 0-3.1 5.7L2 19m2.5-7h7M22 14v4.4m0-4.5v-2c-.3-1.1-1.6-1.9-2.8-2q-1.7-.3-3 1.5M22 14h-3l-1.3.2c-2.5.7-2.4 4.3.2 4.7l.9.1q1-.1 1.8-.8Q22 17.4 22 16z" />
  </Icon>
);
export const ParagraphIcon = (p: SVGProps) => (
  <Icon {...p}>
    <path d="M15 3v18m0-18h-5m5 0h6m-11 9H7.5a4.5 4.5 0 0 1 0-9H10m0 9V3m0 9v9" />
  </Icon>
);
export const BlockIcon = (p: SVGProps) => (
  <Icon {...p}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </Icon>
);
