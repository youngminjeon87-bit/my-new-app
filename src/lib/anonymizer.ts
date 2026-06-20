/**
 * Client-Side Local Privacy Filter (Anonymizer)
 * Masks sensitive patterns (phone numbers, emails, resident numbers) 
 * before sending data to the AI API to protect corporate data privacy.
 */

export interface AnonymizeResult {
  text: string;
  hasMasked: boolean;
  replacements: Array<{ original: string; masked: string }>;
}

export function anonymizeText(inputText: string): AnonymizeResult {
  if (!inputText) {
    return { text: '', hasMasked: false, replacements: [] };
  }

  let text = inputText;
  let hasMasked = false;
  const replacements: Array<{ original: string; masked: string }> = [];

  // 1. Email Address Masking (e.g. user@domain.com -> email_1@example.com)
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  let emailCount = 1;
  text = text.replace(emailRegex, (match) => {
    hasMasked = true;
    const masked = `email_${emailCount}@example.com`;
    replacements.push({ original: match, masked });
    emailCount++;
    return masked;
  });

  // 2. Korean Resident Registration Number (RRN) Masking (e.g. 900101-1234567 -> 900101-1******)
  const rrnRegex = /\b\d{6}[-~. ]?[1-4]\d{6}\b/g;
  text = text.replace(rrnRegex, (match) => {
    hasMasked = true;
    const clean = match.replace(/[-~. ]/g, '');
    const prefix = clean.substring(0, 6);
    const gender = clean.substring(6, 7);
    const separator = match.includes('-') ? '-' : match.includes('~') ? '~' : ' ';
    const masked = `${prefix}${separator}${gender}******`;
    replacements.push({ original: match, masked });
    return masked;
  });

  // 3. Phone Number Masking (e.g. 010-1234-5678 -> 010-0000-0000)
  const phoneRegex = /\b01[0-9][-.\s]?[0-9]{3,4}[-.\s]?[0-9]{4}\b/g;
  let phoneCount = 1;
  text = text.replace(phoneRegex, (match) => {
    hasMasked = true;
    // Keep the prefix (010, 011...) and formatting, replace main digits
    const parts = match.split(/[-.\s]/);
    let masked = '';
    if (parts.length === 3) {
      const separator = match.includes('-') ? '-' : match.includes('.') ? '.' : ' ';
      masked = `${parts[0]}${separator}${'0'.repeat(parts[1].length)}${separator}${'0'.repeat(parts[2].length)}`;
    } else {
      masked = `010-0000-0000`;
    }
    replacements.push({ original: match, masked });
    phoneCount++;
    return masked;
  });

  return {
    text,
    hasMasked,
    replacements
  };
}
