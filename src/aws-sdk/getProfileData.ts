import { ParsedIniData } from "@aws-sdk/types";

// Match profile lines with optional quotes - compatible with TypeScript 5.x
const profileKeyRegex = /^profile\s+(?:"([^"]+)"|'([^']+)'|(\S+))$/;


/**
 * Returns the profile data from parsed ini data.
 * * Returns data for `default`
 * * Reads profileName after profile prefix including/excluding quotes
 */
export const getProfileData = (data: ParsedIniData): ParsedIniData =>
  Object.entries(data)
    // filter out non-profile keys
    .filter(([key]) => profileKeyRegex.test(key))
    // replace profile key with profile name
    .reduce((acc, [key, value]) => {
      const match = profileKeyRegex.exec(key);
      // Extract profile name from whichever capture group matched (double-quoted, single-quoted, or unquoted)
      const profileName = match ? (match[1] || match[2] || match[3]) : '';
      return { ...acc, [profileName]: value };
    }, {
      // Populate default profile, if present.
      ...(data.default && { default: data.default }),
    });
