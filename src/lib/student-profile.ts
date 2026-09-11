export interface ParsedStudentBio {
  about: string;
  phoneNumber: string;
  parentName: string;
  parentPhone: string;
  bloodGroup: string;
  currentYear: string;
  classSection: string;
}

export function parseStudentBio(rawBio?: string | null): ParsedStudentBio {
  let about = '';
  let phoneNumber = '';
  let parentName = '';
  let parentPhone = '';
  let bloodGroup = '';
  let currentYear = '';
  let classSection = '';

  if (rawBio) {
    try {
      const parsed = JSON.parse(rawBio);
      if (typeof parsed === 'object' && parsed !== null) {
        about = parsed.about || parsed.bio || '';
        phoneNumber = parsed.phoneNumber || '';
        parentName = parsed.parentName || '';
        parentPhone = parsed.parentPhone || '';
        bloodGroup = parsed.bloodGroup || '';
        currentYear = parsed.currentYear || '';
        classSection = parsed.classSection || '';
      } else {
        about = rawBio;
      }
    } catch (e) {
      about = rawBio;
    }
  }

  return {
    about,
    phoneNumber,
    parentName,
    parentPhone,
    bloodGroup,
    currentYear,
    classSection
  };
}

export function packStudentBio(details: {
  about?: string;
  phoneNumber?: string;
  parentName?: string;
  parentPhone?: string;
  bloodGroup?: string;
  currentYear?: string;
  classSection?: string;
}): string {
  return JSON.stringify({
    about: details.about || '',
    phoneNumber: details.phoneNumber || '',
    parentName: details.parentName || '',
    parentPhone: details.parentPhone || '',
    bloodGroup: details.bloodGroup || '',
    currentYear: details.currentYear || '',
    classSection: details.classSection || ''
  });
}
