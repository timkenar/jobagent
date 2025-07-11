import React from 'react';
import { Shield, Lock, Eye, Database, Globe, Mail, UserCheck, AlertCircle } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  const lastUpdated = new Date('2025-07-11').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Shield className="w-8 h-8 mr-3 text-blue-600" />
                Privacy Policy
              </h1>
              <p className="mt-2 text-gray-600">Last updated: {lastUpdated}</p>
            </div>
            <button
              onClick={() => window.history.back()}
              className="text-gray-500 hover:text-gray-700"
            >
              Back
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Introduction</h2>
            <p className="text-gray-600 leading-relaxed">
              AI Job Search Assistant ("we," "our," or "us") is committed to protecting your privacy. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
              when you use our job search automation service. Please read this privacy policy carefully. 
              If you do not agree with the terms of this privacy policy, please do not access the service.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <Database className="w-6 h-6 mr-2 text-blue-600" />
              Information We Collect
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Personal Information</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Name and contact information (email address, phone number)</li>
                  <li>Professional information (resume/CV, work history, skills)</li>
                  <li>Job preferences and search criteria</li>
                  <li>Account credentials and authentication data</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Automatically Collected Information</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>IP address and device information</li>
                  <li>Browser type and operating system</li>
                  <li>Usage data and analytics</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Third-Party Data</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Google account information (when using Google Sign-In)</li>
                  <li>LinkedIn profile data (when using LinkedIn Sign-In)</li>
                  <li>Gmail data (for email integration features)</li>
                  <li>Job application responses from employers</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <Eye className="w-6 h-6 mr-2 text-blue-600" />
              How We Use Your Information
            </h2>
            
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>To provide and maintain our job search automation service</li>
              <li>To submit job applications on your behalf</li>
              <li>To match your profile with relevant job opportunities</li>
              <li>To communicate with you about your account and applications</li>
              <li>To improve our service and develop new features</li>
              <li>To detect and prevent fraud or security issues</li>
              <li>To comply with legal obligations</li>
              <li>To process payments for subscription services</li>
            </ul>
          </section>

          {/* Data Sharing */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <Globe className="w-6 h-6 mr-2 text-blue-600" />
              Data Sharing and Disclosure
            </h2>
            
            <p className="text-gray-600 mb-4">
              We may share your information in the following situations:
            </p>
            
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li><strong>With Employers:</strong> Your resume and application data when applying for jobs</li>
              <li><strong>Service Providers:</strong> Third-party vendors who assist in operating our service</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In connection with any merger or acquisition</li>
              <li><strong>With Your Consent:</strong> When you explicitly agree to share your information</li>
            </ul>
            
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-sm">
                <strong>Note:</strong> We never sell your personal information to third parties for marketing purposes.
              </p>
            </div>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <Lock className="w-6 h-6 mr-2 text-blue-600" />
              Data Security
            </h2>
            
            <p className="text-gray-600 mb-4">
              We implement appropriate technical and organizational security measures to protect your personal information:
            </p>
            
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security audits and assessments</li>
              <li>Access controls and authentication requirements</li>
              <li>Employee training on data protection</li>
              <li>Incident response procedures</li>
            </ul>
          </section>

          {/* User Rights */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <UserCheck className="w-6 h-6 mr-2 text-blue-600" />
              Your Rights and Choices
            </h2>
            
            <p className="text-gray-600 mb-4">
              You have the following rights regarding your personal information:
            </p>
            
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your account and data</li>
              <li><strong>Portability:</strong> Export your data in a machine-readable format</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
              <li><strong>Restriction:</strong> Limit how we process your information</li>
            </ul>
            
            <p className="text-gray-600 mt-4">
              To exercise these rights, please contact us at privacy@aijobsearch.com
            </p>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Cookies and Tracking</h2>
            
            <p className="text-gray-600 mb-4">
              We use cookies and similar tracking technologies to:
            </p>
            
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Remember your preferences and settings</li>
              <li>Authenticate your account</li>
              <li>Analyze usage patterns and improve our service</li>
              <li>Prevent fraud and enhance security</li>
            </ul>
            
            <p className="text-gray-600 mt-4">
              You can control cookies through your browser settings, but disabling cookies may limit certain features.
            </p>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Children's Privacy</h2>
            <p className="text-gray-600">
              Our service is not intended for users under 18 years of age. We do not knowingly collect 
              personal information from children. If you believe we have collected information from a child, 
              please contact us immediately.
            </p>
          </section>

          {/* International Data Transfers */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">International Data Transfers</h2>
            <p className="text-gray-600">
              Your information may be transferred to and processed in countries other than your own. 
              We ensure appropriate safeguards are in place to protect your data in accordance with 
              applicable data protection laws.
            </p>
          </section>

          {/* Changes to Privacy Policy */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes to This Privacy Policy</h2>
            <p className="text-gray-600">
              We may update this privacy policy from time to time. We will notify you of any changes 
              by posting the new privacy policy on this page and updating the "Last updated" date. 
              We encourage you to review this privacy policy periodically.
            </p>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <Mail className="w-6 h-6 mr-2 text-blue-600" />
              Contact Us
            </h2>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-600 mb-4">
                If you have questions or concerns about this privacy policy or our data practices, please contact us:
              </p>
              
              <div className="space-y-2 text-gray-700">
                <p><strong>Email:</strong> privacy@ngazi.co.ke</p>
                <p><strong>Support:</strong> support@ngazi.co.ke</p>
                <p><strong>Website:</strong> https://aijobagent.ngazi.co.ke</p>
                <p><strong>Address:</strong> AI Job Search Assistant<br />
                  Westlands<br />
                  Parklands, 01000<br />
                  Kenya
                </p>
              </div>
            </div>
          </section>

          {/* GDPR/CCPA Notice */}
          <section className="border-t pt-8">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-start">
                <AlertCircle className="w-6 h-6 text-yellow-600 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Additional Rights for EU and California Residents
                  </h3>
                  <p className="text-gray-600 text-sm">
                    If you are a resident of the European Union or California, you may have additional 
                    rights under GDPR or CCPA. Please contact us for more information about exercising 
                    these rights.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;