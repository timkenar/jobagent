import React from 'react';
import { BriefcaseIcon } from './icons';

interface UserDetailsSectionProps {
  cvText: string;
  emailTemplate: string;
  setCvText: (text: string) => void;
  setEmailTemplate: (template: string) => void;
}

const UserDetailsSection: React.FC<UserDetailsSectionProps> = ({
  cvText,
  emailTemplate,
  setCvText,
  setEmailTemplate,
}) => {
  return (
    <section className="mb-8 p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-semibold text-slate-700 mb-4 flex items-center">
        <BriefcaseIcon className="w-7 h-7 mr-2 text-sky-600" />
        Your Details
      </h2>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="cvText" className="block text-sm font-medium text-slate-700 mb-1">
            Your CV/Resume Content
          </label>
          <textarea
            id="cvText"
            value={cvText}
            onChange={(e) => setCvText(e.target.value)}
            placeholder="Paste your full CV/resume text here..."
            rows={10}
            className="w-full p-3 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
            aria-label="Your CV/Resume Content"
          />
        </div>
        <div>
          <label htmlFor="emailTemplate" className="block text-sm font-medium text-slate-700 mb-1">
            Base Email Template
          </label>
          <textarea
            id="emailTemplate"
            value={emailTemplate}
            onChange={(e) => setEmailTemplate(e.target.value)}
            placeholder="Enter your base email template. Use placeholders like [Job Title], [Company Name], etc."
            rows={10}
            className="w-full p-3 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
            aria-label="Base Email Template"
          />
          <p className="mt-1 text-xs text-slate-500">
            Tip: Use placeholders like [Job Title], [Company Name], [Specific Skill], [Matching Experience] for AI to fill.
          </p>
        </div>
      </div>
    </section>
  );
};

export default UserDetailsSection;