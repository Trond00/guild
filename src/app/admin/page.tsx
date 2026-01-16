export default function AdminDashboard() {
  const adminSections = [
    {
      title: "Roster Management",
      description: "Add, edit, and manage guild members",
      link: "/admin/roster",
      color: "bg-blue-500"
    },
    {
      title: "Raid Progression",
      description: "Update boss kills and raid progress",
      link: "/admin/progression",
      color: "bg-red-500"
    },
    {
      title: "Raid-Art Gallery",
      description: "Manage MS Paint artworks",
      link: "/admin/raid-art",
      color: "bg-purple-500"
    },
    {
      title: "News & Announcements",
      description: "Create and publish guild news",
      link: "/admin/news",
      color: "bg-green-500"
    },
    {
      title: "Recruitment",
      description: "Manage recruitment settings",
      link: "/admin/recruitment",
      color: "bg-orange-500"
    },
    {
      title: "Blog Posts",
      description: "Manage detailed blog content",
      link: "/admin/blog",
      color: "bg-indigo-500"
    },
    {
      title: "Images",
      description: "Upload and organize images",
      link: "/admin/images",
      color: "bg-pink-500"
    },
    {
      title: "Videos",
      description: "Manage video content",
      link: "/admin/videos",
      color: "bg-teal-500"
    },
    {
      title: "Applications",
      description: "Review recruitment applications",
      link: "/admin/applications",
      color: "bg-gray-500"
    }
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Guild Admin Dashboard</h1>
        <p className="text-gray-600">Manage your ExPurged World of Warcraft guild website</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminSections.map((section, index) => (
          <a
            key={index}
            href={section.link}
            className="block p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center mb-4">
              <div className={`w-4 h-4 rounded-full ${section.color} mr-3`}></div>
              <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
            </div>
            <p className="text-gray-600">{section.description}</p>
          </a>
        ))}
      </div>
    </div>
  )
}
