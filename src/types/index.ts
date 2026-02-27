export type GiftCategory =
  | 'administration'
  | 'evangelism'
  | 'exhortation'
  | 'giving'
  | 'hospitality'
  | 'leadership'
  | 'mercy'
  | 'pastoring'
  | 'serving'
  | 'teaching'
  | 'wisdom';

export type PassionCategory =
  | 'Education'
  | 'Abuse'
  | 'Finances'
  | 'Poverty'
  | 'Arts/Music'
  | 'Outdoors'
  | 'Marriage'
  | 'Safety'
  | 'Construction'
  | 'Parenting'
  | 'Health';

export type SkillCategory =
  | 'Teaching'
  | 'Tangibly'
  | 'Giving'
  | 'Cooking'
  | 'Organizing'
  | 'Counseling'
  | 'Designing';

export interface Question {
  id: number;
  text: string;
  giftCategory: GiftCategory;
}

export interface QuestionResponse {
  questionId: number;
  answerValue: number;
}

export interface GiftScores {
  administration: number;
  evangelism: number;
  exhortation: number;
  giving: number;
  hospitality: number;
  leadership: number;
  mercy: number;
  pastoring: number;
  serving: number;
  teaching: number;
  wisdom: number;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  link?: string;
}

export interface Recommendation {
  team: Team;
  matchType: 'perfect' | 'gift-based' | 'user-interest' | 'profile-based';
  giftMatch?: GiftCategory;
  priority: number;
}

export interface AssessmentSubmission {
  firstName: string;
  lastName: string;
  email: string;
  responses: QuestionResponse[];
  teamInterests: string[];
  passions: string[];
  skills: string[];
}

export interface AssessmentResult {
  assessmentId: string;
  giftScores: GiftScores;
  topGifts: Array<{ gift: GiftCategory; score: number }>;
  recommendations: Recommendation[];
}

export interface Assessment {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  created_at: string;
  administration_score: number;
  evangelism_score: number;
  exhortation_score: number;
  giving_score: number;
  hospitality_score: number;
  leadership_score: number;
  mercy_score: number;
  pastoring_score: number;
  serving_score: number;
  teaching_score: number;
  wisdom_score: number;
  top_gift_1: string;
  top_gift_2: string;
  top_gift_3: string;
}

export interface AssessmentDetail extends Assessment {
  responses: Array<{
    question_id: number;
    question_text: string;
    answer_value: number;
    gift_category: string;
  }>;
  team_interests: string[];
  passions: string[];
  skills: string[];
  recommendations: Array<{
    team_name: string;
    team_description: string;
    team_link: string;
    is_gift_based: boolean;
    gift_match: string;
  }>;
}
