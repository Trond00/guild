export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-900 via-orange-900 to-black text-white">
      {/* Hero Section */}
      <section className="relative flex items-center justify-center min-h-screen bg-gradient-to-b from-red-800 to-black">
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-6xl md:text-8xl font-bold text-red-500 mb-4">
            ExPurged
          </h1>
          <p className="text-2xl md:text-4xl mb-2">Ragnaros - Horde</p>
          <p className="text-xl md:text-2xl">Dominating Azeroth since 2005</p>
          <button className="mt-8 px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition duration-300">
            Join the Horde
          </button>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-4 bg-black bg-opacity-80">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-8 text-red-400">About Us</h2>
          <p className="text-lg leading-relaxed">
            ExPurged is a legendary Horde guild on Ragnaros server, dedicated to conquering the greatest challenges Azeroth has to offer.
            From raiding the toughest dungeons to PvP glory, we stand united for the Horde's supremacy.
          </p>
        </div>
      </section>

      {/* Roster Preview */}
      <section className="py-20 px-4 bg-gradient-to-r from-red-900 to-orange-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center text-red-400">Guild Roster</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Thrall", class: "Warrior", level: 70 },
              { name: "Sylvanas", class: "Hunter", level: 70 },
              { name: "Gul'dan", class: "Warlock", level: 70 },
            ].map((member, index) => (
              <div key={index} className="bg-black bg-opacity-50 p-6 rounded-lg text-center">
                <div className="w-24 h-24 bg-red-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">{member.name.charAt(0)}</span>
                </div>
                <h3 className="text-xl font-bold">{member.name}</h3>
                <p className="text-red-300">{member.class}</p>
                <p className="text-sm">Level {member.level}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* News Section */}
      <section className="py-20 px-4 bg-black bg-opacity-80">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center text-red-400">Latest News</h2>
          <div className="space-y-8">
            {[
              { title: "New Raid Progress", date: "2024-01-15", content: "We've downed the first boss in the latest raid!" },
              { title: "Guild Meeting", date: "2024-01-10", content: "Join us for our weekly strategy session." },
            ].map((news, index) => (
              <div key={index} className="border-l-4 border-red-500 pl-6">
                <h3 className="text-2xl font-bold">{news.title}</h3>
                <p className="text-sm text-gray-400 mb-2">{news.date}</p>
                <p>{news.content}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recruitment Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-orange-900 to-red-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-8 text-red-400">Join ExPurged</h2>
          <p className="text-lg mb-8">
            We're always looking for skilled players to join our ranks. Whether you're a tank, healer, DPS, or support, we have a place for you!
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {["Tank", "Healer", "DPS", "Support"].map((role) => (
              <div key={role} className="bg-black bg-opacity-50 p-4 rounded-lg">
                <h3 className="text-xl font-bold text-red-300">{role}</h3>
                <p className="text-green-400">Open</p>
              </div>
            ))}
          </div>
          <button className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition duration-300">
            Apply Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-black text-center">
        <div className="max-w-4xl mx-auto">
          <p className="mb-4">For the Horde!</p>
          <div className="flex justify-center space-x-6">
            <a href="#" className="text-red-400 hover:text-red-300">Discord</a>
            <a href="#" className="text-red-400 hover:text-red-300">Battle.net</a>
            <a href="#" className="text-red-400 hover:text-red-300">YouTube</a>
          </div>
          <p className="mt-8 text-sm text-gray-400">© 2024 ExPurged. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
