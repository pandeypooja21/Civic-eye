
import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, AlertTriangle, CheckCircle, Phone, MapIcon } from 'lucide-react';
import ReportForm from '@/components/ReportForm';
import UserProfile from '@/components/auth/UserProfile';
import { useAuth } from '@/context/AuthContext';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <MapPin className="text-civic-purple mr-2" size={24} />
              <h1 className="text-xl font-bold text-gray-900">CivicWatch</h1>
            </div>

            <nav className="hidden md:flex space-x-6">
              <Link to="/" className="text-gray-700 hover:text-civic-purple px-3 py-2 rounded-md text-sm font-medium">
                Report Issue
              </Link>
              <Link to="/feed" className="text-gray-700 hover:text-civic-purple px-3 py-2 rounded-md text-sm font-medium">
                Public Feed
              </Link>
              <Link to="/admin" className="text-gray-700 hover:text-civic-purple px-3 py-2 rounded-md text-sm font-medium">
                Admin Dashboard
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <Link to="/feed" className="hidden md:block text-gray-700 hover:text-civic-purple px-3 py-2 rounded-md text-sm font-medium">
                View Reports
              </Link>
              <UserProfile />
            </div>
          </div>
        </div>
      </header>

      <section className="bg-lavender-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 flex flex-col lg:flex-row lg:items-center">
          <div className="lg:w-1/2 lg:pr-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
              Report Public Issues in Real-Time
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl">
              CivicWatch connects citizens with city officials to address community problems
              quickly and efficiently. Help make your city a better place to live.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
              <div className="bg-white p-6 rounded-lg shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
                <div className="bg-lavender-100 p-3 rounded-full mb-4">
                  <MapPin className="text-civic-purple" size={24} />
                </div>
                <h3 className="font-medium">Locate Issues</h3>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
                <div className="bg-lavender-100 p-3 rounded-full mb-4">
                  <AlertTriangle className="text-civic-purple" size={24} />
                </div>
                <h3 className="font-medium">Report Problems</h3>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
                <div className="bg-lavender-100 p-3 rounded-full mb-4">
                  <CheckCircle className="text-civic-purple" size={24} />
                </div>
                <h3 className="font-medium">Track Progress</h3>
              </div>
            </div>
          </div>

          <div className="lg:w-1/2 mt-10 lg:mt-0">
            <img
              src="/lovable-uploads/freepik__expand__69164.png"
              alt="City neighborhood"
              className="rounded-lg shadow-lg w-full object-cover h-auto"
            />
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Report an Issue</h2>
          <p className="text-gray-600 mb-8">
            Fill out the form below to report a public issue in your area. Your report will be sent to city officials for review.
          </p>
          <ReportForm />
        </div>

        <div>
          <div className="bg-lavender-50 p-8 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h2>

            <ol className="space-y-6">
              <li className="flex items-start">
                <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-civic-purple text-white font-bold mr-4">1</span>
                <div>
                  <h3 className="font-medium text-gray-900">Fill out the issue report form with details and location</h3>
                  <p className="mt-1 text-gray-600">Provide as much information as possible to help officials understand the issue.</p>
                </div>
              </li>

              <li className="flex items-start">
                <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-civic-purple text-white font-bold mr-4">2</span>
                <div>
                  <h3 className="font-medium text-gray-900">Your report is sent to city officials in real-time</h3>
                  <p className="mt-1 text-gray-600">Officials receive immediate notification of your report.</p>
                </div>
              </li>

              <li className="flex items-start">
                <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-civic-purple text-white font-bold mr-4">3</span>
                <div>
                  <h3 className="font-medium text-gray-900">Officials review, prioritize, and address the issue</h3>
                  <p className="mt-1 text-gray-600">Based on urgency and available resources, officials will plan the resolution.</p>
                </div>
              </li>

              <li className="flex items-start">
                <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-civic-purple text-white font-bold mr-4">4</span>
                <div>
                  <h3 className="font-medium text-gray-900">Track progress on the public feed and get updates</h3>
                  <p className="mt-1 text-gray-600">You can follow the status of your report and see when it's resolved.</p>
                </div>
              </li>
            </ol>

            <div className="mt-10 p-4 border border-red-200 bg-red-50 rounded-lg flex items-center">
              <div className="bg-red-100 p-2 rounded-full mr-4">
                <Phone className="text-red-600" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-red-800">Emergency? Call 112</h3>
                <p className="text-red-700 text-sm">
                  For life-threatening emergencies, please call India's emergency services directly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gray-800 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <MapPin className="mr-2" size={20} />
                CivicWatch
              </h3>
              <p className="text-gray-300">
                Empowering citizens to improve their communities through real-time infrastructure reporting.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Service Areas</h3>
              <ul className="space-y-2">
                <li className="text-gray-300">Delhi NCR</li>
                <li className="text-gray-300">Mumbai</li>
                <li className="text-gray-300">Bengaluru</li>
                <li className="text-gray-300">Chennai</li>
                <li className="text-gray-300">Kolkata</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/feed" className="text-gray-300 hover:text-white transition-colors">
                    Public Feed
                  </Link>
                </li>
                <li>
                  <a href="#report-form" className="text-gray-300 hover:text-white transition-colors">
                    Report an Issue
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} CivicWatch India. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
