import { SkillCategory } from '@/types';

export const skillOptions: { value: SkillCategory; label: string }[] = [
  { value: 'Teaching', label: 'Teaching & Training' },
  { value: 'Tangibly', label: 'Hands-On Serving' },
  { value: 'Giving', label: 'Generous Giving' },
  { value: 'Cooking', label: 'Cooking & Meals' },
  { value: 'Organizing', label: 'Planning & Organizing' },
  { value: 'Counseling', label: 'Counseling & Listening' },
  { value: 'Designing', label: 'Creative Design' },
];

// Skill -> MP Opportunity IDs
export const skillToOpportunities: Record<string, number[]> = {
  'Teaching': [52, 56, 57],         // Children's, Middle School, High School
  'Tangibly': [51, 72, 44],         // Usher, Parking, Meals
  'Giving': [61],                    // Outreach
  'Cooking': [44, 54],              // Meals Ministry, Coffee Bar
  'Organizing': [59, 62],           // Worship Tech, Safety & Security
  'Counseling': [74, 75, 73],       // Care Team, Marriage Mentors, Prayer
  'Designing': [59, 60],            // Worship Tech, Worship Band
};

// Skill -> Team names (for team recommendations)
export const skillToTeams: Record<string, string[]> = {
  'Teaching': ['School Age', 'Middle School Students', 'High School Students'],
  'Tangibly': ['Outreach Ministry', 'Adoption & Foster Support'],
  'Giving': ['Outreach Ministry'],
  'Cooking': ['Adoption & Foster Support'],
  'Organizing': ['Outreach Ministry'],
  'Counseling': ['Marriage Ministry', "Women's Ministry", "Men's Ministry"],
  'Designing': [],
};
