import type {
  RaiderIoBossRankingsResponse,
  RaiderIoRaidProgression,
  RaiderIoRaidRankings,
  RaiderIoRaidStatic,
  RaiderIoRaidStaticEncounter,
  RaiderIoRanking,
} from "../../../lib/raiderio";
import {
  getBossRankings,
  getGuildRaidProgression,
  getRaidingStaticData,
} from "../../../lib/raiderio";

const REGION = "eu";
const REALM = "Ragnaros";
const GUILD_NAME = "Expurged";
const CURRENT_RAID_SLUG = "manaforge-omega";
const EXPANSION_ID = 10;
const DIFFICULTIES = ["normal", "heroic", "mythic"] as const;

const formatDate = (timestamp?: number) => {
  if (!timestamp) return null;
  const date = new Date(timestamp * 1000);
  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
};

const raidNameFromSummary = (summary: string) =>
  summary.replace(/\s*\d+\s*\/\s*\d+.*$/, "").trim();

const formatRaidSlug = (slug: string) =>
  slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const renderRanking = (label: string, ranking?: RaiderIoRanking) => (
  <div className="flex flex-col items-center rounded-lg border border-red-500 px-3 py-2">
    <span className="text-xs uppercase tracking-wider text-gray-400">{label}</span>
    <span className="text-lg font-semibold text-red-200">
      {ranking && ranking.world > 0 ? `#${ranking.world}` : "—"}
    </span>
  </div>
);

const highlightClass = "bg-red-700 text-white";

type Difficulty = (typeof DIFFICULTIES)[number];
type BossRankingByDifficulty = Partial<
  Record<
    Difficulty,
    {
      world?: RaiderIoBossRankingsResponse;
      realm?: RaiderIoBossRankingsResponse;
    }
  >
>;

export default async function Progression() {
  let currentRaid: RaiderIoRaidProgression | null = null;
  let raidHistory: Array<{
    name: string;
    completion: string;
    bossSummary?: string;
  }> = [];
  let raidRankings: RaiderIoRaidRankings | null = null;
  let lastUpdated: string | null = null;
  let errorMessage: string | null = null;
  let raidStatic: RaiderIoRaidStatic | null = null;
  let bossRankings: Record<string, BossRankingByDifficulty> = {};
  let missingApiKey = false;
  let latestKill: { boss: string; date: string } | null = null;

  try {
    const data = await getGuildRaidProgression({
      region: REGION,
      realm: REALM,
      name: GUILD_NAME,
    });

    const raids: RaiderIoRaidProgression[] = data.raid_progression
      ? Object.values(data.raid_progression)
      : [];

    raidRankings = data.raid_rankings ?? null;
    lastUpdated = data.last_crawled_at ? formatDate(Date.parse(data.last_crawled_at) / 1000) : null;

    if (raids.length > 0) {
      currentRaid = raids[0];
      raidHistory = raids.slice(1).map((raid) => ({
        name: raidNameFromSummary(raid.summary),
        completion: raid.summary,
        bossSummary: `${raid.heroic_bosses_killed ?? 0}/${raid.total_bosses} H`,
      }));
    }

    const accessKey = process.env.RAIDER_IO_API_KEY;
    if (!accessKey) {
      missingApiKey = true;
    } else {
      const staticData = await getRaidingStaticData({
        accessKey,
        expansionId: EXPANSION_ID,
      });

      raidStatic = staticData.raids.find((raid) => raid.slug === CURRENT_RAID_SLUG) ?? null;

      if (raidStatic) {
        const bossResults = await Promise.all(
          raidStatic.encounters.map(async (boss) => {
            const difficultyResults = await Promise.all(
              DIFFICULTIES.map(async (difficulty) => {
                try {
                  const [worldResponse, realmResponse] = await Promise.all([
                    getBossRankings({
                      accessKey,
                      raid: raidStatic!.slug,
                      boss: boss.slug,
                      difficulty,
                      region: REGION,
                    }),
                    getBossRankings({
                      accessKey,
                      raid: raidStatic!.slug,
                      boss: boss.slug,
                      difficulty,
                      region: REGION,
                      realm: REALM,
                    }),
                  ]);

                  return [difficulty, { world: worldResponse, realm: realmResponse }] as const;
                } catch (rankingError) {
                  console.error("Failed to load boss ranking", rankingError);
                  return [difficulty, undefined] as const;
                }
              })
            );

            return [boss.slug, Object.fromEntries(difficultyResults)];
          })
        );

        bossRankings = Object.fromEntries(bossResults);

        const latestKillEntry = raidStatic.encounters.reduce<
          { boss: string; date: Date } | null
        >((latest, boss) => {
          const rankingEntries = bossRankings[boss.slug]
            ? Object.values(bossRankings[boss.slug]!)
                .flatMap((response) => {
                  if (!response) return [];
                  return [response.world, response.realm]
                    .filter(Boolean)
                    .flatMap((result) => result?.bossRankings ?? []);
                })
                .filter((entry) => entry.guild.name.toLowerCase() === GUILD_NAME.toLowerCase())
            : [];
          const bossLastKill = rankingEntries
            .flatMap((entry) => entry.encountersDefeated.map((encounter) => encounter.lastDefeated))
            .map((date) => new Date(date))
            .sort((a, b) => b.getTime() - a.getTime())[0];

          if (!bossLastKill) return latest;
          if (!latest || bossLastKill.getTime() > latest.date.getTime()) {
            return { boss: boss.name, date: bossLastKill };
          }
          return latest;
        }, null);

        if (latestKillEntry) {
          latestKill = {
            boss: latestKillEntry.boss,
            date: new Intl.DateTimeFormat("en-GB", {
              year: "numeric",
              month: "short",
              day: "2-digit",
            }).format(latestKillEntry.date),
          };
        }
      }
    }
  } catch (error) {
    console.error("Failed to load Raider.IO progression", error);
    errorMessage = "Unable to load raid progression right now. Please check back soon.";
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-900 via-orange-900 to-black text-white pt-16">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-4xl md:text-6xl font-bold text-center text-red-400 mb-12">
          Raid Progression
        </h1>

        {errorMessage && (
          <div className="mb-10 rounded-lg border border-red-500 bg-black bg-opacity-50 p-6 text-center text-red-200">
            {errorMessage}
          </div>
        )}

        {missingApiKey && (
          <div className="mb-10 rounded-lg border border-yellow-500 bg-black bg-opacity-50 p-6 text-center text-yellow-200">
            Raider.IO access key is missing. Add <span className="font-semibold">RAIDER_IO_API_KEY</span> to
            <span className="font-semibold"> .env.local</span> to display boss rankings.
          </div>
        )}

        {/* Current Raid Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center text-red-300 mb-8">
            Current Raid: {currentRaid ? raidNameFromSummary(currentRaid.summary) : "Loading..."}
          </h2>
          {currentRaid ? (
            <div className="bg-black bg-opacity-50 border border-red-500 rounded-lg p-6 text-center">
              <p className="text-xl font-semibold text-red-200">{currentRaid.summary}</p>
              <p className="mt-2 text-gray-300">
                Normal: {currentRaid.normal_bosses_killed ?? 0}/{currentRaid.total_bosses} · Heroic:{" "}
                {currentRaid.heroic_bosses_killed ?? 0}/{currentRaid.total_bosses} · Mythic:{" "}
                {currentRaid.mythic_bosses_killed ?? 0}/{currentRaid.total_bosses}
              </p>
              {latestKill && (
                <p className="mt-2 text-sm text-gray-200">
                  Latest kill: <span className="font-semibold">{latestKill.boss}</span> ({latestKill.date})
                </p>
              )}
              <p className="mt-3 text-sm text-gray-400">
                Last updated: {lastUpdated ?? "from Raider.IO"}
              </p>
            </div>
          ) : (
            <div className="bg-black bg-opacity-50 border border-red-500 rounded-lg p-6 text-center">
              Loading progression data...
            </div>
          )}
        </section>

        {/* Raid History Section */}
        <section>
          <h2 className="text-3xl font-bold text-center text-red-300 mb-8">
            Raid History
          </h2>
          <div className="space-y-8">
            {raidHistory.length === 0 ? (
              <div className="bg-black bg-opacity-50 p-8 rounded-lg border border-red-500 text-center text-gray-300">
                No historical raid data yet.
              </div>
            ) : (
              raidHistory.map((raid, index) => (
                <div key={index} className="bg-black bg-opacity-50 p-8 rounded-lg border border-red-500">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                    <h3 className="text-2xl font-bold text-red-300">{raid.name}</h3>
                    <div className="flex items-center space-x-4 mt-2 md:mt-0">
                      <span className="text-green-400 font-medium">{raid.completion}</span>
                    </div>
                  </div>
                  {raid.bossSummary && (
                    <div className="text-sm text-gray-300">Heroic: {raid.bossSummary}</div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-3xl font-bold text-center text-red-300 mb-8">Raid Rankings</h2>
          {!raidRankings || Object.keys(raidRankings).length === 0 ? (
            <div className="bg-black bg-opacity-50 p-8 rounded-lg border border-red-500 text-center text-gray-300">
              Rankings are not available yet.
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(raidRankings).map(([raidSlug, rankings]) => (
                <div key={raidSlug} className="bg-black bg-opacity-50 p-6 rounded-lg border border-red-500">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <h3 className="text-xl font-bold text-red-300">{formatRaidSlug(raidSlug)}</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {renderRanking("Normal", rankings.normal)}
                    {renderRanking("Heroic", rankings.heroic)}
                    {renderRanking("Mythic", rankings.mythic)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mt-16">
          <h2 className="text-3xl font-bold text-center text-red-300 mb-8">Boss Rankings</h2>
          {!raidStatic ? (
            <div className="bg-black bg-opacity-50 p-8 rounded-lg border border-red-500 text-center text-gray-300">
              Boss rankings are not available yet.
            </div>
          ) : (
            <div className="space-y-4">
              {raidStatic.encounters.map((boss: RaiderIoRaidStaticEncounter) => {
                const rankingsByDifficulty = bossRankings[boss.slug] ?? {};
                return (
                  <div key={boss.slug} className="bg-black bg-opacity-50 p-6 rounded-lg border border-red-500">
                    <h3 className="text-xl font-bold text-red-200 mb-4">{boss.name}</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      {DIFFICULTIES.map((difficulty) => {
                        const rankingResponse = rankingsByDifficulty[difficulty];
                        const worldEntry = rankingResponse?.world?.bossRankings?.find(
                          (entry) => entry.guild.name.toLowerCase() === GUILD_NAME.toLowerCase()
                        );
                        const realmEntry = rankingResponse?.realm?.bossRankings?.find(
                          (entry) => entry.guild.name.toLowerCase() === GUILD_NAME.toLowerCase()
                        );
                        const rankLabel = worldEntry?.rank ? `#${worldEntry.rank}` : "—";
                        const lastDefeated =
                          worldEntry?.encountersDefeated?.[0]?.lastDefeated ||
                          realmEntry?.encountersDefeated?.[0]?.lastDefeated;
                        const defeatedAt = lastDefeated
                          ? new Intl.DateTimeFormat("en-GB", {
                              year: "numeric",
                              month: "short",
                              day: "2-digit",
                            }).format(new Date(lastDefeated))
                          : "Not defeated";
                        return (
                          <div
                            key={difficulty}
                            className={`rounded-lg border border-red-500 p-4 ${
                              difficulty === "normal" ? highlightClass : "bg-black/40"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-semibold uppercase tracking-wider">
                                {difficulty}
                              </span>
                              <span className="text-lg font-bold">{rankLabel}</span>
                            </div>
                            <div className="mt-2 text-xs text-gray-200">Last kill: {defeatedAt}</div>
                            <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                              <div className="rounded border border-red-500 px-2 py-1 text-center">
                                W: {worldEntry?.rank ?? "—"}
                              </div>
                              <div className="rounded border border-red-500 px-2 py-1 text-center">
                                R: {worldEntry?.regionRank ?? "—"}
                              </div>
                              <div className="rounded border border-red-500 px-2 py-1 text-center">
                                Realm: {realmEntry?.rank ?? "—"}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
