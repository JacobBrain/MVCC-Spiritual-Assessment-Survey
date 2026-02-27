import { GiftCategory } from '@/types';

const MP_BASE_URL = 'https://mvccfrederick.org/opportunity-details/?id=';

export interface Opportunity {
  id: number;
  title: string;
  description: string;
}

// All Ministry Platform opportunities referenced in mappings
export const opportunities: Record<number, Opportunity> = {
  52: { id: 52, title: "Children's Ministry Volunteer", description: "Serve elementary-aged kids through engaging lessons and activities." },
  109: { id: 109, title: "Children's Ministry Youth Helper", description: "Youth helpers assisting in children's ministry during services." },
  54: { id: 54, title: "Coffee Bar", description: "Create a welcoming atmosphere by serving coffee and refreshments." },
  55: { id: 55, title: "Connector", description: "Help guests feel welcome and connected to the church community." },
  72: { id: 72, title: "Parking", description: "Assist with parking lot logistics and greet people as they arrive." },
  51: { id: 51, title: "Usher", description: "Welcome attendees, assist with seating, and help services run smoothly." },
  60: { id: 60, title: "Worship Band", description: "Lead the congregation in worship through music and song." },
  59: { id: 59, title: "Worship Tech Team", description: "Run sound, lighting, and visuals to support worship services." },
  61: { id: 61, title: "Outreach Team", description: "Engage in local and global outreach to share God's love." },
  62: { id: 62, title: "Safety & Security Team", description: "Help ensure a safe environment for everyone on campus." },
  73: { id: 73, title: "Prayer Team", description: "Intercede for the church body and pray with people during services." },
  74: { id: 74, title: "Care Team", description: "Provide compassionate support and care to those in need." },
  75: { id: 75, title: "Marriage Mentors", description: "Mentor and support married couples through a Christ-centered program." },
  44: { id: 44, title: "Meals Ministry", description: "Prepare and deliver meals to families during times of need." },
  219: { id: 219, title: "Child Care Team", description: "Care for infants and toddlers in a safe, loving nursery environment." },
  224: { id: 224, title: "Hospitality Team", description: "Help create a warm and inviting experience for everyone at MVCC." },
  56: { id: 56, title: "Student Ministry (Middle School)", description: "Invest in middle schoolers through mentoring and fun community." },
  57: { id: 57, title: "Student Ministry (High School)", description: "Walk alongside high schoolers as they grow in faith." },
};

// Gift → most relevant MP opportunity IDs
export const giftToOpportunities: Record<GiftCategory, number[]> = {
  teaching: [52, 56, 57],
  pastoring: [75, 74, 57],
  mercy: [74, 44, 73],
  hospitality: [54, 55, 224],
  serving: [51, 72, 44],
  leadership: [57, 56, 60],
  evangelism: [61, 55],
  exhortation: [74, 75, 73],
  administration: [59, 62],
  giving: [61, 44],
  wisdom: [75, 73],
};

// Questionnaire team name → closest MP opportunity ID
// "Young Adult/College" has no direct MP opportunity, so it's omitted
export const teamToOpportunity: Record<string, number> = {
  "Babies & Toddlers (Nursery)": 219,
  "School Age": 52,
  "Middle School Students": 56,
  "High School Students": 57,
  "Marriage Ministry": 75,
  "Outreach Ministry": 61,
  "Adoption & Foster Support": 74,
  "Women's Ministry": 74,
  "Men's Ministry": 74,
  "Young Adult/College": 0, // no direct MP opportunity
};

export function getOpportunityUrl(id: number): string {
  return `${MP_BASE_URL}${id}`;
}

export interface SignUpOpportunity extends Opportunity {
  reason: string;
}

/**
 * Returns the top 3 unique sign-up opportunities based on gifts and team interests.
 * Priority:
 *   1. Opportunities matching BOTH a top gift AND a selected team interest
 *   2. Opportunities matching a top gift
 * Deduplicates by opportunity ID.
 */
export function getTopSignUpOpportunities(
  topGifts: Array<{ gift: GiftCategory; score: number }>,
  teamInterests: string[]
): SignUpOpportunity[] {
  const seen = new Set<number>();
  const results: SignUpOpportunity[] = [];

  // Build a set of opportunity IDs that come from team interests
  const interestOpportunityIds = new Set<number>();
  teamInterests.forEach(teamName => {
    const oppId = teamToOpportunity[teamName];
    if (oppId && oppId > 0) {
      interestOpportunityIds.add(oppId);
    }
  });

  // Priority 1: Opportunities matching BOTH a top gift AND a team interest
  for (const { gift } of topGifts) {
    const oppIds = giftToOpportunities[gift] || [];
    for (const id of oppIds) {
      if (seen.has(id) || !interestOpportunityIds.has(id)) continue;
      const opp = opportunities[id];
      if (!opp) continue;
      seen.add(id);
      results.push({
        ...opp,
        reason: `Perfect match — based on your gifts and interests`,
      });
      if (results.length >= 3) return results;
    }
  }

  // Priority 2: Opportunities matching a top gift (not yet added)
  for (const { gift } of topGifts) {
    const oppIds = giftToOpportunities[gift] || [];
    for (const id of oppIds) {
      if (seen.has(id)) continue;
      const opp = opportunities[id];
      if (!opp) continue;
      seen.add(id);
      const giftDisplayName = gift.charAt(0).toUpperCase() + gift.slice(1);
      results.push({
        ...opp,
        reason: `Matches your ${giftDisplayName} gift`,
      });
      if (results.length >= 3) return results;
    }
  }

  return results;
}
