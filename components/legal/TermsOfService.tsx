import React from 'react';
import { FileText, Scale, AlertTriangle, Clock, DollarSign, Shield, Users, Gavel } from 'lucide-react';

const TermsOfService: React.FC = () => {
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
                <Scale className="w-8 h-8 mr-3 text-blue-600" />
                Terms of Service
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
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Agreement to Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              These Terms of Service ("Terms") govern your use of AI Job Search Assistant ("Service") 
              operated by Ngazi Technologies ("we," "our," or "us"). By accessing or using our Service, 
              you agree to be bound by these Terms. If you disagree with any part of these terms, 
              you may not access the Service.
            </p>
          </section>

          {/* Acceptance */}
          <section className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start">
              <FileText className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Acceptance of Terms
                </h3>
                <p className="text-gray-600 text-sm">
                  By creating an account or using any part of our Service, you confirm that you are at least 
                  18 years old and have the legal capacity to enter into these Terms.
                </p>
              </div>
            </div>
          </section>

          {/* Service Description */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="w-6 h-6 mr-2 text-blue-600" />
              Service Description
            </h2>
            
            <p className="text-gray-600 mb-4">
              AI Job Search Assistant is an automated job search platform that provides:
            </p>
            
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Automated job application submissions</li>
              <li>Resume and CV optimization</li>
              <li>Job matching and recommendations</li>
              <li>Email integration and tracking</li>
              <li>Application analytics and insights</li>
              <li>AI-powered application assistance</li>
            </ul>
          </section>

          {/* User Accounts */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">User Accounts</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Account Creation</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>You must provide accurate and complete information when creating an account</li>
                  <li>You are responsible for maintaining the security of your account</li>
                  <li>You must notify us immediately of any unauthorized use</li>
                  <li>One account per person; multiple accounts are not permitted</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Account Responsibilities</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Keep your login credentials secure and confidential</li>
                  <li>Update your information to keep it accurate and current</li>
                  <li>Comply with all applicable laws and regulations</li>
                  <li>Report any technical issues or security concerns</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Subscription and Payments */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <DollarSign className="w-6 h-6 mr-2 text-blue-600" />
              Subscription and Payments
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Subscription Plans</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>We offer both free and paid subscription plans</li>
                  <li>Paid subscriptions unlock additional features and higher limits</li>
                  <li>Subscription fees are charged in advance for the selected billing period</li>
                  <li>All fees are non-refundable unless otherwise specified</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Payment Terms</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Payments are processed through secure third-party payment processors</li>
                  <li>Subscriptions automatically renew unless cancelled</li>
                  <li>Price changes will be communicated 30 days in advance</li>
                  <li>Failed payments may result in service suspension</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Cancellation</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>You can cancel your subscription at any time</li>
                  <li>Cancellation takes effect at the end of the current billing period</li>
                  <li>Access to paid features ends upon cancellation</li>
                  <li>Data retention policies apply after cancellation</li>
                </ul>
              </div>
            </div>
          </section>

          {/* User Conduct */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">User Conduct</h2>
            
            <p className="text-gray-600 mb-4">
              You agree not to use the Service to:
            </p>
            
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Violate any applicable laws or regulations</li>
              <li>Submit false or misleading information</li>
              <li>Interfere with or disrupt the Service</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Use the Service for spam or unsolicited communications</li>
              <li>Infringe on intellectual property rights</li>
              <li>Engage in any form of harassment or abuse</li>
              <li>Use automated scripts or bots (other than our authorized features)</li>
            </ul>
          </section>

          {/* Content and Data */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Content and Data</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Your Content</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>You retain ownership of your resumes, profiles, and personal data</li>
                  <li>You grant us permission to use your content to provide the Service</li>
                  <li>You represent that you have the right to submit your content</li>
                  <li>You are responsible for the accuracy of your content</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Our Content</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>All Service content, features, and functionality are owned by us</li>
                  <li>You may not copy, modify, or distribute our content</li>
                  <li>We grant you a limited license to use the Service</li>
                  <li>This license terminates when you stop using the Service</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Service Availability */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="w-6 h-6 mr-2 text-blue-600" />
              Service Availability
            </h2>
            
            <p className="text-gray-600 mb-4">
              We strive to maintain high service availability, but we cannot guarantee uninterrupted service:
            </p>
            
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>The Service may be temporarily unavailable due to maintenance</li>
              <li>We may modify or discontinue features with notice</li>
              <li>Third-party integrations may affect service availability</li>
              <li>We are not liable for service interruptions beyond our control</li>
            </ul>
          </section>

          {/* Privacy and Data Protection */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <Shield className="w-6 h-6 mr-2 text-blue-600" />
              Privacy and Data Protection
            </h2>
            
            <p className="text-gray-600 mb-4">
              Your privacy is important to us. Please review our Privacy Policy to understand how we collect, 
              use, and protect your information. By using the Service, you agree to our data practices 
              as described in our Privacy Policy.
            </p>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Privacy Policy:</strong> Available at{' '}
                <a href="/privacy" className="text-blue-600 hover:text-blue-700 underline">
                  Link
                </a>
              </p>
            </div>
          </section>

          {/* Disclaimers */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <AlertTriangle className="w-6 h-6 mr-2 text-yellow-600" />
              Disclaimers
            </h2>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>The Service is provided "as is" without warranties of any kind</li>
                <li>We do not guarantee job placement or interview opportunities</li>
                <li>Third-party job sites and employers have their own terms and policies</li>
                <li>We are not responsible for employer responses or hiring decisions</li>
                <li>Job market conditions and employer preferences may affect results</li>
              </ul>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Limitation of Liability</h2>
            
            <p className="text-gray-600 mb-4">
              To the fullest extent permitted by law, we shall not be liable for:
            </p>
            
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Any indirect, incidental, special, or consequential damages</li>
              <li>Loss of profits, data, or business opportunities</li>
              <li>Damages resulting from third-party actions or content</li>
              <li>Service interruptions or technical failures</li>
              <li>Any damages exceeding the amount you paid for the Service</li>
            </ul>
          </section>

          {/* Indemnification */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Indemnification</h2>
            
            <p className="text-gray-600">
              You agree to indemnify and hold us harmless from any claims, damages, or expenses 
              arising from your use of the Service, violation of these Terms, or infringement 
              of any third-party rights.
            </p>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Termination</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Termination by You</h3>
                <p className="text-gray-600">
                  You may terminate your account at any time by contacting us or using the account 
                  deletion feature in your settings.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Termination by Us</h3>
                <p className="text-gray-600">
                  We may terminate or suspend your account immediately if you violate these Terms, 
                  engage in fraudulent activity, or for any other reason at our sole discretion.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Effect of Termination</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Your access to the Service will be immediately revoked</li>
                  <li>Your data may be deleted according to our retention policies</li>
                  <li>Outstanding payments remain due</li>
                  <li>These Terms remain in effect for applicable provisions</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <Gavel className="w-6 h-6 mr-2 text-blue-600" />
              Governing Law
            </h2>
            
            <p className="text-gray-600">
              These Terms are governed by and construed in accordance with the laws of the State of California, 
              United States, without regard to its conflict of law provisions. Any disputes shall be resolved 
              in the courts of California.
            </p>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes to Terms</h2>
            
            <p className="text-gray-600 mb-4">
              We reserve the right to update these Terms at any time. We will notify you of any changes by:
            </p>
            
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Posting the new Terms on this page</li>
              <li>Updating the "Last updated" date</li>
              <li>Sending you an email notification for material changes</li>
              <li>Displaying a notice on our Service</li>
            </ul>
            
            <p className="text-gray-600 mt-4">
              Your continued use of the Service after any changes constitutes acceptance of the new Terms.
            </p>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Information</h2>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-600 mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              
              <div className="space-y-2 text-gray-700">
                <p><strong>Email:</strong> legal@ngazi.co.ke</p>
                <p><strong>Support:</strong> supportngazi.co.ke</p>
                <p><strong>Website:</strong> https://aijobagent.ngazi.co.ke</p>
                <p><strong>Address:</strong> AI Job Search Assistant<br />
                  Parklands, Westlands<br />
                  Nairobi <br />
                  Kenya
                </p>
              </div>
            </div>
          </section>

          {/* Severability */}
          <section className="border-t pt-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Severability</h2>
            
            <p className="text-gray-600">
              If any provision of these Terms is held to be invalid or unenforceable, the remaining 
              provisions will remain in full force and effect. The invalid provision will be replaced 
              with a valid provision that most closely matches the intent of the original provision.
            </p>
          </section>

          {/* Entire Agreement */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Entire Agreement</h2>
            
            <p className="text-gray-600">
              These Terms, together with our Privacy Policy, constitute the entire agreement between 
              you and us regarding the use of the Service and supersede all prior agreements and 
              understandings.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;