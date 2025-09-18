import { supabase } from "@/integrations/supabase/client";
import { Group, GroupMember, GroupPost, GroupMessage } from "@/types/database/groups.types";

// Groups API
export async function createGroup(groupData: {
  name: string;
  description?: string;
  slug: string;
  is_private?: boolean;
  category?: string;
  tags?: string[];
  rules?: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase.rpc('create_group_atomic', {
    group_name: groupData.name,
    group_description: groupData.description || '',
    group_slug: groupData.slug,
    is_private: groupData.is_private || false,
    category: groupData.category || 'general',
    tags: groupData.tags || [],
    rules: groupData.rules || '',
    creator_id: user.id
  });

  if (error) throw error;
  
  const result = data as any;
  if (!result?.success) {
    throw new Error(result?.error || 'Error creating group');
  }

  return { id: result.group_id, ...groupData };
}

export async function getGroups(options?: {
  category?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  console.log("🚀 Obteniendo grupos con función optimizada...");
  
  // Usar función RPC optimizada
  const { data, error } = await supabase.rpc('get_public_groups', {
    limit_count: options?.limit || 20
  });

  if (error) throw error;

  let groups = data || [];

  // Aplicar filtros en memoria (más eficiente que múltiples consultas)
  if (options?.category) {
    groups = groups.filter(group => group.category === options.category);
  }

  if (options?.search) {
    const searchLower = options.search.toLowerCase();
    groups = groups.filter(group => 
      group.name?.toLowerCase().includes(searchLower) ||
      group.description?.toLowerCase().includes(searchLower)
    );
  }

  // Aplicar offset si es necesario
  if (options?.offset) {
    groups = groups.slice(options.offset, options.offset + (options.limit || 10));
  }

  console.log(`✅ Cargados ${groups.length} grupos públicos`);
  
  return groups.map(group => ({
    ...group,
    member_count: Number(group.member_count),
    post_count: Number(group.post_count)
  })) as Group[];
}

export async function getGroup(slugOrId: string) {
  console.log("🚀 Obteniendo grupo individual con función optimizada...");
  
  // Usar función RPC optimizada
  const { data, error } = await supabase.rpc('get_group_by_slug_or_id', {
    slug_or_id_param: slugOrId
  });

  if (error) throw error;
  
  if (!data || data.length === 0) {
    throw new Error("Grupo no encontrado");
  }

  const groupData = data[0];
  
  console.log(`✅ Grupo cargado: ${groupData.name}`);
  
  return {
    ...groupData,
    member_count: Number(groupData.member_count),
    post_count: Number(groupData.post_count),
    created_by_user: {
      username: groupData.created_by_username,
      avatar_url: groupData.created_by_avatar_url
    }
  } as Group;
}

export async function getUserGroups() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  console.log("🚀 Obteniendo grupos del usuario con función optimizada...");
  
  // Usar función RPC optimizada
  const { data, error } = await supabase.rpc('get_user_groups', {
    user_id_param: user.id
  });

  if (error) throw error;
  
  console.log(`✅ Cargados ${data?.length || 0} grupos del usuario`);
  
  return (data || []).map(item => ({
    id: item.group_id,
    name: item.group_name,
    description: item.group_description,
    slug: item.group_slug,
    avatar_url: item.group_avatar_url,
    is_private: item.is_private,
    created_at: item.created_at,
    member_count: Number(item.member_count),
    post_count: Number(item.post_count),
    user_role: item.role,
    joined_at: item.joined_at
  })) as (Group & { user_role: string; joined_at: string })[];
}

// Group Members API
export async function joinGroup(groupId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { error } = await supabase
    .from('group_members')
    .insert({
      group_id: groupId,
      user_id: user.id,
      role: 'member'
    });

  if (error) throw error;
}

export async function leaveGroup(groupId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { error } = await supabase
    .from('group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('user_id', user.id);

  if (error) throw error;
}

export async function getGroupMembers(groupId: string) {
  const { data, error } = await supabase
    .from('group_members')
    .select(`
      *,
      user:profiles!group_members_user_id_fkey(username, avatar_url)
    `)
    .eq('group_id', groupId)
    .order('joined_at', { ascending: false });

  if (error) throw error;
  return data?.map(item => ({
    ...item,
    user: {
      username: (item.user as any)?.username || 'Usuario',
      avatar_url: (item.user as any)?.avatar_url || null
    }
  })) as GroupMember[];
}

// Group Posts API
export async function createGroupPost(groupId: string, postData: {
  content: string;
  media_url?: string;
  media_type?: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from('posts')
    .insert({
      ...postData,
      group_id: groupId,
      user_id: user.id,
    })
    .select(`
      *,
      user:profiles(username, avatar_url)
    `)
    .single();

  if (error) throw error;
  return data as GroupPost;
}

export async function getGroupPosts(groupId: string, options?: {
  limit?: number;
  offset?: number;
}) {
  let query = supabase
    .from('posts')
    .select(`
      *,
      user:profiles!posts_user_id_fkey(username, avatar_url),
      comments_count:comments!comments_post_id_fkey(count),
      reactions_count:reactions!reactions_post_id_fkey(count)
    `)
    .eq('group_id', groupId);

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return data?.map(item => ({
    ...item,
    user: item.user as { username: string; avatar_url: string | null },
    comments_count: Array.isArray(item.comments_count) ? item.comments_count.length : 0,
    reactions_count: Array.isArray(item.reactions_count) ? item.reactions_count.length : 0
  })) as GroupPost[];
}

// Group Messages API (for group chat)
export async function sendGroupMessage(groupId: string, content: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from('group_messages')
    .insert({
      group_id: groupId,
      user_id: user.id,
      content,
    })
    .select(`
      *,
      user:profiles!group_messages_sender_id_fkey(username, avatar_url)
    `)
    .single();

  if (error) throw error;
  return {
    ...data,
    user_id: data.sender_id,
    user: data.user as { username: string; avatar_url: string | null }
  } as GroupMessage;
}

export async function getGroupMessages(groupId: string, options?: {
  limit?: number;
  offset?: number;
}) {
  let query = supabase
    .from('group_messages')
    .select(`
      *,
      user:profiles!group_messages_sender_id_fkey(username, avatar_url)
    `)
    .eq('group_id', groupId);

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  const { data, error } = await query.order('created_at', { ascending: true });

  if (error) throw error;
  return data?.map(item => ({
    ...item,
    user_id: item.sender_id,
    user: item.user as { username: string; avatar_url: string | null }
  })) as GroupMessage[];
}