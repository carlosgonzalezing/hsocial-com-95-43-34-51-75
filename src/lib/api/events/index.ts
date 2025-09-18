import { supabase } from "@/integrations/supabase/client";

export const createAcademicEvent = async (eventData: {
  // Post data
  content: string;
  visibility: 'public' | 'friends' | 'private';
  
  // Event data
  title: string;
  description: string;
  eventType: string;
  startDate: string;
  endDate: string;
  location?: string;
  isVirtual: boolean;
  meetingLink?: string;
  maxAttendees?: number;
}) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase.rpc('create_academic_event_atomic', {
    post_content: eventData.content,
    post_visibility: eventData.visibility,
    event_title: eventData.title,
    event_description: eventData.description,
    event_type: eventData.eventType,
    start_date: eventData.startDate,
    end_date: eventData.endDate,
    location: eventData.location || null,
    is_virtual: eventData.isVirtual,
    meeting_link: eventData.meetingLink || null,
    max_attendees: eventData.maxAttendees || null,
    user_id_param: user.id
  });

  if (error) throw error;
  
  const result = data as any;
  if (!result?.success) {
    throw new Error(result?.error || 'Error creating event');
  }

  return {
    postId: result.post_id,
    eventId: result.event_id,
    message: result.message
  };
};