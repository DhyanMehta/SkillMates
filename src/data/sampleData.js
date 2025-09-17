// Sample data for the SkillMates Platform

export const users = [
  {
    id: 1,
    name: "Alex Chen",
    email: "alex@example.com",
    location: "San Francisco, CA",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    skillsOffered: ["React", "JavaScript", "Node.js"],
    skillsWanted: ["Python", "Machine Learning", "Data Science"],
    availability: "Weekends",
    rating: 4.8,
    reviews: 12,
    isPublic: true,
    bio: "Full-stack developer with 5 years of experience. Love teaching and learning new technologies."
  },
  {
    id: 2,
    name: "Maria Rodriguez",
    email: "maria@example.com",
    location: "Austin, TX",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612-34e6?w=150&h=150&fit=crop&crop=face",
    skillsOffered: ["Python", "Data Science", "Machine Learning"],
    skillsWanted: ["React", "UI/UX Design", "Frontend"],
    availability: "Evenings",
    rating: 4.9,
    reviews: 18,
    isPublic: true,
    bio: "Data scientist passionate about AI and machine learning. Looking to expand into frontend development."
  },
  {
    id: 3,
    name: "David Kim",
    email: "david@example.com",
    location: "Seattle, WA",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    skillsOffered: ["UI/UX Design", "Figma", "Adobe Creative Suite"],
    skillsWanted: ["Vue.js", "TypeScript", "Backend Development"],
    availability: "Flexible",
    rating: 4.7,
    reviews: 9,
    isPublic: true,
    bio: "Creative designer with a passion for user experience. Want to learn more about implementation."
  },
  {
    id: 4,
    name: "Sarah Johnson",
    email: "sarah@example.com",
    location: "New York, NY",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    skillsOffered: ["Vue.js", "TypeScript", "CSS/SASS"],
    skillsWanted: ["AWS", "DevOps", "Docker"],
    availability: "Weekdays",
    rating: 4.6,
    reviews: 15,
    isPublic: true,
    bio: "Frontend developer specializing in Vue.js. Looking to expand my cloud and DevOps knowledge."
  },
  {
    id: 5,
    name: "James Wilson",
    email: "james@example.com",
    location: "Denver, CO",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    skillsOffered: ["AWS", "DevOps", "Docker", "Kubernetes"],
    skillsWanted: ["Mobile Development", "React Native", "Flutter"],
    availability: "Weekends",
    rating: 4.9,
    reviews: 22,
    isPublic: true,
    bio: "DevOps engineer with extensive cloud experience. Interested in mobile app development."
  },
  {
    id: 6,
    name: "Emily Brown",
    email: "emily@example.com",
    location: "Boston, MA",
    avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face",
    skillsOffered: ["Mobile Development", "React Native", "iOS"],
    skillsWanted: ["Blockchain", "Web3", "Solidity"],
    availability: "Evenings",
    rating: 4.8,
    reviews: 14,
    isPublic: true,
    bio: "Mobile developer with 4 years of experience. Exploring blockchain and Web3 technologies."
  }
];

export const swapRequests = [
  {
    id: 1,
    fromUserId: 1,
    toUserId: 2,
    fromUser: users.find(u => u.id === 1),
    toUser: users.find(u => u.id === 2),
    offeredSkill: "React",
    requestedSkill: "Python",
    message: "Hi Maria! I'd love to learn Python from you. I can help you with React in return.",
    status: "pending",
    createdAt: "2024-01-15T10:30:00Z"
  },
  {
    id: 2,
    fromUserId: 3,
    toUserId: 1,
    fromUser: users.find(u => u.id === 3),
    toUser: users.find(u => u.id === 1),
    offeredSkill: "UI/UX Design",
    requestedSkill: "JavaScript",
    message: "Hello! I'm interested in improving my JavaScript skills. I can help with design.",
    status: "accepted",
    createdAt: "2024-01-14T15:45:00Z"
  },
  {
    id: 3,
    fromUserId: 4,
    toUserId: 5,
    fromUser: users.find(u => u.id === 4),
    toUser: users.find(u => u.id === 5),
    offeredSkill: "Vue.js",
    requestedSkill: "AWS",
    message: "Hi James! Would love to learn AWS from you. I can teach Vue.js in exchange.",
    status: "rejected",
    createdAt: "2024-01-13T09:20:00Z"
  }
];

export const availabilityOptions = [
  "Weekdays",
  "Weekends", 
  "Evenings",
  "Mornings",
  "Flexible"
];

// Current logged in user (for demo purposes)
export const currentUser = users[0];