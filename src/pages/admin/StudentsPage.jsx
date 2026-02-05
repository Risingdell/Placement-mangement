import { useState } from 'react';

function StudentsPage() {
  const [students, setStudents] = useState([
    { id: 1, usn: '1MS21CS001', name: 'Rajesh Kumar', email: 'rajesh@example.com', cgpa: 8.45, branch: 'CSE', year: 4, status: 'Active', placed: false },
    { id: 2, usn: '1MS21CS002', name: 'Priya Sharma', email: 'priya@example.com', cgpa: 9.12, branch: 'CSE', year: 4, status: 'Active', placed: true },
    { id: 3, usn: '1MS21CS003', name: 'Amit Patel', email: 'amit@example.com', cgpa: 7.85, branch: 'ISE', year: 4, status: 'Active', placed: false },
    { id: 4, usn: '1MS21EC004', name: 'Sneha Reddy', email: 'sneha@example.com', cgpa: 8.92, branch: 'ECE', year: 3, status: 'Active', placed: false },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterPlaced, setFilterPlaced] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.usn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBranch = filterBranch === '' || student.branch === filterBranch;
    const matchesYear = filterYear === '' || student.year.toString() === filterYear;
    const matchesPlaced = filterPlaced === '' ||
      (filterPlaced === 'placed' && student.placed) ||
      (filterPlaced === 'unplaced' && !student.placed);

    return matchesSearch && matchesBranch && matchesYear && matchesPlaced;
  });

  const handleViewProfile = (student) => {
    setSelectedStudent(student);
    setShowProfileModal(true);
  };

  const handleSendMessage = (student) => {
    setSelectedStudent(student);
    setShowMessageModal(true);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="neo-title !text-3xl mb-1 uppercase tracking-tight">RECRUIT DIRECTORY</h2>
          <p className="neo-subtitle !text-[11px] font-bold opacity-60 uppercase">Student Talent Database</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="neo-card !bg-white !p-4 !gap-1 border-blue-500 shadow-[4px_4px_0px_#3b82f6]">
          <p className="neo-subtitle !text-[10px] font-bold opacity-60 uppercase">Total Recruits</p>
          <div className="flex items-center justify-between">
            <h3 className="neo-title !text-2xl !mb-0">{students.length}</h3>
            <span className="text-2xl">👨‍🎓</span>
          </div>
        </div>

        <div className="neo-card !bg-white !p-4 !gap-1 border-green-500 shadow-[4px_4px_0px_#22c55e]">
          <p className="neo-subtitle !text-[10px] font-bold opacity-60 uppercase">Placed Students</p>
          <div className="flex items-center justify-between">
            <h3 className="neo-title !text-2xl !mb-0">{students.filter(s => s.placed).length}</h3>
            <span className="text-2xl">💼</span>
          </div>
        </div>

        <div className="neo-card !bg-white !p-4 !gap-1 border-orange-500 shadow-[4px_4px_0px_#f97316]">
          <p className="neo-subtitle !text-[10px] font-bold opacity-60 uppercase">Unplaced Students</p>
          <div className="flex items-center justify-between">
            <h3 className="neo-title !text-2xl !mb-0">{students.filter(s => !s.placed).length}</h3>
            <span className="text-2xl">🔍</span>
          </div>
        </div>

        <div className="neo-card !bg-white !p-4 !gap-1 border-purple-500 shadow-[4px_4px_0px_#a855f7]">
          <p className="neo-subtitle !text-[10px] font-bold opacity-60 uppercase">Average CGPA</p>
          <div className="flex items-center justify-between">
            <h3 className="neo-title !text-2xl !mb-0">
              {(students.reduce((acc, s) => acc + s.cgpa, 0) / students.length).toFixed(2)}
            </h3>
            <span className="text-2xl">📊</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="neo-card !bg-white !p-6 mb-8 shadow-[6px_6px_0px_#d3d3d3]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="col-span-1 md:col-span-1">
            <label className="neo-subtitle !text-[10px] font-bold uppercase mb-2 block text-[#323232]">
              INTEL SCAN (NAME/USN)
            </label>
            <input
              type="text"
              placeholder="SEARCH RECRUITS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="neo-input uppercase !py-2"
            />
          </div>

          <div>
            <label className="neo-subtitle !text-[10px] font-bold uppercase mb-2 block text-[#323232]">
              DIVISION
            </label>
            <select
              value={filterBranch}
              onChange={(e) => setFilterBranch(e.target.value)}
              className="neo-input uppercase !py-2"
            >
              <option value="">ALL DIVISIONS</option>
              <option value="CSE">CSE</option>
              <option value="ISE">ISE</option>
              <option value="ECE">ECE</option>
            </select>
          </div>

          <div>
            <label className="neo-subtitle !text-[10px] font-bold uppercase mb-2 block text-[#323232]">
              OPERATIONAL YEAR
            </label>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="neo-input uppercase !py-2"
            >
              <option value="">ALL YEARS</option>
              <option value="3">3RD YEAR</option>
              <option value="4">4TH YEAR</option>
            </select>
          </div>

          <div>
            <label className="neo-subtitle !text-[10px] font-bold uppercase mb-2 block text-[#323232]">
              DEPLOYMENT STATUS
            </label>
            <select
              value={filterPlaced}
              onChange={(e) => setFilterPlaced(e.target.value)}
              className="neo-input uppercase !py-2"
            >
              <option value="">ALL STATUS</option>
              <option value="placed">PLACED</option>
              <option value="unplaced">UNPLACED</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="neo-card !bg-white !p-0 overflow-hidden mb-10 shadow-[8px_8px_0px_#d3d3d3]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#f8f8f8] border-b-2 border-[#323232]">
                <th className="px-6 py-4 text-left neo-subtitle !text-[11px] font-bold uppercase tracking-wider text-[#323232]">
                  Recruit Info
                </th>
                <th className="px-6 py-4 text-left neo-subtitle !text-[11px] font-bold uppercase tracking-wider text-[#323232]">
                  Division
                </th>
                <th className="px-6 py-4 text-left neo-subtitle !text-[11px] font-bold uppercase tracking-wider text-[#323232]">
                  Rank (CGPA)
                </th>
                <th className="px-6 py-4 text-left neo-subtitle !text-[11px] font-bold uppercase tracking-wider text-[#323232]">
                  Year
                </th>
                <th className="px-6 py-4 text-left neo-subtitle !text-[11px] font-bold uppercase tracking-wider text-[#323232]">
                  Deployment
                </th>
                <th className="px-6 py-4 text-right neo-subtitle !text-[11px] font-bold uppercase tracking-wider text-[#323232]">
                  Operations
                </th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[#323232] divide-dashed">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-indigo-500 border-2 border-[#323232] rounded flex items-center justify-center text-white font-bold mr-3 shadow-[2px_2px_0px_#323232]">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <div className="neo-subtitle !text-[13px] font-bold text-[#323232]">{student.name.toUpperCase()}</div>
                        <div className="neo-subtitle !text-[10px] font-bold opacity-50 uppercase">{student.usn}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className="px-3 py-1 border-2 border-[#323232] rounded text-[10px] font-bold bg-white shadow-[2px_2px_0px_#323232] text-[#323232]">
                      {student.branch.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className="neo-subtitle !text-[13px] font-extrabold text-indigo-700">
                      {student.cgpa.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap neo-subtitle !text-[12px] font-bold text-[#323232]">
                    YEAR {student.year}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className={`px-3 py-1 border-2 border-[#323232] rounded text-[10px] font-bold shadow-[2px_2px_0px_#323232] ${student.placed
                      ? 'bg-green-100 text-green-800'
                      : 'bg-orange-100 text-orange-800'
                      }`}>
                      {student.placed ? 'PLACED' : 'UNPLACED'}
                    </span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-right space-x-3">
                    <button
                      onClick={() => handleViewProfile(student)}
                      className="neo-button !py-1 !px-3 !bg-indigo-50 !text-indigo-800 !text-[11px] !min-h-0 !border-[#4f46e5]"
                    >
                      DOSSIER
                    </button>
                    <button
                      onClick={() => handleSendMessage(student)}
                      className="neo-button !py-1 !px-3 !bg-purple-50 !text-purple-800 !text-[11px] !min-h-0 !border-purple-600"
                    >
                      MSG
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Profile Modal (Dossier) */}
      {showProfileModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="neo-card !bg-white !max-w-md w-full !p-8 shadow-[12px_12px_0px_#000]">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="neo-title !text-2xl mb-1 uppercase tracking-tight">RECRUIT DOSSIER</h3>
                <p className="neo-subtitle !text-[11px] font-bold opacity-60 uppercase">Personnel File: {selectedStudent.usn}</p>
              </div>
              <button
                onClick={() => setShowProfileModal(false)}
                className="w-8 h-8 border-2 border-[#323232] flex items-center justify-center font-bold hover:bg-red-500 hover:text-white transition-colors"
              >
                X
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-20 h-20 bg-indigo-500 border-4 border-[#323232] flex items-center justify-center text-white text-3xl font-black shadow-[4px_4px_0px_#323232]">
                  {selectedStudent.name.charAt(0)}
                </div>
                <div>
                  <h4 className="neo-title !text-xl !mb-0">{selectedStudent.name.toUpperCase()}</h4>
                  <p className="neo-subtitle !text-[12px] font-bold text-indigo-600">{selectedStudent.email.toUpperCase()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="neo-card !p-3 !bg-gray-50 !gap-0 border-[#323232]">
                  <p className="neo-subtitle !text-[9px] font-bold opacity-50 uppercase mb-1">Division</p>
                  <p className="neo-subtitle !text-[13px] font-bold uppercase">{selectedStudent.branch}</p>
                </div>
                <div className="neo-card !p-3 !bg-gray-50 !gap-0 border-[#323232]">
                  <p className="neo-subtitle !text-[9px] font-bold opacity-50 uppercase mb-1">Rank (CGPA)</p>
                  <p className="neo-subtitle !text-[13px] font-bold uppercase">{selectedStudent.cgpa.toFixed(2)}</p>
                </div>
                <div className="neo-card !p-3 !bg-gray-50 !gap-0 border-[#323232]">
                  <p className="neo-subtitle !text-[9px] font-bold opacity-50 uppercase mb-1">Operational Year</p>
                  <p className="neo-subtitle !text-[13px] font-bold uppercase">{selectedStudent.year}</p>
                </div>
                <div className="neo-card !p-3 !bg-gray-50 !gap-0 border-[#323232]">
                  <p className="neo-subtitle !text-[9px] font-bold opacity-50 uppercase mb-1">Deployment</p>
                  <p className={`neo-subtitle !text-[13px] font-bold uppercase ${selectedStudent.placed ? 'text-green-600' : 'text-orange-600'}`}>
                    {selectedStudent.placed ? 'PLACED' : 'UNPLACED'}
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <button className="neo-button w-full !bg-[#323232] !text-white !text-[14px] uppercase tracking-wider">
                  VIEW FULL PROFILE DATA
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {showMessageModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="neo-card !bg-white !max-w-2xl w-full !p-8 shadow-[12px_12px_0px_#a855f7]">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="neo-title !text-2xl mb-1 uppercase tracking-tight">TRANSMIT COMMS</h3>
                <p className="neo-subtitle !text-[11px] font-bold opacity-60 uppercase">To Recruit: {selectedStudent.name.toUpperCase()}</p>
              </div>
              <button
                onClick={() => setShowMessageModal(false)}
                className="w-8 h-8 border-2 border-[#323232] flex items-center justify-center font-bold hover:bg-red-500 hover:text-white transition-colors"
              >
                X
              </button>
            </div>

            <form className="space-y-6">
              <div>
                <label className="neo-subtitle !text-[10px] font-bold uppercase mb-2 block text-[#323232]">
                  SUBJECT HEADING
                </label>
                <input
                  type="text"
                  className="neo-input uppercase"
                  placeholder="CLASSIFIED SUBJECT..."
                />
              </div>

              <div>
                <label className="neo-subtitle !text-[10px] font-bold uppercase mb-2 block text-[#323232]">
                  MESSAGE CORE
                </label>
                <textarea
                  rows={6}
                  className="neo-input uppercase resize-none"
                  placeholder="ENTER COMMS DATA..."
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowMessageModal(false)}
                  className="neo-button !py-2 !px-6 !bg-white !min-h-0 uppercase"
                >
                  ABORT
                </button>
                <button
                  type="submit"
                  className="neo-button !py-2 !px-8 !bg-purple-500 !text-white !min-h-0 uppercase tracking-widest"
                >
                  SEND TRANSMISSION
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentsPage;
