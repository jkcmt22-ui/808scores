// School name mappings from ScoringLive to our database short_name
// ScoringLive uses various abbreviations and naming conventions

export const SCHOOL_NAME_MAP: Record<string, string> = {
  // ============ OIA Schools ============
  // Kahuku
  'Kahuku': 'Kahuku',
  'Kahuku Red Raiders': 'Kahuku',

  // Mililani
  'Mililani': 'Mililani',
  'Mililani Trojans': 'Mililani',

  // Campbell
  'Campbell': 'Campbell',
  'Campbell Sabers': 'Campbell',

  // Kapolei
  'Kapolei': 'Kapolei',
  'Kapolei Hurricanes': 'Kapolei',

  // Waianae
  'Waianae': 'Waianae',
  'Waianae Seariders': 'Waianae',

  // Moanalua
  'Moanalua': 'Moanalua',
  'Moanalua Menehunes': 'Moanalua',

  // Leilehua
  'Leilehua': 'Leilehua',
  'Leileihua': 'Leilehua',
  'Leilehua Mules': 'Leilehua',

  // Aiea
  'Aiea': 'Aiea',
  'Aiea Na Alii': 'Aiea',

  // Pearl City
  'Pearl City': 'Pearl City',
  'Pearl City Chargers': 'Pearl City',

  // Radford
  'Radford': 'Radford',
  'Radford Rams': 'Radford',

  // Kailua
  'Kailua': 'Kailua',
  'Kailua Surfriders': 'Kailua',

  // Kalaheo
  'Kalaheo': 'Kalaheo',
  'Kalaheo Mustangs': 'Kalaheo',

  // Roosevelt
  'Roosevelt': 'Roosevelt',
  'Roosevelt Rough Riders': 'Roosevelt',

  // Kalani
  'Kalani': 'Kalani',
  'Kalani Falcons': 'Kalani',

  // Castle
  'Castle': 'Castle',
  'Castle Knights': 'Castle',

  // Farrington
  'Farrington': 'Farrington',
  'Farrington Governors': 'Farrington',

  // McKinley
  'McKinley': 'McKinley',
  'McKinley Tigers': 'McKinley',

  // Nanakuli
  'Nanakuli': 'Nanakuli',
  'Nankuli': 'Nanakuli',
  'Nanakuli Golden Hawks': 'Nanakuli',

  // Waipahu
  'Waipahu': 'Waipahu',
  'Waipahu Marauders': 'Waipahu',

  // Kaiser
  'Kaiser': 'Kaiser',
  'Kaiser Cougars': 'Kaiser',

  // Kaimuki
  'Kaimuki': 'Kaimuki',
  'Kaimuki Bulldogs': 'Kaimuki',

  // Waialua
  'Waialua': 'Waialua',
  'Waialua Bulldogs': 'Waialua',

  // ============ ILH Schools ============
  // Saint Louis
  'Saint Louis': 'Saint Louis',
  'St. Louis': 'Saint Louis',
  'St Louis': 'Saint Louis',
  'SL': 'Saint Louis',
  'Saint Louis Crusaders': 'Saint Louis',

  // Punahou
  'Punahou': 'Punahou',
  'Punahou Buffanblu': 'Punahou',

  // Kamehameha (Oahu)
  'Kamehameha': 'Kamehameha',
  'KS': 'Kamehameha',
  'KSK': 'Kamehameha',
  'Kamehameha Warriors': 'Kamehameha',
  'Kamehameha-Kapalama': 'Kamehameha',

  // Iolani
  'Iolani': "'Iolani",
  "'Iolani": "'Iolani",
  'IOL': "'Iolani",
  'Iolani Raiders': "'Iolani",
  "'Iolani Raiders": "'Iolani",

  // Damien
  'Damien': 'Damien',
  'Damien Monarchs': 'Damien',
  'Damien Memorial': 'Damien',

  // Mid-Pacific
  'Mid-Pacific': 'Mid-Pacific',
  'MPI': 'Mid-Pacific',
  'Mid Pacific': 'Mid-Pacific',
  'Mid-Pacific Owls': 'Mid-Pacific',

  // HBA
  'Hawaii Baptist': 'HBA',
  'HBA': 'HBA',
  'Hawaii Baptist Academy': 'HBA',
  'HBA Eagles': 'HBA',

  // Sacred Hearts
  'Sacred Hearts': 'Sacred Hearts',
  'SHA': 'Sacred Hearts',
  'Sacred Hearts Academy': 'Sacred Hearts',
  'Sacred Hearts Lancers': 'Sacred Hearts',

  // Maryknoll
  'Maryknoll': 'Maryknoll',
  'MS': 'Maryknoll',
  'Maryknoll Spartans': 'Maryknoll',

  // University Lab
  'University': 'University Lab',
  'University Lab': 'University Lab',
  'Univ Lab': 'University Lab',
  'Lab School': 'University Lab',
  'University Laboratory': 'University Lab',

  // Pac-Five
  'Pac-Five': 'Pac-Five',
  'Pac Five': 'Pac-Five',
  'Pac-5': 'Pac-Five',
  'Pac 5': 'Pac-Five',
  'Pac-Five Wolfpack': 'Pac-Five',

  // Le Jardin
  'Le Jardin': 'Le Jardin',
  'Le Jardin Academy': 'Le Jardin',
  'LeJardin': 'Le Jardin',

  // Assets
  'Assets': 'Assets',
  'Assets School': 'Assets',

  // Christian Academy
  'Christian Academy': 'Christian Academy',
  'Christian Liberty': 'Christian Academy',
  'Christian Liberty Academy': 'Christian Academy',

  // Hanalani
  'Hanalani': 'Hanalani',
  'Hanalani Schools': 'Hanalani',
  'Hanalani Royals': 'Hanalani',

  // Hawaiian Mission
  'Hawaiian Mission': 'Hawaiian Mission',
  'Hawaiian Mission Academy': 'Hawaiian Mission',
  'HMA': 'Hawaiian Mission',

  // St. Francis
  'St. Francis': 'St. Francis',
  'Saint Francis': 'St. Francis',
  'St Francis': 'St. Francis',

  // La Pietra
  'La Pietra': 'La Pietra',

  // Island Pacific
  'Island Pacific': 'Island Pacific',
  'Island Pacific Academy': 'Island Pacific',

  // St. Andrews
  'St. Andrews': 'St. Andrews',
  'Saint Andrews': 'St. Andrews',
  "St. Andrew's": 'St. Andrews',

  // ============ Division II Varsity Teams ============
  // These are second varsity teams from larger ILH schools
  "'Iolani II": "'Iolani II",
  'Iolani II': "'Iolani II",
  'Punahou II': 'Punahou II',
  'Kamehameha II': 'Kamehameha II',
  'KS II': 'Kamehameha II',
  'Saint Louis II': 'Saint Louis II',
  'St. Louis II': 'Saint Louis II',
  'Maryknoll II': 'Maryknoll II',
  'Mid-Pacific II': 'Mid-Pacific II',
  'MPI II': 'Mid-Pacific II',
  'Damien II': 'Damien II',
  'HBA II': 'HBA II',
  'Hawaii Baptist II': 'HBA II',
  'Sacred Hearts II': 'Sacred Hearts II',
  'SHA II': 'Sacred Hearts II',
  'University Lab II': 'University Lab II',
  'University II': 'University Lab II',

  // ============ MIL Schools (Maui) ============
  // Lahainaluna
  'Lahainaluna': 'Lahainaluna',
  'Lahainaluna Lunas': 'Lahainaluna',

  // Baldwin
  'Baldwin': 'Baldwin',
  'Baldwin Bears': 'Baldwin',

  // Maui High
  'Maui High': 'Maui High',
  'Maui': 'Maui High',
  'Maui Sabers': 'Maui High',
  'Maui High Sabers': 'Maui High',

  // Kamehameha Maui
  'Kamehameha Maui': 'Kamehameha Maui',
  'KS Maui': 'Kamehameha Maui',
  'Kamehameha-Maui': 'Kamehameha Maui',
  'KS-Maui': 'Kamehameha Maui',

  // King Kekaulike
  'King Kekaulike': 'King Kekaulike',
  'Kekaulike': 'King Kekaulike',
  'King Kekaulike Na Alii': 'King Kekaulike',
  'Kekaulike Na Alii': 'King Kekaulike',

  // Kihei Charter
  'Kihei Charter': 'Kihei Charter',
  'Kihei': 'Kihei Charter',

  // Kulanihakoi (Maui middle/intermediate - map to Maui High area)
  'Kulanihakoi': 'Kulanihakoi',

  // Seabury
  'Seabury Hall': 'Seabury',
  'Seabury': 'Seabury',
  'Seabury Spartans': 'Seabury',

  // Molokai
  'Molokai': 'Molokai',
  'Molokai Farmers': 'Molokai',

  // Lanai
  'Lanai': 'Lanai',
  'Lanai Pine Lads': 'Lanai',

  // Hana
  'Hana': 'Hana',
  'Hana Dragons': 'Hana',

  // Maui Prep
  'Maui Prep': 'Maui Prep',
  'Maui Prep Academy': 'Maui Prep',
  'Maui Preparatory': 'Maui Prep',

  // St. Anthony
  'St. Anthony': 'St. Anthony',
  'Saint Anthony': 'St. Anthony',
  'St Anthony': 'St. Anthony',
  'St. Anthony (Maui)': 'St. Anthony',

  // ============ BIIF Schools (Big Island) ============
  // Hilo
  'Hilo': 'Hilo',
  'Hilo Vikings': 'Hilo',

  // Waiakea
  'Waiakea': 'Waiakea',
  'Waiakea Warriors': 'Waiakea',

  // Keaau
  'Keaau': 'Keaau',
  "Kea'au": 'Keaau',
  'Keaau Cougars': 'Keaau',

  // Kealakehe
  'Kealakehe': 'Kealakehe',
  'Kealakehe Waveriders': 'Kealakehe',

  // Konawaena
  'Konawaena': 'Konawaena',
  'Konawaena Wildcats': 'Konawaena',

  // Kamehameha Hawaii
  'Kamehameha Hawaii': 'Kamehameha Hawaii',
  'KS Hawaii': 'Kamehameha Hawaii',
  'Kamehameha-Hawaii': 'Kamehameha Hawaii',
  'KS-Hawaii': 'Kamehameha Hawaii',

  // Honokaa
  'Honokaa': 'Honokaa',
  "Honoka'a": 'Honokaa',
  'Honokaa Dragons': 'Honokaa',

  // Pahoa
  'Pahoa': 'Pahoa',
  'Pahoa Daggers': 'Pahoa',

  // HPA
  'Hawaii Prep': 'HPA',
  'HPA': 'HPA',
  'Hawaii Preparatory': 'HPA',
  'Hawaii Preparatory Academy': 'HPA',
  'HPA Ka Makani': 'HPA',

  // Parker
  'Parker': 'Parker',
  'Parker School': 'Parker',
  'Parker Panthers': 'Parker',

  // Kau
  'Kau': 'Kau',
  "Ka'u": 'Kau',
  'Kau Trojans': 'Kau',

  // Kohala
  'Kohala': 'Kohala',
  'Kohala Cowboys': 'Kohala',

  // Laupahoehoe
  'Laupahoehoe': 'Laupahoehoe',
  'Laupahoehoe Seasiders': 'Laupahoehoe',

  // St. Joseph
  'St. Joseph': 'St. Joseph',
  'Saint Joseph': 'St. Joseph',
  'St Joseph': 'St. Joseph',

  // Makua Lani
  'Makua Lani': 'Makua Lani',
  'Makua Lani Christian': 'Makua Lani',

  // ============ KIF Schools (Kauai) ============
  // Kapaa
  'Kapaa': 'Kapaa',
  "Kapa'a": 'Kapaa',
  'Kapaa Warriors': 'Kapaa',

  // Kauai
  'Kauai': 'Kauai',
  'Kauai High': 'Kauai',
  'Kauai Red Raiders': 'Kauai',

  // Waimea
  'Waimea': 'Waimea',
  'Waimea Menehunes': 'Waimea',
  'Waimea (Kauai)': 'Waimea',

  // Island School
  'Island School': 'Island School',
  'Island School Islanders': 'Island School',
}

// Sport URL paths from ScoringLive mapped to our sport codes
export const SPORT_URL_MAP: Record<string, string> = {
  'boysbasketball': 'boys-basketball',
  'girlsbasketball': 'girls-basketball',
  'boyssoccer': 'boys-soccer',
  'girlssoccer': 'girls-soccer',
  'football': 'football',
  'girlsvolleyball': 'girls-volleyball',
  'boysvolleyball': 'boys-volleyball',
  'baseball': 'baseball',
  'softball': 'softball',
}

// Sport IDs in our database (from migrations)
export const SPORT_IDS: Record<string, string> = {
  'football': '11111111-1111-1111-1111-111111111101',
  'girls-volleyball': '11111111-1111-1111-1111-111111111201',
  'boys-basketball': '11111111-1111-1111-1111-111111111202',
  'girls-basketball': '11111111-1111-1111-1111-111111111203',
  'boys-soccer': '11111111-1111-1111-1111-111111111204',
  'girls-soccer': '11111111-1111-1111-1111-111111111205',
  'boys-volleyball': '11111111-1111-1111-1111-111111111206',
  'baseball': '11111111-1111-1111-1111-111111111104',
  'softball': '11111111-1111-1111-1111-111111111105',
}

// Active sports by season
export const SPORTS_BY_SEASON: Record<string, string[]> = {
  fall: ['football', 'girlsvolleyball'],
  winter: ['boysbasketball', 'girlsbasketball', 'boyssoccer', 'girlssoccer'],
  spring: ['baseball', 'softball', 'boysvolleyball'],
}

// Get current season based on month
export function getCurrentSeason(): 'fall' | 'winter' | 'spring' {
  const month = new Date().getMonth() + 1 // 1-12
  if (month >= 8 && month <= 11) return 'fall'    // Aug-Nov
  if (month >= 12 || month <= 2) return 'winter'  // Dec-Feb
  return 'spring'                                  // Mar-Jul
}

// Get active sports for scraping
export function getActiveSports(): string[] {
  const season = getCurrentSeason()
  return SPORTS_BY_SEASON[season] || []
}
