import { Badge } from "../ui/badge"

export const sections = [
  { 
    id: 'hero', 
    subtitle: (
      <Badge variant="outline" className="text-white border-white">
        AI Powered Hiring
      </Badge>
    ),
    title: "Find the right job. Hire the right talent.",
    content: "An intelligent platform that connects job seekers and employers using AI-driven matching and smart CV building.",
    showButton: true,
    buttonText: 'Get Started'
  },

  { 
    id: 'about', 
    title: 'Why Our Platform?', 
    content: 'We simplify recruitment with AI-powered matching, reducing time, cost, and effort for both job seekers and employers.' 
  },

  { 
    id: 'features', 
    title: 'What We Offer', 
    content: 'Build professional CVs, get personalized job recommendations, automate candidate shortlisting, and schedule interviews seamlessly.' 
  },

  { 
    id: 'ai-matching', 
    title: 'Smart AI Matching', 
    content: 'Our AI analyzes skills, experience, and job requirements to recommend the best candidates and opportunities with high accuracy.' 
  },

  { 
    id: 'cv-builder', 
    title: 'Dynamic CV Builder', 
    content: 'Create multiple tailored CVs with structured sections like experience, education, and skills to match different job opportunities.' 
  },

  { 
    id: 'testimonials', 
    title: 'Success Stories', 
    content: 'Job seekers land better opportunities faster, while employers hire top talent efficiently using our intelligent system.' 
  },

  { 
    id: 'join', 
    title: 'Start Your Journey', 
    content: 'Whether you are looking for a job or hiring talent, join our platform and experience the future of recruitment.',
    showButton: true,
    buttonText: 'Join Now'
  },
]