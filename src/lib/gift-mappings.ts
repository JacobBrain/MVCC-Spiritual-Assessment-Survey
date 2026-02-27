import { GiftCategory } from '@/types';

// Maps each spiritual gift to recommended ministry teams
// These mappings can be made admin-configurable in V2
export const giftToTeamMapping: Record<GiftCategory, string[]> = {
  teaching: [
    "School Age",
    "Middle School Students",
    "High School Students",
    "Young Adult/College"
  ],
  pastoring: [
    "Marriage Ministry",
    "Women's Ministry",
    "Men's Ministry",
    "Young Adult/College"
  ],
  mercy: [
    "Adoption & Foster Support",
    "Babies & Toddlers (Nursery)"
  ],
  hospitality: [
    "Babies & Toddlers (Nursery)",
    "Women's Ministry",
    "Men's Ministry"
  ],
  serving: [
    "Babies & Toddlers (Nursery)",
    "School Age",
    "Adoption & Foster Support",
    "Outreach Ministry"
  ],
  leadership: [
    "Middle School Students",
    "High School Students",
    "Young Adult/College",
    "Men's Ministry"
  ],
  evangelism: [
    "Outreach Ministry",
    "Young Adult/College"
  ],
  exhortation: [
    "Marriage Ministry",
    "Women's Ministry",
    "Men's Ministry",
    "Adoption & Foster Support"
  ],
  administration: [
    "Outreach Ministry"
  ],
  giving: [
    "Outreach Ministry",
    "Adoption & Foster Support"
  ],
  wisdom: [
    "Marriage Ministry",
    "Men's Ministry",
    "Women's Ministry"
  ]
};

export const getTeamsForGift = (gift: GiftCategory): string[] => {
  return giftToTeamMapping[gift] || [];
};

export const getGiftsForTeam = (teamName: string): GiftCategory[] => {
  const gifts: GiftCategory[] = [];
  for (const [gift, teams] of Object.entries(giftToTeamMapping)) {
    if (teams.includes(teamName)) {
      gifts.push(gift as GiftCategory);
    }
  }
  return gifts;
};
