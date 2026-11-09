import React from 'react';
import { User, Project } from '../types';
import { LandingView } from './LandingView';

interface DashboardViewProps {
  user: User | null;
  projects: Project[];
  setActiveTab: (tab: string, subMode?: 'url' | 'manual') => void;
  onOpenLogin: () => void;
  onOpenPricing?: () => void;
  onOpenHelp?: () => void;
  lang?: 'ar' | 'en';
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  projects,
  setActiveTab,
  onOpenLogin,
  onOpenPricing = () => {},
  onOpenHelp = () => {},
  lang = 'ar',
}) => {
  return (
    <LandingView
      user={user}
      projects={projects}
      setActiveTab={setActiveTab}
      onOpenLogin={onOpenLogin}
      onOpenPricing={onOpenPricing}
      onOpenHelp={onOpenHelp}
      lang={lang}
    />
  );
};
