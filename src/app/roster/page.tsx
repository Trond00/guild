export default function Roster() {
  const members = [
    { name: "Thrall", class: "Warrior", level: 70, role: "Tank" },
    { name: "Sylvanas", class: "Hunter", level: 70, role: "DPS" },
    { name: "Gul'dan", class: "Warlock", level: 70, role: "DPS" },
    { name: "Vol'jin", class: "Rogue", level: 70, role: "DPS" },
    { name: "Tyrande", class: "Priest", level: 70, role: "Healer" },
    { name: "Illidan", class: "Demon Hunter", level: 70, role: "DPS" },
    { name: "Jaina", class: "Mage", level: 70, role: "DPS" },
    { name: "Anduin", class: "Paladin", level: 70, role: "Healer" },
    { name: "Sargeras", class: "Warrior", level: 70, role: "Tank" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-900 via-orange-900 to-black text-white pt-16">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-4xl md:text-6xl font-bold text-center text-red-400 mb-12">
          Guild Roster
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {members.map((member, index) => (
            <div key={index} className="bg-black bg-opacity-50 p-6 rounded-lg">
              <div className="w-20 h-20 bg-red-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">{member.name.charAt(0)}</span>
              </div>
              <h3 className="text-xl font-bold text-center">{member.name}</h3>
              <p className="text-center text-red-300">{member.class}</p>
              <p className="text-center text-sm">Level {member.level}</p>
              <p className="text-center text-green-400">{member.role}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
