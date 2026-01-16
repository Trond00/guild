export default function Recruitment() {
  const roles = [
    {
      name: "Tank",
      description: "Protect your allies and hold aggro like a true warrior of the Horde!",
      status: "High Priority",
      requirements: ["Level 70", "Tank experience", "Good communication"]
    },
    {
      name: "Healer",
      description: "Keep the raid alive with your healing prowess. We're looking for dedicated healers.",
      status: "Open",
      requirements: ["Level 70", "Healing experience", "Mana management skills"]
    },
    {
      name: "DPS",
      description: "Deal massive damage and help us clear content faster. All DPS specs welcome!",
      status: "Open",
      requirements: ["Level 70", "DPS experience", "Understanding of mechanics"]
    },
    {
      name: "Support",
      description: "Utility players who enhance the raid with buffs, debuffs, and crowd control.",
      status: "Open",
      requirements: ["Level 70", "Support experience", "Team player"]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-900 via-orange-900 to-black text-white pt-16">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-4xl md:text-6xl font-bold text-center text-red-400 mb-12">
          Join ExPurged
        </h1>

        <div className="text-center mb-12">
          <p className="text-xl mb-8">
            We're always looking for skilled players to join our ranks and conquer Azeroth together!
          </p>
          <p className="text-lg mb-8">
            If you're dedicated, have a positive attitude, and want to be part of a winning team, we'd love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {roles.map((role, index) => (
            <div key={index} className="bg-black bg-opacity-50 p-8 rounded-lg border border-red-500">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-red-300">{role.name}</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  role.status === 'High Priority' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
                }`}>
                  {role.status}
                </span>
              </div>
              <p className="text-gray-300 mb-6">{role.description}</p>
              <div>
                <h3 className="font-bold mb-2">Requirements:</h3>
                <ul className="list-disc list-inside space-y-1">
                  {role.requirements.map((req, reqIndex) => (
                    <li key={reqIndex} className="text-sm text-gray-400">{req}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold mb-8 text-red-400">How to Apply</h2>
          <div className="bg-black bg-opacity-50 p-8 rounded-lg max-w-2xl mx-auto">
            <p className="text-lg mb-6">
              To apply for membership in ExPurged, please contact our recruitment officer in-game or join our Discord.
            </p>
            <div className="space-y-4">
              <p><strong>In-Game:</strong> Whisper <span className="text-red-300">RecruitmentOfficer</span> on Ragnaros</p>
              <p><strong>Discord:</strong> Join our server and post in #recruitment</p>
              <p><strong>Battle.net:</strong> Send a friend request to <span className="text-red-300">GuildMaster#1234</span></p>
            </div>
            <button className="mt-8 px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition duration-300">
              Apply Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
