import { PassionCategory } from '@/types';

export const passionOptions: { value: PassionCategory; label: string }[] = [
  { value: 'Education', label: 'Education' },
  { value: 'Abuse', label: 'Abuse Recovery & Prevention' },
  { value: 'Finances', label: 'Financial Stewardship' },
  { value: 'Poverty', label: 'Poverty & Hunger' },
  { value: 'Arts/Music', label: 'Arts & Music' },
  { value: 'Outdoors', label: 'Outdoors & Recreation' },
  { value: 'Marriage', label: 'Marriage & Family' },
  { value: 'Safety', label: 'Safety & Security' },
  { value: 'Construction', label: 'Construction & Maintenance' },
  { value: 'Parenting', label: 'Parenting & Childcare' },
  { value: 'Health', label: 'Health & Wellness' },
];

// Passion -> MP Opportunity IDs
export const passionToOpportunities: Record<string, number[]> = {
  'Education': [52, 56, 57],       // Children's, Middle School, High School
  'Abuse': [74],                     // Care Team
  'Finances': [61],                  // Outreach
  'Poverty': [61, 44],              // Outreach, Meals Ministry
  'Arts/Music': [60],               // Worship Band
  'Outdoors': [72],                 // Parking (campus/outdoors)
  'Marriage': [75],                  // Marriage Mentors
  'Safety': [62],                    // Safety & Security
  'Construction': [61],              // Outreach (serve projects)
  'Parenting': [219, 52],           // Child Care, Children's Ministry
  'Health': [74, 73],               // Care Team, Prayer Team
};

// Passion -> Team names (for team recommendations)
export const passionToTeams: Record<string, string[]> = {
  'Education': ['School Age', 'Middle School Students', 'High School Students'],
  'Abuse': ['Adoption & Foster Support'],
  'Finances': ['Outreach Ministry'],
  'Poverty': ['Outreach Ministry'],
  'Arts/Music': [],
  'Outdoors': ['Outreach Ministry'],
  'Marriage': ['Marriage Ministry'],
  'Safety': [],
  'Construction': ['Outreach Ministry'],
  'Parenting': ['Babies & Toddlers (Nursery)', 'School Age'],
  'Health': [],
};
