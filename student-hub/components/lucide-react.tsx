import * as React from "react"

export type LucideProps = React.SVGProps<SVGSVGElement> & {
  size?: number | string
  strokeWidth?: number | string
}

export type LucideIcon = React.ForwardRefExoticComponent<
  Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
>

type IconNode = Array<
  | ["circle", React.SVGProps<SVGCircleElement>]
  | ["line", React.SVGProps<SVGLineElement>]
  | ["path", React.SVGProps<SVGPathElement>]
  | ["polyline", React.SVGProps<SVGPolylineElement>]
  | ["rect", React.SVGProps<SVGRectElement>]
>

function createLucideIcon(displayName: string, iconNode: IconNode): LucideIcon {
  const Icon = React.forwardRef<SVGSVGElement, LucideProps>(
    (
      {
        children,
        color = "currentColor",
        fill = "none",
        size = 24,
        strokeWidth = 2,
        ...props
      },
      ref
    ) => (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={fill}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        {iconNode.map(([tag, attrs], index) =>
          React.createElement(tag, { ...attrs, key: `${displayName}-${index}` })
        )}
        {children}
      </svg>
    )
  )

  Icon.displayName = displayName

  return Icon
}

export const Bell = createLucideIcon("Bell", [
  ["path", { d: "M10.268 21a2 2 0 0 0 3.464 0" }],
  [
    "path",
    {
      d: "M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .738-1.674C19.41 13.956 18 12.499 18 8a6 6 0 0 0-12 0c0 4.499-1.411 5.956-2.738 7.326",
    },
  ],
])

export const Calculator = createLucideIcon("Calculator", [
  ["rect", { width: 16, height: 20, x: 4, y: 2, rx: 2 }],
  ["line", { x1: 8, x2: 16, y1: 6, y2: 6 }],
  ["line", { x1: 16, x2: 16, y1: 14, y2: 18 }],
  ["path", { d: "M8 10h.01" }],
  ["path", { d: "M12 10h.01" }],
  ["path", { d: "M16 10h.01" }],
  ["path", { d: "M8 14h.01" }],
  ["path", { d: "M12 14h.01" }],
  ["path", { d: "M8 18h.01" }],
  ["path", { d: "M12 18h.01" }],
])

export const CalendarClock = createLucideIcon("CalendarClock", [
  ["path", { d: "M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6" }],
  ["path", { d: "M16 2v4" }],
  ["path", { d: "M8 2v4" }],
  ["path", { d: "M3 10h18" }],
  ["circle", { cx: 17, cy: 17, r: 5 }],
  ["path", { d: "M17 14v3l2 1" }],
])

export const CalendarDays = createLucideIcon("CalendarDays", [
  ["path", { d: "M8 2v4" }],
  ["path", { d: "M16 2v4" }],
  ["rect", { width: 18, height: 18, x: 3, y: 4, rx: 2 }],
  ["path", { d: "M3 10h18" }],
  ["path", { d: "M8 14h.01" }],
  ["path", { d: "M12 14h.01" }],
  ["path", { d: "M16 14h.01" }],
  ["path", { d: "M8 18h.01" }],
  ["path", { d: "M12 18h.01" }],
])

export const ChartColumnBig = createLucideIcon("ChartColumnBig", [
  ["path", { d: "M3 3v18h18" }],
  ["rect", { width: 4, height: 7, x: 7, y: 10, rx: 1 }],
  ["rect", { width: 4, height: 12, x: 15, y: 5, rx: 1 }],
])

export const ClipboardList = createLucideIcon("ClipboardList", [
  ["rect", { width: 8, height: 4, x: 8, y: 2, rx: 1 }],
  ["path", { d: "M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" }],
  ["path", { d: "M12 11h4" }],
  ["path", { d: "M12 16h4" }],
  ["path", { d: "M8 11h.01" }],
  ["path", { d: "M8 16h.01" }],
])

export const FolderOpen = createLucideIcon("FolderOpen", [
  ["path", { d: "M6 14l1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.8 2.9l-2.22 4.44A3 3 0 0 1 16.9 19H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4.17a2 2 0 0 1 1.42.59L12 5h5a2 2 0 0 1 2 2v3" }],
])

export const GraduationCap = createLucideIcon("GraduationCap", [
  ["path", { d: "M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.084a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" }],
  ["path", { d: "M22 10v6" }],
  ["path", { d: "M6 12.5V16a6 3 0 0 0 12 0v-3.5" }],
])

export const LayoutDashboard = createLucideIcon("LayoutDashboard", [
  ["rect", { width: 7, height: 9, x: 3, y: 3, rx: 1 }],
  ["rect", { width: 7, height: 5, x: 14, y: 3, rx: 1 }],
  ["rect", { width: 7, height: 9, x: 14, y: 12, rx: 1 }],
  ["rect", { width: 7, height: 5, x: 3, y: 16, rx: 1 }],
])

export const NotebookPen = createLucideIcon("NotebookPen", [
  ["path", { d: "M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4" }],
  ["path", { d: "M2 6h4" }],
  ["path", { d: "M2 10h4" }],
  ["path", { d: "M2 14h4" }],
  ["path", { d: "M2 18h4" }],
  ["path", { d: "M21.378 5.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z" }],
])

export const Pause = createLucideIcon("Pause", [
  ["rect", { width: 4, height: 16, x: 6, y: 4, rx: 1 }],
  ["rect", { width: 4, height: 16, x: 14, y: 4, rx: 1 }],
])

export const Play = createLucideIcon("Play", [
  ["path", { d: "M5 5a2 2 0 0 1 3.008-1.728l11.997 7a2 2 0 0 1 0 3.456l-11.997 7A2 2 0 0 1 5 19z" }],
])

export const Repeat2 = createLucideIcon("Repeat2", [
  ["path", { d: "m2 9 3-3 3 3" }],
  ["path", { d: "M5 6v8a4 4 0 0 0 4 4h1" }],
  ["path", { d: "m22 15-3 3-3-3" }],
  ["path", { d: "M19 18v-8a4 4 0 0 0-4-4h-1" }],
])

export const RotateCcw = createLucideIcon("RotateCcw", [
  ["path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" }],
  ["path", { d: "M3 3v5h5" }],
])

export const Search = createLucideIcon("Search", [
  ["circle", { cx: 11, cy: 11, r: 8 }],
  ["path", { d: "m21 21-4.3-4.3" }],
])

export const Settings = createLucideIcon("Settings", [
  ["path", { d: "M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.32-1.915" }],
  ["circle", { cx: 12, cy: 12, r: 3 }],
])

export const TimerReset = createLucideIcon("TimerReset", [
  ["path", { d: "M10 2h4" }],
  ["path", { d: "M12 14v-4" }],
  ["path", { d: "M4 13a8 8 0 1 0 8-8 8.9 8.9 0 0 0-5.3 1.8" }],
  ["path", { d: "M4 6v4h4" }],
])

export const User = createLucideIcon("User", [
  ["path", { d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" }],
  ["circle", { cx: 12, cy: 7, r: 4 }],
])

export const UserRound = createLucideIcon("UserRound", [
  ["circle", { cx: 12, cy: 8, r: 5 }],
  ["path", { d: "M20 21a8 8 0 0 0-16 0" }],
])
