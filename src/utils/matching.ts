// unused, but re-add for fuzzy work

import Fuse from "fuse.js";

export type MatchConfidence = "exact" | "fuzzy" | "none";

export type MatchResult = {
  confidence: MatchConfidence;
  rowIndex: number;
  sheetName: string;
  formName: string;
  score: number;
};

const FUZZY_THRESHOLD = 0.4;

function normalize(name: string): string {
  return name
    .replace(/[,.'"-]/g, "")
    .split(/\s+/)
    .map((s) => s.toLowerCase().trim())
    .filter(Boolean)
    .sort()
    .join(" ");
}

export function findMatch(formName: string, sheetNames: string[]): MatchResult {
  const normalizedForm = normalize(formName);

  const exactIndex = sheetNames.findIndex(
    (name) => normalize(name) === normalizedForm,
  );

  if (exactIndex !== -1) {
    return {
      confidence: "exact",
      rowIndex: exactIndex,
      sheetName: sheetNames[exactIndex],
      formName,
      score: 1,
    };
  }

  const fuse = new Fuse(
    sheetNames.map((name, i) => ({
      name,
      normalized: normalize(name),
      index: i,
    })),
    {
      keys: ["normalized"],
      threshold: FUZZY_THRESHOLD,
      includeScore: true,
    },
  );

  const results = fuse.search(normalizedForm);

  if (results.length === 0) {
    return {
      confidence: "none",
      rowIndex: -1,
      sheetName: "",
      formName,
      score: 0,
    };
  }

  const best = results[0];
  const score = 1 - (best.score ?? 1);

  return {
    confidence: "fuzzy",
    rowIndex: best.item.index,
    sheetName: best.item.name,
    formName,
    score,
  };
}

export function findAllMatches(
  formNames: string[],
  sheetNames: string[],
): MatchResult[] {
  return formNames.map((name) => findMatch(name, sheetNames));
}
