export type RaiderIoRaidBoss = {
  name: string;
  slug: string;
  id: number;
  killed: number;
  last_kill?: number;
};

export type RaiderIoRaidProgression = {
  summary: string;
  total_bosses: number;
  bosses_killed?: number;
  mode?: string;
  bosses?: RaiderIoRaidBoss[];
  normal_bosses_killed?: number;
  heroic_bosses_killed?: number;
  mythic_bosses_killed?: number;
};

export type RaiderIoRanking = {
  world: number;
  region: number;
  realm: number;
};

export type RaiderIoRaidRankings = Record<
  string,
  {
    normal?: RaiderIoRanking;
    heroic?: RaiderIoRanking;
    mythic?: RaiderIoRanking;
  }
>;

export type RaiderIoRaidStaticEncounter = {
  id: number;
  slug: string;
  name: string;
};

export type RaiderIoRaidStatic = {
  id: number;
  slug: string;
  name: string;
  short_name: string;
  encounters: RaiderIoRaidStaticEncounter[];
};

export type RaiderIoStaticDataResponse = {
  raids: RaiderIoRaidStatic[];
};

export type RaiderIoBossRankingEntry = {
  rank: number;
  regionRank: number;
  guild: {
    name: string;
    realm: {
      name: string;
      slug: string;
      isConnected: boolean;
    };
    region: {
      name: string;
      short_name: string;
      slug: string;
    };
  };
  encountersDefeated: Array<{
    slug: string;
    lastDefeated: string;
    firstDefeated: string;
  }>;
};

export type RaiderIoBossRankingsResponse = {
  difficulty: string;
  bossRankings: RaiderIoBossRankingEntry[];
};

type RaiderIoGuildProfile = {
  name: string;
  realm: string;
  region: string;
  last_crawled_at?: string;
  raid_progression?: Record<string, RaiderIoRaidProgression>;
  raid_rankings?: RaiderIoRaidRankings;
};

type RaiderIoOptions = {
  region: string;
  realm: string;
  name: string;
  revalidateSeconds?: number;
};

type RaiderIoAccessOptions = {
  accessKey: string;
  revalidateSeconds?: number;
};

const RAIDER_IO_BASE_URL = "https://raider.io/api/v1";

export async function getGuildRaidProgression({
  region,
  realm,
  name,
  revalidateSeconds = 3600,
}: RaiderIoOptions) {
  const params = new URLSearchParams({
    region,
    realm,
    name,
    fields: "raid_progression,raid_rankings",
  });

  const response = await fetch(`${RAIDER_IO_BASE_URL}/guilds/profile?${params.toString()}`, {
    next: { revalidate: revalidateSeconds },
  });

  if (!response.ok) {
    throw new Error(`Raider.IO request failed: ${response.status}`);
  }

  return (await response.json()) as RaiderIoGuildProfile;
}

export async function getRaidingStaticData({
  accessKey,
  expansionId,
  revalidateSeconds = 3600,
}: RaiderIoAccessOptions & { expansionId: number }) {
  const params = new URLSearchParams({
    access_key: accessKey,
    expansion_id: String(expansionId),
  });

  const response = await fetch(`${RAIDER_IO_BASE_URL}/raiding/static-data?${params.toString()}`, {
    next: { revalidate: revalidateSeconds },
  });

  if (!response.ok) {
    throw new Error(`Raider.IO static-data request failed: ${response.status}`);
  }

  return (await response.json()) as RaiderIoStaticDataResponse;
}

export async function getBossRankings({
  accessKey,
  raid,
  boss,
  difficulty,
  region,
  realm,
  revalidateSeconds = 3600,
}: RaiderIoAccessOptions & {
  raid: string;
  boss: string;
  difficulty: "normal" | "heroic" | "mythic";
  region: string;
  realm?: string;
}) {
  const params = new URLSearchParams({
    access_key: accessKey,
    raid,
    boss,
    difficulty,
    region,
  });

  if (realm) {
    params.set("realm", realm);
  }

  const response = await fetch(`${RAIDER_IO_BASE_URL}/raiding/boss-rankings?${params.toString()}`, {
    next: { revalidate: revalidateSeconds },
  });

  if (!response.ok) {
    throw new Error(`Raider.IO boss-rankings request failed: ${response.status}`);
  }

  return (await response.json()) as RaiderIoBossRankingsResponse;
}