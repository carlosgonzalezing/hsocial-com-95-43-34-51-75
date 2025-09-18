import { supabase } from "@/integrations/supabase/client";
import { 
  Mentorship, 
  MentorshipSession, 
  Internship, 
  InternshipApplication,
  AcademicEvent,
  EventRegistration,
  UserReputation,
  SkillEndorsement,
  NotificationPreferences
} from "@/types/education";

// Ideas API (fetched from posts with post_type = 'idea')
export async function getIdeasFromPosts() {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      id,
      idea,
      created_at,
      user_id,
      profiles!inner(
        id,
        username,
        avatar_url,
        career
      )
    `)
    .eq('post_type', 'idea')
    .eq('visibility', 'public')
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  
  return (data || []).map(post => {
    // Safely parse the idea JSON data
    const ideaData = post.idea as any || {};
    
    return {
      id: post.id,
      title: ideaData.title || 'Sin título',
      description: ideaData.description || '',
      required_skills: ideaData.required_skills || [],
      max_participants: ideaData.max_participants || 5,
      deadline: ideaData.deadline || null,
      created_at: post.created_at,
      author: {
        id: post.profiles?.id,
        username: post.profiles?.username,
        avatar_url: post.profiles?.avatar_url,
        career: post.profiles?.career
      }
    };
  });
}

// Mentorships API
export async function getMentorships(filters?: {
  specialties?: string[];
  is_free?: boolean;
  rating_min?: number;
}) {
  let query = supabase
    .from('mentorships')
    .select(`
      *,
      mentor:profiles!mentorships_mentor_id_fkey(
        id,
        username,
        avatar_url,
        career,
        bio
      )
    `)
    .eq('is_active', true);

  if (filters?.specialties?.length) {
    query = query.overlaps('specialties', filters.specialties);
  }

  if (filters?.is_free !== undefined) {
    query = query.eq('is_free', filters.is_free);
  }

  if (filters?.rating_min) {
    query = query.gte('rating', filters.rating_min);
  }

  const { data, error } = await query.order('rating', { ascending: false });
  
  if (error) throw error;
  return data as Mentorship[];
}

export async function createMentorship(mentorship: Partial<Mentorship>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('mentorships')
    .insert({
      mentor_id: user.id,
      ...mentorship
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function bookMentorshipSession(
  mentorshipId: string, 
  scheduledAt: string,
  duration?: number
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('mentorship_sessions')
    .insert({
      mentorship_id: mentorshipId,
      student_id: user.id,
      scheduled_at: scheduledAt,
      duration: duration || 60
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function rateMentorshipSession(
  sessionId: string,
  rating: number,
  review?: string
) {
  const { data, error } = await supabase
    .from('mentorship_sessions')
    .update({
      student_rating: rating,
      student_review: review,
      status: 'completed'
    })
    .eq('id', sessionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Internships API
export async function getInternships(filters?: {
  careers?: string[];
  is_paid?: boolean;
  is_remote?: boolean;
  required_semester?: string;
}) {
  let query = supabase
    .from('internships')
    .select('*')
    .eq('status', 'active');

  if (filters?.careers?.length) {
    query = query.overlaps('required_careers', filters.careers);
  }

  if (filters?.is_paid !== undefined) {
    query = query.eq('is_paid', filters.is_paid);
  }

  if (filters?.is_remote !== undefined) {
    query = query.eq('is_remote', filters.is_remote);
  }

  if (filters?.required_semester) {
    query = query.or(`required_semester.eq.${filters.required_semester},required_semester.eq.any`);
  }

  const { data, error } = await query.order('created_at', { ascending: false });
  
  if (error) throw error;
  return data as Internship[];
}

export async function createInternship(internship: Partial<Internship>, postId: string) {
  const { data, error } = await supabase
    .from('internships')
    .insert({
      post_id: postId,
      company_name: internship.company_name || '',
      position_title: internship.position_title || '',
      description: internship.description || '',
      ...internship
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function applyToInternship(
  internshipId: string,
  application: Partial<InternshipApplication>
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('internship_applications')
    .insert({
      internship_id: internshipId,
      applicant_id: user.id,
      ...application
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getMyInternshipApplications() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('internship_applications')
    .select(`
      *,
      internship:internships(*)
    `)
    .eq('applicant_id', user.id)
    .order('applied_at', { ascending: false });

  if (error) throw error;
  return data;
}

// Academic Events API
export async function getAcademicEvents(filters?: {
  event_type?: string;
  target_audience?: string[];
  is_free?: boolean;
  start_date_from?: string;
}) {
  let query = supabase
    .from('academic_events')
    .select('*')
    .in('status', ['upcoming', 'live']);

  if (filters?.event_type) {
    query = query.eq('event_type', filters.event_type);
  }

  if (filters?.target_audience?.length) {
    query = query.overlaps('target_audience', filters.target_audience);
  }

  if (filters?.is_free !== undefined) {
    query = query.eq('is_free', filters.is_free);
  }

  if (filters?.start_date_from) {
    query = query.gte('start_date', filters.start_date_from);
  }

  const { data, error } = await query.order('start_date', { ascending: true });
  
  if (error) throw error;
  return (data || []).map(event => ({
    ...event,
    agenda: (event.agenda as any) || [],
    speakers: (event.speakers as any) || []
  })) as AcademicEvent[];
}

export async function createAcademicEvent(event: Partial<AcademicEvent>, postId: string) {
  const { data, error } = await supabase
    .from('academic_events')
    .insert({
      post_id: postId,
      title: event.title || '',
      description: event.description || '',
      event_type: event.event_type || 'seminar',
      start_date: event.start_date || new Date().toISOString(),
      end_date: event.end_date || new Date().toISOString(),
      agenda: (event.agenda as any) || [],
      speakers: (event.speakers as any) || [],
      ...event
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function registerForEvent(eventId: string, registrationData?: Record<string, any>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('event_registrations')
    .insert({
      event_id: eventId,
      user_id: user.id,
      registration_data: registrationData || {}
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getMyEventRegistrations() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('event_registrations')
    .select(`
      *,
      event:academic_events(*)
    `)
    .eq('user_id', user.id)
    .order('registered_at', { ascending: false });

  if (error) throw error;
  return data;
}

// Reputation and Endorsements API
export async function getUserReputation(userId: string) {
  const { data, error } = await supabase
    .from('user_reputation')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;
  return data as UserReputation[];
}

export async function endorseUserSkill(
  endorsedUserId: string,
  skillName: string,
  strengthLevel: number,
  comment?: string,
  context?: string
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('skill_endorsements')
    .insert({
      endorsed_user_id: endorsedUserId,
      endorser_id: user.id,
      skill_name: skillName,
      strength_level: strengthLevel,
      comment: comment,
      endorsement_context: context
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getSkillEndorsements(userId: string) {
  const { data, error } = await supabase
    .from('skill_endorsements')
    .select(`
      *,
      endorser:profiles!skill_endorsements_endorser_id_fkey(
        id,
        username,
        avatar_url
      )
    `)
    .eq('endorsed_user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as SkillEndorsement[];
}

// Notification Preferences API
export async function getNotificationPreferences() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data as NotificationPreferences | null;
}

export async function updateNotificationPreferences(preferences: Partial<NotificationPreferences>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('notification_preferences')
    .upsert({
      user_id: user.id,
      ...preferences
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}