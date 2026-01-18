'use client';

import { Printer, Download, FileSpreadsheet, Calendar } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { sampleReportData } from '@/utils/sampleData';

export default function Reports() {
  const reportData = sampleReportData;

  return (
    <div className="min-h-screen bg-white">
      <Navbar title="Reports & Export" step="Admin Screen 5/5" backHref="/admin" />
      
      <main className="px-8 py-6">
        <div className="max-w-6xl mx-auto">
          {/* Subtitle */}
          {/* <p className="text-muted-text mb-8">Print-friendly reports and exports.</p> */}

          {/* Export Options Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-main-text mb-4">Export Options</h2>
            <div className="grid grid-cols-3 gap-4">
              <button className="bg-white border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors text-center">
                <Printer className="w-8 h-8 mx-auto mb-3 text-main-text" />
                <h3 className="font-semibold text-main-text mb-1">Print</h3>
                <p className="text-sm text-muted-text">Direct to printer</p>
              </button>
              <button className="bg-white border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors text-center">
                <div className="relative w-8 h-8 mx-auto mb-3">
                  <Download className="w-8 h-8 absolute text-primary" />
                </div>
                <h3 className="font-semibold text-main-text mb-1">PDF</h3>
                <p className="text-sm text-muted-text">Portable document</p>
              </button>
              <button className="bg-white border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors text-center">
                <FileSpreadsheet className="w-8 h-8 mx-auto mb-3 text-success" />
                <h3 className="font-semibold text-main-text mb-1">Excel</h3>
                <p className="text-sm text-muted-text">Spreadsheet format</p>
              </button>
            </div>
          </div>

          {/* Meal Submission Report */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            {/* Report Title */}
            <div className="mb-6">
              <div className="flex items-center mb-2">
                <h2 className="text-2xl font-bold text-main-text mr-2">Meal Submission Report</h2>
                <Calendar className="w-5 h-5 text-muted-text" />
              </div>
              <p className="text-sm text-muted-text">Generated: {reportData.generatedDate}</p>
            </div>

            {/* Summary Section */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-main-text mb-4">Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <span className="text-sm font-medium text-main-text block mb-1">Menu Item</span>
                  <span className="text-sm text-main-text">{reportData.menuItem}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-main-text block mb-1">Total Submissions</span>
                  <span className="text-2xl font-bold text-main-text">{reportData.totalSubmissions}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-main-text block mb-1">Date</span>
                  <span className="text-sm text-main-text">{reportData.date}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-main-text block mb-1">Deadline</span>
                  <span className="text-sm text-main-text">{reportData.deadline}</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="border-2 border-success rounded-lg px-4 py-2">
                  <span className="text-sm font-medium text-main-text">Opt-In (Yes):</span>
                  <span className="text-lg font-bold text-main-text ml-2">{reportData.optIn}</span>
                </div>
                <div className="border-2 border-primary rounded-lg px-4 py-2">
                  <span className="text-sm font-medium text-main-text">Opt-Out (No):</span>
                  <span className="text-lg font-bold text-main-text ml-2">{reportData.optOut}</span>
                </div>
              </div>
            </div>

            {/* Detailed Submissions Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-main-text mb-4">Detailed Submissions</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-text">#</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-text">Name</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-text">Department</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-text">Selection</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-text">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {reportData.submissions.map((submission) => (
                      <tr key={submission.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-main-text">#{submission.id}</td>
                        <td className="py-3 px-4 text-sm text-main-text">{submission.name}</td>
                        <td className="py-3 px-4 text-sm text-main-text">{submission.department}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              submission.selection === 'Yes'
                                ? 'bg-green-100 text-green-800 border border-success'
                                : 'bg-red-100 text-red-800 border border-primary'
                            }`}
                          >
                            {submission.selection}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-main-text">{submission.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Report Footer */}
            <div className="pt-6 border-t border-gray-200 space-y-1">
              <p className="text-xs text-muted-text">
                Page breaks indicated for multi-page reports (visible in print preview)
              </p>
              <p className="text-xs text-muted-text">Canteen Meal Opt-In Management System</p>
              <p className="text-xs text-muted-text">Report generated on {reportData.generatedTime}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
