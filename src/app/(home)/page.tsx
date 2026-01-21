import { QrCode, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex justify-center items-center px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center ">
            <img src="/joshob.png" alt="Logo" className="w-50 h-40" />
          </div>
          
          <h1 className="font-bold text-3xl text-main-text mb-2">Canteen Meal Opt-In</h1>
          <p className="text-muted-text">Next-day meal planning system</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
          <div className="mb-6">
            <h2 className="font-bold text-xl text-main-text mb-2">Welcome</h2>
            <p className="text-muted-text mb-6">Select your meal preference for tomorrow's canteen menu.</p>

            {/* Steps */}
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <span className="shrink-0 w-6 h-6 bg-red-100 text-primary rounded-full flex items-center justify-center text-sm font-medium">1</span>
                <p className="text-main-text">Select your name from the list</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="shrink-0 w-6 h-6 bg-red-100 text-primary rounded-full flex items-center justify-center text-sm font-medium">2</span>
                <p className="text-main-text">Choose your meal preference</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="shrink-0 w-6 h-6 bg-red-100 text-primary rounded-full flex items-center justify-center text-sm font-medium">3</span>
                <p className="text-main-text">Submit before the deadline</p>
              </div>
            </div>
          </div>

          <Link href="/tomorrows_menu">
            <button className="w-full cursor-pointer bg-primary hover:bg-primary-hover text-white rounded-lg h-12 flex items-center justify-center font-medium transition-colors">
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
