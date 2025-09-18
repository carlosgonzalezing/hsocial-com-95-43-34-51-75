import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getGroups, 
  getGroup, 
  getUserGroups, 
  createGroup, 
  joinGroup, 
  leaveGroup,
  getGroupMembers,
  getGroupPosts,
  createGroupPost
} from "@/lib/api/groups";
import { Group, GroupMember, GroupPost } from "@/types/database/groups.types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function useGroups() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: groups = [],
    isLoading: isLoadingGroups,
    refetch: refetchGroups
  } = useQuery({
    queryKey: ['groups'],
    queryFn: () => getGroups({ limit: 20 }),
  });

  const {
    data: userGroups = [],
    isLoading: isLoadingUserGroups,
    refetch: refetchUserGroups
  } = useQuery({
    queryKey: ['user-groups'],
    queryFn: getUserGroups,
  });

  const createGroupMutation = useMutation({
    mutationFn: createGroup,
    onSuccess: () => {
      toast({
        title: "Grupo creado",
        description: "Tu grupo ha sido creado exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['user-groups'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo crear el grupo",
        variant: "destructive",
      });
      console.error('Error creating group:', error);
    },
  });

  const joinGroupMutation = useMutation({
    mutationFn: joinGroup,
    onSuccess: () => {
      toast({
        title: "Te uniste al grupo",
        description: "Ahora eres miembro de este grupo",
      });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['user-groups'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo unir al grupo",
        variant: "destructive",
      });
      console.error('Error joining group:', error);
    },
  });

  const leaveGroupMutation = useMutation({
    mutationFn: leaveGroup,
    onSuccess: () => {
      toast({
        title: "Saliste del grupo",
        description: "Ya no eres miembro de este grupo",
      });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['user-groups'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo salir del grupo",
        variant: "destructive",
      });
      console.error('Error leaving group:', error);
    },
  });

  return {
    groups,
    userGroups,
    isLoadingGroups,
    isLoadingUserGroups,
    createGroup: createGroupMutation.mutate,
    joinGroup: joinGroupMutation.mutate,
    leaveGroup: leaveGroupMutation.mutate,
    refetchGroups,
    refetchUserGroups,
    isCreatingGroup: createGroupMutation.isPending,
    isJoiningGroup: joinGroupMutation.isPending,
    isLeavingGroup: leaveGroupMutation.isPending,
  };
}

export function useGroup(slugOrId?: string) {
  const {
    data: group,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['group', slugOrId],
    queryFn: () => getGroup(slugOrId!),
    enabled: !!slugOrId,
  });

  return {
    group,
    isLoading,
    refetch,
  };
}

export function useGroupMembers(groupId?: string) {
  const {
    data: members = [],
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['group-members', groupId],
    queryFn: () => getGroupMembers(groupId!),
    enabled: !!groupId,
  });

  return {
    members,
    isLoading,
    refetch,
  };
}

export function useGroupPosts(groupId?: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    data: posts = [],
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['group-posts', groupId],
    queryFn: () => getGroupPosts(groupId!, { limit: 20 }),
    enabled: !!groupId,
  });

  const createPostMutation = useMutation({
    mutationFn: (postData: { content: string; media_url?: string; media_type?: string }) =>
      createGroupPost(groupId!, postData),
    onSuccess: () => {
      toast({
        title: "Publicación creada",
        description: "Tu publicación ha sido compartida en el grupo",
      });
      queryClient.invalidateQueries({ queryKey: ['group-posts', groupId] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo crear la publicación",
        variant: "destructive",
      });
      console.error('Error creating group post:', error);
    },
  });

  return {
    posts,
    isLoading,
    refetch,
    createPost: createPostMutation.mutate,
    isCreatingPost: createPostMutation.isPending,
  };
}

export function useGroupRealtime(groupId?: string) {
  const queryClient = useQueryClient();
  const [onlineMembers, setOnlineMembers] = useState<string[]>([]);

  useEffect(() => {
    if (!groupId) return;

    // Subscribe to group posts changes
    const postsChannel = supabase
      .channel(`group-posts-${groupId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'posts',
        filter: `group_id=eq.${groupId}`,
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['group-posts', groupId] });
      })
      .subscribe();

    // Subscribe to group membership changes
    const membersChannel = supabase
      .channel(`group-members-${groupId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'group_members',
        filter: `group_id=eq.${groupId}`,
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['group-members', groupId] });
      })
      .subscribe();

    // Track online presence
    const presenceChannel = supabase
      .channel(`group-presence-${groupId}`)
      .on('presence', { event: 'sync' }, () => {
        const newState = presenceChannel.presenceState();
        const online = Object.keys(newState);
        setOnlineMembers(online);
      })
      .on('presence', { event: 'join' }, ({ key }) => {
        setOnlineMembers(prev => [...prev, key]);
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        setOnlineMembers(prev => prev.filter(id => id !== key));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(postsChannel);
      supabase.removeChannel(membersChannel);
      supabase.removeChannel(presenceChannel);
    };
  }, [groupId, queryClient]);

  return {
    onlineMembers,
  };
}