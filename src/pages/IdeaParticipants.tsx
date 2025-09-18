
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FacebookLayout } from "@/components/layout/FacebookLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IdeaParticipant } from "@/types/post";
import { useToast } from "@/hooks/use-toast";

export default function IdeaParticipants() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [ideaTitle, setIdeaTitle] = useState("");
  const [participants, setParticipants] = useState<IdeaParticipant[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchIdeaAndParticipants = async () => {
      if (!id) return;

      try {
        setLoading(true);
        
        // 1. Get post and idea data
        const { data: post, error: postError } = await supabase
          .from("posts")
          .select("idea, user_id")
          .eq("id", id)
          .single();

        if (postError) {
          console.error("Error fetching idea:", postError);
          toast({
            title: "Error",
            description: "No se pudo cargar la información de la idea",
            variant: "destructive"
          });
          return;
        }

        console.log("Post data:", post);
        
        // 2. Get the participants from idea_participants table (main source)
        // Fixed: Don't try to join with profiles directly, get the user_ids first
        const { data: participantsData, error: participantsError } = await supabase
          .from("idea_participants")
          .select("id, user_id, profession, created_at")
          .eq("post_id", id);
          
        if (participantsError) {
          console.error("Error fetching participants:", participantsError);
        }
        
        console.log("Participants data:", participantsData);

        // Extract idea title
        let ideaTitle = "Idea";
        if (post?.idea && typeof post.idea === 'object' && 'title' in post.idea) {
          ideaTitle = post.idea.title as string || "Idea sin título";
        }
        setIdeaTitle(ideaTitle);
        
        // 3. Process participants from idea_participants table
        const formattedParticipants: IdeaParticipant[] = [];
        
        if (participantsData && participantsData.length > 0) {
          // Get user IDs to fetch profiles
          const userIds = participantsData.map(p => p.user_id);
          
          // Fetch profiles for these user IDs
          const { data: profiles, error: profilesError } = await supabase
            .from("profiles")
            .select("id, username, avatar_url, career")
            .in("id", userIds);
            
          if (profilesError) {
            console.error("Error fetching profiles:", profilesError);
          }
          
          if (profiles && profiles.length > 0) {
            // Create a map of user_id to profile data for easier lookup
            const profileMap = new Map();
            profiles.forEach(profile => {
              profileMap.set(profile.id, profile);
            });
            
            // Create formatted participants with profile data
            participantsData.forEach(participant => {
              const profile = profileMap.get(participant.user_id);
              if (profile) {
                formattedParticipants.push({
                  user_id: participant.user_id,
                  profession: participant.profession || profile.career || "No especificado",
                  joined_at: participant.created_at,
                  username: profile.username || "Usuario",
                  avatar_url: profile.avatar_url
                });
              }
            });
          }
        }
        
        // 4. If no participants found in idea_participants, try to get from JSON field
        if (formattedParticipants.length === 0 && post?.idea && typeof post.idea === 'object') {
          const ideaData = post.idea as any;
          
          if ('participants' in ideaData && Array.isArray(ideaData.participants)) {
            console.log("JSON participants:", ideaData.participants);
            
            // Process JSON participants
            const jsonParticipants = ideaData.participants;
            
            // Extract participant IDs that are just strings
            const participantIds: string[] = [];
            const fullParticipants: IdeaParticipant[] = [];
            
            jsonParticipants.forEach((p: any) => {
              if (typeof p === 'string') {
                participantIds.push(p);
              } else if (p && typeof p === 'object' && 'user_id' in p) {
                fullParticipants.push({
                  user_id: p.user_id,
                  profession: p.profession || "No especificado",
                  joined_at: p.joined_at || new Date().toISOString(),
                  username: p.username || "Usuario",
                  avatar_url: p.avatar_url
                });
              }
            });
            
            console.log("Participant IDs:", participantIds);
            console.log("Full participants:", fullParticipants);
            
            // If there are simple user IDs, get their profiles
            if (participantIds.length > 0) {
              const { data: profiles, error: profilesError } = await supabase
                .from("profiles")
                .select("id, username, avatar_url, career")
                .in("id", participantIds);
                
              if (profilesError) {
                console.error("Error fetching profiles:", profilesError);
              } else if (profiles && profiles.length > 0) {
                console.log("Profiles obtained:", profiles);
                
                const participantsFromProfiles = profiles.map(profile => ({
                  user_id: profile.id,
                  username: profile.username || "Usuario",
                  avatar_url: profile.avatar_url || null,
                  profession: profile.career || "No especificado",
                  joined_at: new Date().toISOString()
                }));
                
                // Combine full participants and those from profiles
                formattedParticipants.push(...fullParticipants, ...participantsFromProfiles);
              } else {
                formattedParticipants.push(...fullParticipants);
              }
            } else {
              formattedParticipants.push(...fullParticipants);
            }
          }
        }
        
        // 5. Set participants and finish loading
        console.log("Final formatted participants:", formattedParticipants);
        setParticipants(formattedParticipants);
      } catch (error) {
        console.error("Complete error:", error);
        toast({
          title: "Error",
          description: "Ocurrió un error al cargar los participantes",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchIdeaAndParticipants();
    
    // Set up real-time subscription for updates
    const channel = supabase
      .channel(`idea_participants_updates_${id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'idea_participants',
        filter: `post_id=eq.${id}`
      }, () => {
        console.log("Change detected in participants, reloading...");
        fetchIdeaAndParticipants();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, toast]);

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <FacebookLayout>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <Button 
          variant="ghost" 
          className="mb-4 pl-0" 
          onClick={handleBack}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Participantes de la idea: {ideaTitle}
            </CardTitle>
          </CardHeader>
          
          <Separator />
          
          <CardContent className="pt-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : participants.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay participantes en esta idea todavía.
              </div>
            ) : (
              <ul className="space-y-4">
                {participants.map((participant, index) => (
                  <li key={`participant-${participant.user_id || index}`} className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/50">
                    <Avatar className="h-10 w-10">
                      {participant.avatar_url ? (
                        <AvatarImage src={participant.avatar_url} alt={participant.username || "Usuario"} />
                      ) : (
                        <AvatarFallback>
                          {participant.username ? participant.username.charAt(0).toUpperCase() : 'U'}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium">{participant.username || 'Usuario'}</span>
                      <Badge variant="outline" className="mt-1 w-fit">
                        {participant.profession || 'No especificado'}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </FacebookLayout>
  );
}
