import { QrCode, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex justify-center items-center px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <QrCode className="w-16 h-16 text-black" />
          </div>
          <h1 className="font-bold text-3xl text-black mb-2">Canteen Meal Opt-In</h1>
          <p className="text-gray-600">Next-day meal planning system</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
          <div className="mb-6">
            <h2 className="font-bold text-xl text-black mb-2">Welcome</h2>
            <p className="text-gray-600 mb-6">Select your meal preference for tomorrow's canteen menu.</p>
            
            {/* Steps */}
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <span className="shrink-0 w-6 h-6 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">1</span>
                <p className="text-gray-700">Select your name from the list</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="shrink-0 w-6 h-6 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">2</span>
                <p className="text-gray-700">Choose your meal preference</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="shrink-0 w-6 h-6 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">3</span>
                <p className="text-gray-700">Submit before the deadline</p>
              </div>
            </div>
          </div>

          <Link href="/select_names">
            <button className="w-full cursor-pointer bg-black hover:bg-gray-900 text-white rounded-lg h-12 flex items-center justify-center font-medium transition-colors">
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
