import React, { ReactNode, useCallback, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import ResponsiveLayout from '../../layout/ResponsiveLayout';
import NotificationBell from '../../dashboard/NotificationBell';
import { useJobSearch } from '../../../src/hooks/useJobSearch';
import { useAuth } from '../../../src/contexts/AuthContext';

interface SubscriptionLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  headerContent?: ReactNode;
  headerActions?: ReactNode;
  onBack?: () => void;
  backLabel?: string;
  showHeader?: boolean;
  contentClassName?: string;
}

const SubscriptionLayout: React.FC<SubscriptionLayoutProps> = ({
  title,
  subtitle,
  children,
  headerContent,
  headerActions,
  onBack,
  backLabel = 'Back to Profile',
  showHeader = true,
  contentClassName = '',
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    handleSignOut,
    isLoadingSearch: isSigningOut,
  } = useJobSearch();
  const { getDisplayName, getEmail, getInitials } = useAuth();
  const [activeSection, setActiveSection] = useState<string>('subscriptions');

  const handleBack = useCallback(() => {
    if (onBack) {
      onBack();
      return;
    }

    navigate('/', {
      state: {
        activeSection: location.state?.fromSection || 'profile',
      },
      replace: false,
    });
  }, [location.state, navigate, onBack]);

  const handleSectionChange = useCallback(
    (section: string) => {
      if (section === 'subscriptions') {
        setActiveSection('subscriptions');
        return;
      }

      navigate('/', {
        state: { activeSection: section },
        replace: false,
      });
    },
    [navigate]
  );

  return (
    <ResponsiveLayout
      activeSection={activeSection}
      setActiveSection={handleSectionChange}
      onSignOut={handleSignOut}
      isSigningOut={isSigningOut}
    >
      <div className="min-h-screen">
        {showHeader && (
          <div className="hidden md:block">
            <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-6 py-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="inline-flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {backLabel}
                  </button>
                  {headerContent ? (
                    headerContent
                  ) : (
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {title}
                      </h1>
                      {subtitle && (
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {subtitle}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  {headerActions}
                  <NotificationBell />
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {getDisplayName()}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {getEmail()}
                    </div>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 text-sm font-medium text-white">
                    {getInitials()}
                  </div>
                </div>
              </div>
            </header>
          </div>
        )}

        <div className={`px-4 md:px-6 ${contentClassName}`}>
          {children}
        </div>
      </div>
    </ResponsiveLayout>
  );
};

export default SubscriptionLayout;
