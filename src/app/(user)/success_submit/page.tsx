'use client';

import { CheckCircle } from 'lucide-react';

export default function SuccessSubmit() {
  return (
    <div className="min-h-screen bg-white flex justify-center items-center px-4">
      <div className="max-w-md w-full">
        <div className="border-2 border-success rounded-lg p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
          </div>

          <h1 className="font-bold text-2xl text-main-text mb-3">Submission Successful!</h1>
          <p className="text-muted-text">Thank you for your selection. Your meal preferences have been recorded.</p>
        </div>
      </div>
    </div>
  );
}
