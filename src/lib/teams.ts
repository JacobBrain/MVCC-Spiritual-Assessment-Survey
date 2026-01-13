import { Team } from '@/types';

export const teams: Team[] = [
  {
    id: "nursery",
    name: "Babies & Toddlers (Nursery)",
    description: "Caring for infants and toddlers during services, creating a safe and loving environment for our youngest members.",
    link: "https://mvccfrederick.com/children"
  },
  {
    id: "school-age",
    name: "School Age",
    description: "Children's ministry for elementary-aged kids, helping them learn about God's love through engaging lessons and activities.",
    link: "https://mvccfrederick.com/children"
  },
  {
    id: "middle-school",
    name: "Middle School Students",
    description: "Youth ministry for middle schoolers (The Ridge), providing a fun and faith-building community for students.",
    link: "https://mvccfrederick.com/middle-school"
  },
  {
    id: "high-school",
    name: "High School Students",
    description: "Youth ministry for high schoolers (The Peak), equipping teens to live out their faith boldly.",
    link: "https://mvccfrederick.com/high-school"
  },
  {
    id: "young-adult",
    name: "Young Adult/College",
    description: "College-age ministry featuring small groups, mission trips, retreats, and special events for young adults.",
    link: "https://mvccfrederick.com/college"
  },
  {
    id: "marriage",
    name: "Marriage Ministry",
    description: "Christ-centered mentoring program supporting and strengthening marriages through trained marriage mentors.",
    link: "https://mvccfrederick.com/marriage"
  },
  {
    id: "womens",
    name: "Women's Ministry",
    description: "Bible studies, mentoring (Triads), retreats, and community opportunities for women to grow together in faith.",
    link: "https://mvccfrederick.com/women"
  },
  {
    id: "mens",
    name: "Men's Ministry",
    description: "Bible studies, breakfast gatherings, adventure trips, and mentoring opportunities for men to grow spiritually.",
    link: "https://mvccfrederick.com/men"
  },
  {
    id: "foster-adoption",
    name: "Adoption & Foster Support",
    description: "Partnership supporting foster and adoptive families through childcare, meals, mentoring, and practical help.",
    link: "https://mvccfrederick.com/ovcministry"
  },
  {
    id: "missions",
    name: "Missions Support",
    description: "Local and global outreach opportunities including short-term trips, partnerships, and community service.",
    link: "https://mvccfrederick.com/outreach"
  }
];

export const getTeamByName = (name: string): Team | undefined => {
  return teams.find(t => t.name === name);
};

export const getTeamById = (id: string): Team | undefined => {
  return teams.find(t => t.id === id);
};
