import React from 'react';
import { GmailEmailsList } from '../../components/email'; // Adjust path to match your project structure
import { useGmail } from '../../src/contexts/GmailContext'; // Adjust path as needed

const Emails: React.FC = () => {
  const { isGmailConnected, gmailAccount } = useGmail();

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Emails</h1>
      {isGmailConnected && gmailAccount?.id ? (
        <div className="mt-6">
          <GmailEmailsList emailAccountId={gmailAccount.id} />
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <p className="text-gray-600 dark:text-gray-400">Please connect your Gmail account to view emails.</p>
          <button
            onClick={() => window.location.href = '/email-integration'} // Redirect to EmailIntegrationSection
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Connect Gmail
          </button>
        </div>
      )}
    </div>
  );
};

export default Emails;