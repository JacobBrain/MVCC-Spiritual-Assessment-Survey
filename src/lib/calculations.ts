import { GiftCategory, GiftScores, QuestionResponse, Recommendation } from '@/types';
import { teams, getTeamByName } from './teams';
import { giftToTeamMapping } from './gift-mappings';

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
  userSelectedTeams: string[]
): Recommendation[] {
  const topGifts = getTopGifts(giftScores, 3);
  const recommendations: Recommendation[] = [];
  const addedTeams = new Set<string>();

  // Collect all teams recommended by top gifts
  const giftBasedTeamsMap = new Map<string, GiftCategory>();
  topGifts.forEach(({ gift }) => {
    const teamsForGift = giftToTeamMapping[gift] || [];
    teamsForGift.forEach(teamName => {
      if (!giftBasedTeamsMap.has(teamName)) {
        giftBasedTeamsMap.set(teamName, gift);
      }
    });
  });

  // Priority 1: Teams that match BOTH gifts AND user interest (Perfect Match)
  userSelectedTeams.forEach(teamName => {
    if (giftBasedTeamsMap.has(teamName) && !addedTeams.has(teamName)) {
      const team = getTeamByName(teamName);
      if (team) {
        recommendations.push({
          team,
          matchType: 'perfect',
          giftMatch: giftBasedTeamsMap.get(teamName),
          priority: 1
        });
        addedTeams.add(teamName);
      }
    }
  });

  // Priority 2: Teams matching top gifts (not selected by user)
  giftBasedTeamsMap.forEach((gift, teamName) => {
    if (!addedTeams.has(teamName)) {
      const team = getTeamByName(teamName);
      if (team) {
        recommendations.push({
          team,
          matchType: 'gift-based',
          giftMatch: gift,
          priority: 2
        });
        addedTeams.add(teamName);
      }
    }
  });

  // Priority 3: User interests not matching gifts
  userSelectedTeams.forEach(teamName => {
    if (!addedTeams.has(teamName)) {
      const team = getTeamByName(teamName);
      if (team) {
        recommendations.push({
          team,
          matchType: 'user-interest',
          priority: 3
        });
        addedTeams.add(teamName);
      }
    }
  });

  // Sort by priority
  return recommendations.sort((a, b) => a.priority - b.priority);
}

export function getScoreInterpretation(score: number): string {
  if (score >= 16) return "Strong";
  if (score >= 12) return "Moderate";
  if (score >= 8) return "Developing";
  return "Not primary";
}

export function getScoreColor(score: number): string {
  if (score >= 16) return "text-green-600";
  if (score >= 12) return "text-blue-600";
  if (score >= 8) return "text-yellow-600";
  return "text-gray-500";
}
