'use client';

import { CheckCircle, Copy, Home, Plus } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

export default function SuccessSubmit() {
  const [copied, setCopied] = useState(false);
  const editLink = '/edit/sess_1768406696988';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(editLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white flex justify-center items-center px-4">
      <div className="max-w-md w-full">
        {/* Success Card */}
        <div className="border-2 border-success rounded-lg p-8 text-center">
          {/* Checkmark Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
          </div>

          {/* Success Message */}
          <h1 className="font-bold text-2xl text-main-text mb-3">Submission Successful!</h1>
          <p className="text-muted-text mb-8">Your meal preferences have been recorded.</p>

          {/* Edit Link Section */}
          <div className="text-left mb-8">
            <label className="block text-sm font-medium text-main-text mb-2">
              Your edit link:
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={editLink}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-main-text outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="p-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                title="Copy link"
              >
                <Copy className="w-4 h-4 text-muted-text" />
              </button>
            </div>
            <p className="text-xs text-muted-text mt-2">
              Save this link to edit your selections before the deadline.
            </p>
            {copied && (
              <p className="text-xs text-success mt-1">Link copied to clipboard!</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-9">
            <Link href="/select_names">
              <button className="w-full bg-primary cursor-pointer hover:bg-primary-hover text-white rounded-lg h-12 flex items-center justify-center font-medium transition-colors mb-2">
                <Plus className="w-4 h-4 mr-2" />
                Make Another Submission
              </button>
            </Link>

            <Link href="/">
              <button className="w-full border cursor-pointer border-gray-300 hover:border-gray-400 text-main-text rounded-lg h-12 flex items-center justify-center font-medium transition-colors">
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}