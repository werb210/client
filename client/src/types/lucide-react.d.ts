import * as React from 'react';

declare module 'lucide-react' {
  export interface LucideProps extends React.SVGProps<SVGSVGElement> {
    size?: number | string;
    color?: string;
    strokeWidth?: number | string;
    absoluteStrokeWidth?: boolean;
  }

  export type LucideIcon = React.ForwardRefExoticComponent<
    LucideProps & React.RefAttributes<SVGSVGElement>
  >;

  export const createLucideIcon: (
    name: string,
    iconNode: readonly [element: string, attrs: Record<string, string>][]
  ) => LucideIcon;

  const icons: Record<string, LucideIcon>;
  export default icons;
}
