import type { Genre, GameConfig } from '../types';

// ─── Genre Profiles ───────────────────────────────────────────
// Each profile provides thematic defaults, vocabulary, and
// flavour tables that seed world generation and narrative.

export interface GenreProfile {
  id: Genre;
  label: string;
  description: string;
  /** Tone adjectives for narrative generation */
  toneWords: string[];
  /** Common location types */
  locationTypes: string[];
  /** Common threat categories */
  threats: string[];
  /** Common faction archetypes */
  factionArchetypes: string[];
  /** Resource categories relevant to this genre */
  resources: string[];
  /** Climate / terrain defaults */
  terrains: string[];
  /** Species / entity archetypes */
  entityArchetypes: string[];
  /** Common quest seed hooks */
  questHooks: string[];
  /** Default toggles overrides */
  defaultMagic: number;
  defaultTech: number;
  defaultApocalypse: boolean;
}

export const GENRE_PROFILES: Record<Genre, GenreProfile> = {
  fantasy: {
    id: 'fantasy',
    label: 'Fantasy',
    description: 'Swords, sorcery, ancient ruins, and political intrigue.',
    toneWords: ['ancient', 'arcane', 'brutal', 'heroic', 'mythic', 'perilous'],
    locationTypes: [
      'ancient dungeon',
      'elven forest',
      'dwarven hold',
      'cursed swamp',
      'wizard tower',
      'ruined citadel',
      'mountain pass',
      'coastal city',
      'necropolis',
      'sacred grove',
    ],
    threats: ['undead horde', 'warlord', 'dragon', 'cult', 'plague', 'ancient curse'],
    factionArchetypes: [
      'mercenary guild',
      'mage council',
      'thieves guild',
      'holy order',
      'noble court',
      'dark brotherhood',
    ],
    resources: ['gold', 'iron ore', 'spell components', 'timber', 'ancient relics'],
    terrains: ['forest', 'mountains', 'plains', 'swamp', 'desert', 'tundra', 'coast'],
    entityArchetypes: ['human', 'elf', 'dwarf', 'orc', 'halfling', 'tiefling'],
    questHooks: [
      'retrieve a stolen artifact',
      'break an ancient curse',
      'root out a spy in the guild',
      'escort a noble to safety',
      'slay the beast plaguing the village',
      'uncover the traitor in the council',
    ],
    defaultMagic: 6,
    defaultTech: 2,
    defaultApocalypse: false,
  },

  'sci-fi': {
    id: 'sci-fi',
    label: 'Sci-Fi',
    description: 'Space stations, alien worlds, corporate wars, and transhumanist frontiers.',
    toneWords: ['clinical', 'cold', 'vast', 'isolated', 'tense', 'sterile'],
    locationTypes: [
      'space station',
      'colony ship',
      'alien planet',
      'derelict hulk',
      'asteroid base',
      'mega-city',
      'research facility',
      'generation ship',
      'orbital platform',
      'deep space relay',
    ],
    threats: ['alien species', 'rogue AI', 'corporate security', 'radiation leak', 'void creature', 'quarantine breach'],
    factionArchetypes: [
      'megacorporation',
      'resistance cell',
      'alien collective',
      'military junta',
      'AI faction',
      'science consortium',
    ],
    resources: ['fuel cells', 'rare minerals', 'data cores', 'alloys', 'biosamples'],
    terrains: ['vacuum', 'desert moon', 'ice world', 'jungle planet', 'gas giant', 'urban sprawl'],
    entityArchetypes: ['human', 'android', 'alien (insectoid)', 'alien (aquatic)', 'AI construct', 'augmented human'],
    questHooks: [
      'recover data from a drifting ship',
      'negotiate with the alien delegation',
      'sabotage the corporate outpost',
      'track the rogue AI before it uploads',
      'survive the quarantine zone breach',
      'locate the missing science team',
    ],
    defaultMagic: 0,
    defaultTech: 8,
    defaultApocalypse: false,
  },

  zombie: {
    id: 'zombie',
    label: 'Zombie Apocalypse',
    description: 'Survival horror in a collapsed civilization overrun by the undead.',
    toneWords: ['desperate', 'bleak', 'brutal', 'paranoid', 'raw', 'hopeless'],
    locationTypes: [
      'abandoned mall',
      'overrun hospital',
      'fortified farm',
      'city ruins',
      'highway blockade',
      'military bunker',
      'safe house',
      'subway tunnels',
      'university campus',
      'fuel depot',
    ],
    threats: ['horde', 'feral survivors', 'scavenger gangs', 'disease', 'starvation', 'betrayal'],
    factionArchetypes: [
      'survivor settlement',
      'raider gang',
      'military remnant',
      'cult',
      'scavenger crew',
      'quarantine enforcers',
    ],
    resources: ['food', 'medicine', 'fuel', 'ammo', 'water', 'batteries'],
    terrains: ['urban ruins', 'suburb', 'countryside', 'industrial zone', 'coastline', 'forest'],
    entityArchetypes: ['human survivor', 'infected (common)', 'infected (runner)', 'infected (bloater)', 'feral child', 'military remnant'],
    questHooks: [
      'find medicine for the sick child',
      'clear the building to shelter the group',
      'make contact with the radio signal',
      'retrieve the fuel before the gangers get it',
      'discover what caused the outbreak',
      'keep the peace between two rival survivor groups',
    ],
    defaultMagic: 0,
    defaultTech: 3,
    defaultApocalypse: true,
  },

  modern: {
    id: 'modern',
    label: 'Modern',
    description: 'Contemporary urban drama, crime, espionage, and street-level conflict.',
    toneWords: ['gritty', 'urban', 'cynical', 'tense', 'layered', 'political'],
    locationTypes: [
      'city district',
      'police precinct',
      'underground club',
      'corporate office',
      'port warehouse',
      'suburbs',
      'hospital',
      'embassy',
      'airport',
      'rooftop',
    ],
    threats: ['organized crime', 'corrupt officials', 'rival crew', 'blackmail', 'corporate espionage', 'undercover cop'],
    factionArchetypes: [
      'crime family',
      'police department',
      'street gang',
      'corporation',
      'intelligence agency',
      'activist group',
    ],
    resources: ['cash', 'contraband', 'intel', 'credentials', 'vehicles', 'weapons'],
    terrains: ['urban core', 'suburb', 'industrial', 'waterfront', 'rural'],
    entityArchetypes: ['human', 'organized crime figure', 'law enforcement', 'civilian', 'mercenary', 'hacker'],
    questHooks: [
      'retrieve the stolen drive before the CIA does',
      'negotiate with the gang holding your contact',
      'infiltrate the gala without being recognized',
      'find the witness before they disappear',
      'track the money to its source',
      'broker a truce between two crews',
    ],
    defaultMagic: 0,
    defaultTech: 7,
    defaultApocalypse: false,
  },

  cyberpunk: {
    id: 'cyberpunk',
    label: 'Cyberpunk',
    description: 'Chrome and neon, megacorps vs street, hacking and augmentation.',
    toneWords: ['neon', 'grimy', 'paranoid', 'electric', 'transient', 'brutal'],
    locationTypes: [
      'neon bazaar',
      'corporate arcology',
      'underground club',
      'data haven',
      'slum stack',
      'black market',
      'VR grid node',
      'gang turf',
      'port district',
      'megacorp tower',
    ],
    threats: ['corp sec team', 'rogue netrunner', 'gang enforcer', 'ICE', 'brain-fried decker', 'corpo spy'],
    factionArchetypes: [
      'megacorporation',
      'street gang',
      'netrunner collective',
      'black market ring',
      'police force',
      'underground resistance',
    ],
    resources: ['eddies', 'data shards', 'cybernetic parts', 'black market goods', 'access codes'],
    terrains: ['neon city core', 'corporate zone', 'combat zone', 'badlands', 'port', 'industrial sprawl'],
    entityArchetypes: ['human', 'full-conversion cyborg', 'AI construct', 'corpo drone', 'street samurai', 'netrunner'],
    questHooks: [
      'jack into the corp server and extract the file',
      'protect the fixer long enough to close the deal',
      'track the stolen experimental cyberware',
      'take down the rival fixer before the drop',
      'follow the data trail to the shadow board',
      'survive the ambush in the combat zone',
    ],
    defaultMagic: 0,
    defaultTech: 10,
    defaultApocalypse: false,
  },

  historical: {
    id: 'historical',
    label: 'Historical',
    description: 'Any historical era — ancient, medieval, renaissance, colonial, WWII.',
    toneWords: ['austere', 'brutal', 'political', 'visceral', 'period', 'tense'],
    locationTypes: [
      'walled city',
      'battlefield',
      'palace court',
      'village',
      'trading post',
      'monastery',
      'harbor district',
      'noble estate',
      'military camp',
      'frontier town',
    ],
    threats: ['enemy army', 'plague', 'political intrigue', 'famine', 'rebellion', 'foreign invasion'],
    factionArchetypes: [
      'noble house',
      'merchant guild',
      'military order',
      'religious institution',
      'peasant rebellion',
      'foreign power',
    ],
    resources: ['grain', 'silver', 'timber', 'iron', 'wool', 'spice'],
    terrains: ['plains', 'forest', 'hills', 'coast', 'mountains', 'river delta'],
    entityArchetypes: ['commoner', 'soldier', 'noble', 'clergy', 'merchant', 'spy'],
    questHooks: [
      'deliver the sealed letter without interception',
      'rally the troops before the siege',
      'root out the spy before the summit',
      'negotiate safe passage through the hostile lord\'s lands',
      'acquire the deed before the rival merchant',
      'survive the plague quarantine with the caravan',
    ],
    defaultMagic: 0,
    defaultTech: 2,
    defaultApocalypse: false,
  },

  mixed: {
    id: 'mixed',
    label: 'Mixed / Custom',
    description: 'Genre-agnostic blend — the engine adapts to your configuration.',
    toneWords: ['eclectic', 'layered', 'surprising', 'complex', 'adaptive'],
    locationTypes: [
      'ruined settlement',
      'hidden facility',
      'ancient site',
      'trading hub',
      'wilderness outpost',
      'contested zone',
    ],
    threats: ['unknown entity', 'rival faction', 'natural disaster', 'internal conflict', 'rogue element'],
    factionArchetypes: ['power bloc', 'underground network', 'governing body', 'fringe group', 'neutral broker'],
    resources: ['general goods', 'valuable materials', 'information', 'technology', 'magical essence'],
    terrains: ['varied', 'urban', 'wilderness', 'subterranean', 'aquatic'],
    entityArchetypes: ['human', 'non-human sapient', 'construct', 'hybrid', 'outsider'],
    questHooks: [
      'investigate the anomaly before it spreads',
      'broker a deal between two unlikely parties',
      'locate the missing person before the deadline',
      'expose the conspiracy at the heart of the organization',
    ],
    defaultMagic: 3,
    defaultTech: 3,
    defaultApocalypse: false,
  },
};

// ─── Helpers ──────────────────────────────────────────────────

export function getGenreProfile(genre: Genre): GenreProfile {
  return GENRE_PROFILES[genre];
}

/** Merge primary and secondary genre profiles for vocabulary */
export function mergedGenreProfile(config: GameConfig): GenreProfile {
  const primary = GENRE_PROFILES[config.genre];
  if (!config.secondGenre) return primary;
  const secondary = GENRE_PROFILES[config.secondGenre];
  return {
    ...primary,
    toneWords: [...new Set([...primary.toneWords, ...secondary.toneWords])],
    locationTypes: [...new Set([...primary.locationTypes, ...secondary.locationTypes])],
    threats: [...new Set([...primary.threats, ...secondary.threats])],
    factionArchetypes: [...new Set([...primary.factionArchetypes, ...secondary.factionArchetypes])],
    resources: [...new Set([...primary.resources, ...secondary.resources])],
    terrains: [...new Set([...primary.terrains, ...secondary.terrains])],
    entityArchetypes: [...new Set([...primary.entityArchetypes, ...secondary.entityArchetypes])],
    questHooks: [...new Set([...primary.questHooks, ...secondary.questHooks])],
  };
}
