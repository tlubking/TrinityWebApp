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
