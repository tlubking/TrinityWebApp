export interface BibleVersion {
  // Internal id
  id: string;

  // scripture.api.bible id (from https://scripture.api.bible)
  apiId: string;

  // Display name
  name: string;

  // Optional short abbreviation (if different from id)
  abbreviation?: string;

  default?: boolean;
}

// Array of Bible versions to choose from
export const SAMPLE_BIBLE_VERSIONS: BibleVersion[] = [
  {
    id: 'asv',
    apiId: '685d1470fe4d5c3b-01',
    name: 'American Standard Version',
    abbreviation: 'ASV',
    default: true,
  },
  {
    id: 'kjv',
    apiId: 'de4e12af7f28f599-01',
    name: 'King James Version',
    abbreviation: 'KJV',
  },
  {
    id: 'fbv',
    apiId: '65eec8e0b60e656b-01',
    name: 'Free Bible Version',
    abbreviation: 'FBV',
  },
  {
    id: 'lsv',
    apiId: '01b29f4b342acc35-01',
    name: 'Literal Standard Version',
    abbreviation: 'LSV',
  },
];
