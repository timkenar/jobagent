import React from 'react';
import { GeneratedEmail, JobPosting } from '../../types';
import { CheckIcon, ClipboardIcon, XMarkIcon } from '../shared/icons';

interface GeneratedEmailModalProps {
  generatedEmail: GeneratedEmail | null;
  selectedJobForEmail: JobPosting | null;
  emailCopied: boolean;
  handleCopyToClipboard: () => void;
  onClose: () => void;
}

const GeneratedEmailModal: React.FC<GeneratedEmailModalProps> = ({
  generatedEmail,
  selectedJobForEmail,
  emailCopied,
  handleCopyToClipboard,
  onClose,
}) => {
  if (!generatedEmail || !selectedJobForEmail) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 transition-opacity duration-300"
      role="dialog"
      aria-modal="true"
      aria-labelledby="email-modal-title"
    >
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 id="email-modal-title" className="text-2xl font-semibold text-sky-700">
            Generated Email for: <span className="font-bold">{selectedJobForEmail.title}</span>
          </h3>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700"
            aria-label="Close email modal"
          >
            <XMarkIcon className="w-7 h-7" />
          </button>
        </div>
        <div
          className="prose prose-sm max-w-none overflow-y-auto flex-grow p-4 border rounded-md bg-slate-50 mb-4 whitespace-pre-wrap"
          tabIndex={0}
        >
          {generatedEmail.emailContent}
        </div>
        <button
          onClick={handleCopyToClipboard}
          className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md flex items-center justify-center transition-colors"
        >
          {emailCopied ? <CheckIcon className="w-5 h-5 mr-2" /> : <ClipboardIcon className="w-5 h-5 mr-2" />}
          {emailCopied ? 'Copied!' : 'Copy Email to Clipboard'}
        </button>
        <p className="text-xs text-slate-500 mt-3 text-center">
          Review the generated email carefully. You can now paste it into your email client and send it.
        </p>
      </div>
    </div>
  );
};

export default GeneratedEmailModal;