
import React from 'react';
import ReportForm from '@/components/ReportForm';
import { Link } from 'react-router-dom';
import { useIssues } from '@/context/IssueContext';
import { MapPin, AlertTriangle, CheckCircle, ArrowLeftRight } from 'lucide-react';

const Index: React.FC = () => {
  const { issues } = useIssues();

  // Get total counts by status
  const statusCounts = {
    open: issues.filter(issue => issue.status === 'open').length,
    inProgress: issues.filter(issue => issue.status === 'in-progress').length,
    resolved: issues.filter(issue => issue.status === 'resolved').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-civic-purple text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <h1 className="text-3xl md:text-4xl font-bold">CivicWatch</h1>
          <p className="mt-2 text-xl opacity-90">Report and track public infrastructure issues in your community</p>
          
          <div className="mt-8 flex items-center space-x-4">
            <Link
              to="/admin"
              className="bg-white text-civic-purple px-5 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              View Admin Dashboard
            </Link>
            
            <a
              href="#report-form"
              className="text-white underline hover:text-gray-100"
            >
              Report an Issue
            </a>
          </div>
        </div>
      </header>
      
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
            <div className="bg-orange-100 p-3 rounded-full mr-4">
              <AlertTriangle className="text-status-open" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Open Issues</p>
              <p className="text-2xl font-bold">{statusCounts.open}</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
            <div className="bg-amber-100 p-3 rounded-full mr-4">
              <ArrowLeftRight className="text-status-inProgress" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">In Progress</p>
              <p className="text-2xl font-bold">{statusCounts.inProgress}</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
            <div className="bg-green-100 p-3 rounded-full mr-4">
              <CheckCircle className="text-status-resolved" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Resolved</p>
              <p className="text-2xl font-bold">{statusCounts.resolved}</p>
            </div>
          </div>
        </div>
      </section>
      
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12" id="report-form">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Report an Issue</h2>
        <ReportForm />
      </section>
      
      <footer className="bg-gray-800 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">CivicWatch</h3>
              <p className="text-gray-300">
                Empowering citizens to improve their communities through real-time infrastructure reporting.
              </p>
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
                  <Link to="/admin" className="text-gray-300 hover:text-white transition-colors">
                    Admin Dashboard
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
            &copy; {new Date().getFullYear()} CivicWatch. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
