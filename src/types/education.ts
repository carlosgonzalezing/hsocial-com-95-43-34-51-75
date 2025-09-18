// Educational Hub Types

export interface Mentorship {
  id: string;
  mentor_id: string;
  specialties: string[];
  description: string | null;
  availability: {
    days: string[];
    hours: {
      start: string;
      end: string;
    };
  };
  hourly_rate: number;
  is_free: boolean;
  max_students_per_session: number;
  session_duration: number;
  is_active: boolean;
  total_sessions: number;
  rating: number;
  total_reviews: number;
  created_at: string;
  updated_at: string;
  
  // Joined data
  mentor?: {
    id: string;
    username: string;
    avatar_url: string | null;
    career: string | null;
    bio: string | null;
  };
}

export interface MentorshipSession {
  id: string;
  mentorship_id: string;
  student_id: string;
  scheduled_at: string;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  meeting_link: string | null;
  notes: string | null;
  student_rating: number | null;
  student_review: string | null;
  mentor_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Internship {
  id: string;
  post_id: string;
  company_name: string;
  company_logo_url: string | null;
  position_title: string;
  description: string;
  requirements: string[];
  duration_months: number | null;
  is_paid: boolean;
  stipend_amount: number;
  location: string | null;
  is_remote: boolean;
  required_semester: string | null;
  required_careers: string[];
  skills_to_develop: string[];
  application_deadline: string | null;
  start_date: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  max_applications: number;
  current_applications: number;
  status: 'active' | 'paused' | 'closed' | 'expired';
  created_at: string;
  updated_at: string;
}

export interface InternshipApplication {
  id: string;
  internship_id: string;
  applicant_id: string;
  cover_letter: string | null;
  resume_url: string | null;
  portfolio_url: string | null;
  relevant_experience: string | null;
  motivation: string | null;
  status: 'pending' | 'reviewed' | 'interview' | 'accepted' | 'rejected';
  notes: string | null;
  applied_at: string;
  updated_at: string;
}

export interface AcademicEvent {
  id: string;
  post_id: string;
  title: string;
  description: string;
  event_type: 'conference' | 'seminar' | 'workshop' | 'hackathon' | 'webinar' | 'networking' | 'career_fair';
  start_date: string;
  end_date: string;
  location: string | null;
  is_virtual: boolean;
  meeting_link: string | null;
  max_attendees: number | null;
  current_attendees: number;
  registration_required: boolean;
  registration_deadline: string | null;
  is_free: boolean;
  ticket_price: number;
  organizer_name: string | null;
  organizer_contact: string | null;
  agenda: EventAgendaItem[];
  speakers: EventSpeaker[];
  sponsors: string[];
  certificates_available: boolean;
  target_audience: string[];
  tags: string[];
  status: 'upcoming' | 'live' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface EventAgendaItem {
  time: string;
  title: string;
  speaker: string;
  description: string;
}

export interface EventSpeaker {
  name: string;
  bio: string;
  photo: string;
  linkedin: string;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  user_id: string;
  registration_data: Record<string, any>;
  attendance_status: 'registered' | 'attended' | 'no_show' | 'cancelled';
  check_in_time: string | null;
  certificate_issued: boolean;
  feedback_rating: number | null;
  feedback_comment: string | null;
  registered_at: string;
  updated_at: string;
}

export interface UserReputation {
  id: string;
  user_id: string;
  reputation_type: 'mentor' | 'student' | 'organizer' | 'participant';
  category: 'academic' | 'professional' | 'social' | 'leadership';
  points: number;
  level_name: string;
  badges: string[];
  achievements: Record<string, {
    earned_at: string;
    description: string;
  }>;
  endorsements_received: number;
  endorsements_given: number;
  completed_mentorships: number;
  events_organized: number;
  events_attended: number;
  last_activity_date: string;
  created_at: string;
  updated_at: string;
}

export interface SkillEndorsement {
  id: string;
  endorsed_user_id: string;
  endorser_id: string;
  skill_name: string;
  endorsement_context: string | null;
  strength_level: number;
  comment: string | null;
  created_at: string;
  
  // Joined data
  endorser?: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
}

export interface NotificationPreferences {
  id: string;
  user_id: string;
  mentorship_requests: boolean;
  mentorship_reminders: boolean;
  event_recommendations: boolean;
  internship_matches: boolean;
  weekly_digest: boolean;
  career_opportunities: boolean;
  skill_endorsements: boolean;
  achievement_notifications: boolean;
  created_at: string;
  updated_at: string;
}

export interface OpportunityFilters {
  search: string;
  type: 'all' | 'mentorship' | 'internship' | 'event' | 'jobs' | 'projects' | 'ideas';
  category: string;
  location: string;
  isRemote: boolean;
  isPaid: boolean;
  career: string;
  semester: string;
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'all';
  availability: 'immediate' | 'flexible' | 'scheduled';
  duration: 'short' | 'medium' | 'long' | 'all'; // for mentorships and internships
  eventType: string; // for academic events
}