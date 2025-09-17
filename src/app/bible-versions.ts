import { BibleVersion } from './models/bible-version';

/**
 * Application-wide list of supported Bible versions.
 * Import `BIBLE_VERSIONS` where dropdown options are needed.
 */
export const BIBLE_VERSIONS: BibleVersion[] = [
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

/**
 * Helper: returns the default Bible version (marked `default: true`) or first entry.
 */
export function getDefaultBibleVersion(): BibleVersion {
  return BIBLE_VERSIONS.find((v) => v.default) || BIBLE_VERSIONS[0];
}
