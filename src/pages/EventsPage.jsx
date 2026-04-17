const mockEvents = [
  {
    id: 1,
    title: 'Resume Review Clinic',
    date: 'Mar 04',
    time: '10:30 AM',
    location: 'Placement Hall A',
    type: 'Workshop',
  },
  {
    id: 2,
    title: 'Aptitude Sprint Session',
    date: 'Mar 09',
    time: '2:00 PM',
    location: 'Lab 3',
    type: 'Training',
  },
  {
    id: 3,
    title: 'Mock HR Interviews',
    date: 'Mar 14',
    time: '11:00 AM',
    location: 'Career Center',
    type: 'Interview Prep',
  },
];

function EventsPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-semibold text-zinc-100">Events & Workshops</h2>
        <p className="text-zinc-400 mt-1">Upcoming sessions from the placement office.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {mockEvents.map((event) => (
          <article
            key={event.id}
            className="border border-[#2f2f36] bg-[#1d1d22] p-5 shadow-[0_8px_24px_rgba(0,0,0,0.25)]"
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <span className="border border-[#3b3320] bg-[#2b2419] px-2.5 py-1 text-xs text-amber-200">
                {event.type}
              </span>
              <span className="text-xs text-zinc-400">{event.time}</span>
            </div>

            <h3 className="text-lg font-semibold text-zinc-100 mb-2">{event.title}</h3>
            <p className="text-sm text-zinc-400 mb-4">{event.location}</p>

            <div className="flex items-center justify-between border-t border-[#2a2a31] pt-4">
              <span className="text-sm text-zinc-300">{event.date}</span>
              <button className="bg-[#f7b545] px-4 py-2 text-sm font-semibold text-[#1a1a1f] border-none cursor-pointer hover:bg-[#f9c46c]">
                Register
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default EventsPage;
