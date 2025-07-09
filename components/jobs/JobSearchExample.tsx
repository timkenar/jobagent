// import React from 'react';
// import { JobSearchSection } from './';
// import { useJobSearch } from '../../src/hooks/useJobSearch';

// /**
//  * Example component showing how to use JobSearchSection with CV-based Google search
//  * This demonstrates the integration between your CV data and Google search functionality
//  */
// const JobSearchExample: React.FC = () => {
//   const {
//     jobSearchQuery,
//     setJobSearchQuery,
//     jobResults,
//     isLoadingSearch,
//     cvText,
//     handleSearchJobs,
//     handleSearchJobsWithCV, // New CV-based search function
//     handleGenerateEmail,
//     isLoadingEmail,
//     selectedJobForEmail,
//     generatedEmail,
//     handleCloseModal,
//     handleCopyToClipboard,
//     emailCopied,
//     handleSendEmail,
//     isEmailSending,
//     emailSentMessage,
//     hasUploadedCV, // CV status
//     cvInfo, // CV information
//   } = useJobSearch();

//   return (
//     <div className="min-h-screen bg-gray-50 p-4">
//       <div className="max-w-7xl mx-auto">
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-gray-900 mb-4">
//             Enhanced Job Search with CV Intelligence
//           </h1>
//           <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//             <h2 className="text-lg font-semibold text-blue-900 mb-2">
//               How it works:
//             </h2>
//             <ul className="text-blue-800 space-y-1 text-sm">
//               <li>• <strong>Regular Search:</strong> Traditional job search using your query</li>
//               <li>• <strong>AI Search:</strong> Uses Google search + your CV data to find personalized matches</li>
//               <li>• <strong>CV Analysis:</strong> Automatically extracts skills, experience, and preferences</li>
//               <li>• <strong>Smart Matching:</strong> AI calculates compatibility scores for each job</li>
//             </ul>
//           </div>
//         </div>

//         <JobSearchSection
//           jobSearchQuery={jobSearchQuery}
//           setJobSearchQuery={setJobSearchQuery}
//           jobResults={jobResults}
//           isLoadingSearch={isLoadingSearch}
//           cvText={cvText}
//           handleSearchJobs={handleSearchJobs}
//           handleSearchJobsWithCV={handleSearchJobsWithCV} // Pass the CV-based search function
//           handleGenerateEmail={handleGenerateEmail}
//           isLoadingEmail={isLoadingEmail}
//           selectedJobForEmail={selectedJobForEmail}
//           generatedEmail={generatedEmail}
//           handleCloseModal={handleCloseModal}
//           handleCopyToClipboard={handleCopyToClipboard}
//           emailCopied={emailCopied}
//           handleSendEmail={handleSendEmail}
//           isEmailSending={isEmailSending}
//           emailSentMessage={emailSentMessage}
//           hasUploadedCV={hasUploadedCV} // Pass CV status
//           cvInfo={cvInfo} // Pass CV information
//         />

//         {/* Results Summary */}
//         {jobResults.length > 0 && (
//           <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">
//               Search Results Summary
//             </h3>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <div className="bg-blue-50 p-4 rounded-lg">
//                 <div className="text-2xl font-bold text-blue-600">
//                   {jobResults.length}
//                 </div>
//                 <div className="text-sm text-blue-800">Total Jobs Found</div>
//               </div>
//               <div className="bg-green-50 p-4 rounded-lg">
//                 <div className="text-2xl font-bold text-green-600">
//                   {jobResults.filter(job => job.matchScore && job.matchScore >= 70).length}
//                 </div>
//                 <div className="text-sm text-green-800">High Match Jobs (70%+)</div>
//               </div>
//               <div className="bg-purple-50 p-4 rounded-lg">
//                 <div className="text-2xl font-bold text-purple-600">
//                   {jobResults.reduce((total, job) => total + (job.matchedSkills?.length || 0), 0)}
//                 </div>
//                 <div className="text-sm text-purple-800">Total Skill Matches</div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default JobSearchExample;