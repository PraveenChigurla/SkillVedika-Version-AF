// utils/getTitle.ts

export function getTitleParts(input: any) {
  if (!input) return { part1: '', part2: '' };

  // CASE 1: simple text
  if (typeof input === 'string') {
    return { part1: input, part2: '' };
  }

  // CASE 2: JSON from backend { text: "Some Title" } or { text: "Some", title: "Other" } or { text: "Some", title2: "Other" }
  if (input.text) {
    // Handle {text, title} format (e.g., {"text": "Why Choose", "title": "SkillVedika?"})
    // or {text, title2} format
    return { part1: input.text, part2: input.title || input.title2 || input.part2 || '' };
  }

  // CASE 2b: some endpoints use { title: "Some Title", title2: "Other" }
  if (input.title) {
    return { part1: input.title, part2: input.title2 || input.part2 || '' };
  }

  // CASE 3: backend JSON with 2 parts { part1: "", part2: "" }
  return {
    part1: input.part1 || '',
    part2: input.part2 || '',
  };
}
