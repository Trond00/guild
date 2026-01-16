export default function Progression() {
  const currentRaid = {
    name: "Aberrus, the Shadowed Crucible",
    bosses: [
      { name: "Kazzara, the Hellforged", killed: true, date: "2024-01-20" },
      { name: "The Amalgamation Chamber", killed: true, date: "2024-01-22" },
      { name: "The Forgotten Experiments", killed: true, date: "2024-01-25" },
      { name: "Assault of the Zaqali", killed: false, date: null },
      { name: "Rashok, the Elder", killed: false, date: null },
      { name: "The Vigilant Steward, Zskarn", killed: false, date: null },
      { name: "Magmorax", killed: false, date: null },
      { name: "Echo of Neltharion", killed: false, date: null },
      { name: "Scalecommander Sarkareth", killed: false, date: null },
    ]
  };

  const raidHistory = [
    {
      name: "Vault of the Incarnates",
      completion: "9/9 Heroic",
      date: "2023-12-15",
      bosses: [
        "Eranog", "Terros", "The Primal Council", "Sennarth, The Cold Breath",
        "Dathea, Ascended", "Kurog Grimtotem", "Broodkeeper Diurna",
        "Raszageth the Storm-Eater"
      ]
    },
    {
      name: "Abberus, the Shadowed Crucible",
      completion: "3/9 Normal",
      date: "2024-01-25",
      bosses: ["Kazzara", "Amalgamation Chamber", "Forgotten Experiments"]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-900 via-orange-900 to-black text-white pt-16">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-4xl md:text-6xl font-bold text-center text-red-400 mb-12">
          Raid Progression
        </h1>

        {/* Current Raid Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center text-red-300 mb-8">
            Current Raid: {currentRaid.name}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentRaid.bosses.map((boss, index) => (
              <div key={index} className={`p-6 rounded-lg border-2 ${
                boss.killed
                  ? 'bg-green-900 border-green-500'
                  : 'bg-black bg-opacity-50 border-red-500'
              }`}>
                <h3 className="text-xl font-bold mb-2">{boss.name}</h3>
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    boss.killed ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                  }`}>
                    {boss.killed ? 'Defeated' : 'Undefeated'}
                  </span>
                  {boss.date && (
                    <span className="text-sm text-gray-400">
                      {boss.date}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Raid History Section */}
        <section>
          <h2 className="text-3xl font-bold text-center text-red-300 mb-8">
            Raid History
          </h2>
          <div className="space-y-8">
            {raidHistory.map((raid, index) => (
              <div key={index} className="bg-black bg-opacity-50 p-8 rounded-lg border border-red-500">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                  <h3 className="text-2xl font-bold text-red-300">{raid.name}</h3>
                  <div className="flex items-center space-x-4 mt-2 md:mt-0">
                    <span className="text-green-400 font-medium">{raid.completion}</span>
                    <span className="text-gray-400">{raid.date}</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold mb-3">Bosses Defeated:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                    {raid.bosses.map((boss, bossIndex) => (
                      <div key={bossIndex} className="flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        <span className="text-sm">{boss}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
