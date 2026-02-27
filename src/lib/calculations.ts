import { GiftCategory, GiftScores, QuestionResponse, Recommendation } from '@/types';
import { teams, getTeamByName } from './teams';
import { giftToTeamMapping } from './gift-mappings';
import { passionToTeams } from './passion-mappings';
import { skillToTeams } from './skill-mappings';

// Question IDs that contribute to each gift score
const giftQuestionMapping: Record<GiftCategory, number[]> = {
  administration: [13, 17, 30, 37],
  evangelism: [8, 27, 34, 41],
  exhortation: [12, 25, 32, 40],
  giving: [16, 21, 28, 44],
  hospitality: [3, 24, 29, 47],
  leadership: [9, 15, 22, 42],
  mercy: [11, 20, 35, 43],
  pastoring: [7, 19, 26, 33],
  serving: [14, 23, 36, 45],
  teaching: [4, 10, 38, 46],
  wisdom: [6, 18, 31, 39]
};

export function calculateGiftScores(responses: QuestionResponse[]): GiftScores {
  const responseMap = new Map<number, number>();
  responses.forEach(r => responseMap.set(r.questionId, r.answerValue));

  const scores: GiftScores = {
    administration: 0,
    evangelism: 0,
    exhortation: 0,
    giving: 0,
    hospitality: 0,
    leadership: 0,
    mercy: 0,
    pastoring: 0,
    serving: 0,
    teaching: 0,
    wisdom: 0
  };

  for (const [gift, questionIds] of Object.entries(giftQuestionMapping)) {
    scores[gift as GiftCategory] = questionIds.reduce(
      (sum, qId) => sum + (responseMap.get(qId) || 0),
      0
    );
  }

  return scores;
}

export function getTopGifts(scores: GiftScores, count: number = 3): Array<{ gift: GiftCategory; score: number }> {
  return Object.entries(scores)
    .map(([gift, score]) => ({ gift: gift as GiftCategory, score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, count);
}

export function getRankedGifts(scores: GiftScores): Array<{ gift: GiftCategory; score: number }> {
  return Object.entries(scores)
    .map(([gift, score]) => ({ gift: gift as GiftCategory, score }))
    .sort((a, b) => b.score - a.score);
}

export function generateRecommendations(
  giftScores: GiftScores,
  userSelectedTeams: string[],
  passions: string[] = [],
  skills: string[] = []
): Recommendation[] {
  const topGifts = getTopGifts(giftScores, 3);

  // Score each of the 10 teams across all 4 dimensions
  const teamScoreMap = new Map<string, { score: number; giftMatch?: GiftCategory; dimensions: Set<string> }>();

  const ensureTeam = (teamName: string) => {
    if (!teamScoreMap.has(teamName)) {
      teamScoreMap.set(teamName, { score: 0, dimensions: new Set() });
    }
    return teamScoreMap.get(teamName)!;
  };

  // Gift scoring: #1 = 5pts, #2 = 4pts, #3 = 3pts
  const giftWeights = [5, 4, 3];
  topGifts.slice(0, 3).forEach(({ gift }, index) => {
    const teamsForGift = giftToTeamMapping[gift] || [];
    teamsForGift.forEach((teamName: string) => {
      const entry = ensureTeam(teamName);
      entry.score += giftWeights[index];
      entry.dimensions.add('gift');
      if (!entry.giftMatch) entry.giftMatch = gift;
    });
  });

  // Team interest scoring: 3 pts each
  userSelectedTeams.forEach((teamName: string) => {
    const entry = ensureTeam(teamName);
    entry.score += 3;
    entry.dimensions.add('interest');
  });

  // Passion scoring: 2 pts each
  passions.forEach((passion: string) => {
    const teamNames = passionToTeams[passion] || [];
    teamNames.forEach((teamName: string) => {
      const entry = ensureTeam(teamName);
      entry.score += 2;
      entry.dimensions.add('passion');
    });
  });

  // Skill scoring: 2 pts each
  skills.forEach((skill: string) => {
    const teamNames = skillToTeams[skill] || [];
    teamNames.forEach((teamName: string) => {
      const entry = ensureTeam(teamName);
      entry.score += 2;
      entry.dimensions.add('skill');
    });
  });

  // Sort by score descending
  const sorted = Array.from(teamScoreMap.entries())
    .sort(([, a], [, b]) => b.score - a.score);

  // Derive matchType from which dimensions contributed
  const deriveMatchType = (dims: Set<string>): Recommendation['matchType'] => {
    const hasGift = dims.has('gift');
    const hasInterest = dims.has('interest');
    if (hasGift && hasInterest) return 'perfect';
    if (hasGift) return 'gift-based';
    if (hasInterest) return 'user-interest';
    return 'profile-based';
  };

  // Map scores to priority tiers: top third = 1, middle = 2, rest = 3
  const recommendations: Recommendation[] = [];
  sorted.forEach(([teamName, data], index) => {
    const team = getTeamByName(teamName);
    if (!team) return;
    const priority = index < Math.ceil(sorted.length / 3) ? 1 : index < Math.ceil((sorted.length * 2) / 3) ? 2 : 3;
    recommendations.push({
      team,
      matchType: deriveMatchType(data.dimensions),
      giftMatch: data.giftMatch,
      priority,
    });
  });

  return recommendations;
}

export function getScoreInterpretation(score: number): string {
  if (score >= 13) return "Strong";
  if (score >= 9) return "Moderate";
  if (score >= 6) return "Developing";
  return "Not primary";
}

export function getScoreColor(score: number): string {
  if (score >= 13) return "text-green-600";
  if (score >= 9) return "text-blue-600";
  if (score >= 6) return "text-yellow-600";
  return "text-gray-500";
}
