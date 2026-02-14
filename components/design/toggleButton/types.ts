export interface ToggleOption {
  id: number;
  label: string;
  unreadCount?: number;
}

export interface FlexibleToggleButtonProps {
  options: ToggleOption[];
  selectedValue: number;
  onChange: (value: number) => void;
  className?: string;
}

// برای سازگاری با کد قبلی
export enum ToggleOrder {
  FirstToggle = 0,
  SecondToggle = 1,
  ThirdToggle = 2,
  FourthToggle = 3,
}

export type ToggleButtonVariant = "2-options" | "3-options" | "4-options";

export interface LegacyToggleData {
  firstToggle?: string;
  secondToggle?: string;
  thirdToggle?: string;
  fourthToggle?: string;
}
