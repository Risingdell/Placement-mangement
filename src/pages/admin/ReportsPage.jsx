function ReportsPage() {
  const reports = [
    { title: 'Placement Statistics', description: 'Overall placement statistics and trends', icon: '📊' },
    { title: 'Company-wise Report', description: 'Breakdown by companies and offers', icon: '🏢' },
    { title: 'Branch-wise Analysis', description: 'Placement data by department', icon: '📈' },
    { title: 'Student Performance', description: 'CGPA and placement correlation', icon: '🎓' },
    { title: 'Application Trends', description: 'Application and selection rates', icon: '📉' },
    { title: 'Salary Analysis', description: 'CTC distribution and averages', icon: '💰' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
        <p className="text-gray-600 mt-1">Generate and download placement reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reports.map((report, index) => (
          <div key={index} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all cursor-pointer group">
            <div className="text-4xl mb-4">{report.icon}</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
              {report.title}
            </h3>
            <p className="text-sm text-gray-600 mb-4">{report.description}</p>
            <button className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all">
              Generate Report
            </button>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Students', value: '245' },
            { label: 'Placed', value: '89 (36.3%)' },
            { label: 'Average CTC', value: '8.5 LPA' },
            { label: 'Highest CTC', value: '25 LPA' }
          ].map((stat, index) => (
            <div key={index} className="text-center p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ReportsPage;
