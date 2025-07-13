import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import MobileHeader from './MobileHeader';
import BottomNavigation from './BottomNavigation';
import { useTheme } from '../../src/contexts/ThemeContext';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  activeSection: string;
  setActiveSection: (section: string) => void;
  onSignOut: () => void;
  isSigningOut?: boolean;
}

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  activeSection,
  setActiveSection,
  onSignOut,
  isSigningOut = false
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { toggleTheme, isDark } = useTheme();

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSidebarOpen(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && sidebarOpen) {
        const sidebar = document.getElementById('mobile-sidebar');
        if (sidebar && !sidebar.contains(event.target as Node)) {
          setSidebarOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, sidebarOpen]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Mobile Header */}
      {isMobile && (
        <MobileHeader
          activeSection={activeSection}
          onMenuClick={() => setSidebarOpen(true)}
          onThemeToggle={toggleTheme}
          darkMode={isDark}
        />
      )}

      {/* Sidebar */}
      <div id="mobile-sidebar">
        <Sidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          onSignOut={onSignOut}
          isSigningOut={isSigningOut}
          isMobile={isMobile}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
      </div>

      {/* Main Content */}
      <div className={`
        ${isMobile ? 'pt-0 pb-16' : collapsed ? 'pl-16' : 'pl-64'}
        min-h-screen transition-all duration-300
      `}>
        <main className={`
          ${isMobile ? 'p-0' : 'p-6'}
          bg-gray-50 dark:bg-gray-900 transition-colors duration-200
          min-h-screen
        `}>
          {children}
        </main>
      </div>

      {/* Bottom Navigation - Mobile Only */}
      {isMobile && (
        <BottomNavigation
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />
      )}
    </div>
  );
};

export default ResponsiveLayout;