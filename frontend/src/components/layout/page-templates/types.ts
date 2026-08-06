import type * as React from "react";
import type { AppBreadcrumbItem } from "@/components/layout/breadcrumbs/breadcrumb";
import type { StepItem } from "@/components/navigation/stepper";
import type { TabItem } from "@/components/navigation/tabs";

export type ViewMode = "table" | "cards";

export interface ListPageTemplateProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumbs?: AppBreadcrumbItem[];
  /** Search / filter / sort toolbar content. */
  filters?: React.ReactNode;
  /** Optional view-mode toggle (table vs cards). */
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
  showViewToggle?: boolean;
  children: React.ReactNode;
  pagination?: React.ReactNode;
  loading?: boolean;
  empty?: React.ReactNode;
  className?: string;
}

export interface DetailPageTemplateProps {
  title: string;
  description?: string;
  breadcrumbs?: AppBreadcrumbItem[];
  actions?: React.ReactNode;
  status?: React.ReactNode;
  metadata?: React.ReactNode;
  tabs?: TabItem[];
  activeTab?: string;
  onTabChange?: (value: string) => void;
  children: React.ReactNode;
  sidePanel?: React.ReactNode;
  loading?: boolean;
  className?: string;
}

export interface CrudPageTemplateProps {
  title: string;
  description?: string;
  breadcrumbs?: AppBreadcrumbItem[];
  children: React.ReactNode;
  /** Footer actions (Submit / Cancel). */
  actions?: React.ReactNode;
  loading?: boolean;
  error?: React.ReactNode;
  className?: string;
  /** Constrain form width. @default true */
  narrow?: boolean;
}

export interface SettingsNavItem {
  id: string;
  label: string;
  href?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface SettingsPageTemplateProps {
  title?: string;
  description?: string;
  navItems: SettingsNavItem[];
  activeId: string;
  onNavigate?: (id: string) => void;
  children: React.ReactNode;
  className?: string;
}

export interface DashboardPageTemplateProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumbs?: AppBreadcrumbItem[];
  filters?: React.ReactNode;
  children: React.ReactNode;
  loading?: boolean;
  className?: string;
}

export interface WizardPageTemplateProps {
  title: string;
  description?: string;
  steps: StepItem[];
  currentStep: number;
  onStepChange?: (index: number) => void;
  children: React.ReactNode;
  /** Back / Next / Finish actions. */
  actions?: React.ReactNode;
  className?: string;
}
