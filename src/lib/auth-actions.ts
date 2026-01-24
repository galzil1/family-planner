'use server';

import { createServerSupabaseClient } from './supabase-server';
import { redirect } from 'next/navigation';
import { DEFAULT_CATEGORIES, AVATAR_COLORS } from '@/types';

export async function signUp(formData: FormData) {
  const supabase = await createServerSupabaseClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const displayName = formData.get('displayName') as string;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.user) {
    // Create user profile
    const avatarColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
    
    const { error: profileError } = await supabase.from('users').insert({
      id: data.user.id,
      email: email,
      display_name: displayName,
      avatar_color: avatarColor,
    });

    if (profileError) {
      console.error('Error creating user profile:', profileError);
    }
  }

  return { success: true };
}

export async function signIn(formData: FormData) {
  const supabase = await createServerSupabaseClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect('/dashboard');
}

export async function signOut() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect('/login');
}

export async function createFamily(formData: FormData) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  const familyName = formData.get('familyName') as string;

  // Create family
  const { data: family, error: familyError } = await supabase
    .from('families')
    .insert({ name: familyName })
    .select()
    .single();

  if (familyError) {
    return { error: familyError.message };
  }

  // Update user with family_id
  const { error: updateError } = await supabase
    .from('users')
    .update({ family_id: family.id })
    .eq('id', user.id);

  if (updateError) {
    return { error: updateError.message };
  }

  // Create default categories
  const categories = DEFAULT_CATEGORIES.map((cat) => ({
    family_id: family.id,
    name: cat.name,
    color: cat.color,
    icon: cat.icon,
  }));

  await supabase.from('categories').insert(categories);

  redirect('/dashboard');
}

export async function joinFamily(formData: FormData) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  const inviteCode = formData.get('inviteCode') as string;

  // Find family by invite code
  const { data: family, error: findError } = await supabase
    .from('families')
    .select()
    .eq('invite_code', inviteCode.toLowerCase())
    .single();

  if (findError || !family) {
    return { error: 'Invalid invite code' };
  }

  // Update user with family_id
  const { error: updateError } = await supabase
    .from('users')
    .update({ family_id: family.id })
    .eq('id', user.id);

  if (updateError) {
    return { error: updateError.message };
  }

  redirect('/dashboard');
}

export async function getCurrentUser() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from('users')
    .select('*, families(*)')
    .eq('id', user.id)
    .single();

  return profile;
}

export async function getFamilyMembers() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data: currentUser } = await supabase
    .from('users')
    .select('family_id')
    .eq('id', user.id)
    .single();

  if (!currentUser?.family_id) {
    return [];
  }

  const { data: members } = await supabase
    .from('users')
    .select('*')
    .eq('family_id', currentUser.family_id);

  return members || [];
}
