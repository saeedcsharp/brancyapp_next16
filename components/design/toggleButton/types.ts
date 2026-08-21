import type { ReactNode } from "react";

export interface ToggleOption {
  id: number;
  label: string;
  unreadCount?: number;
}

export interface ToggleButtonProps {
  options?: ToggleOption[];
  selectedValue?: number;
  onChange?: (value: number) => void;
  className?: string;
  ariaLabel?: string;
  disabled?: boolean;
  data?: LegacyToggleData;
  values?: LegacyToggleData;
  dataIcon?: {
    firstIcon?: { active: string | ReactNode; diactive: string | ReactNode };
    secondIcon?: { active: string | ReactNode; diactive: string | ReactNode };
  };
  setChangeToggle?: (order: ToggleOrder) => void;
  toggleValue?: ToggleOrder;
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
