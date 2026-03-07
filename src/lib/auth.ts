// Auth utility functions for client-side authentication
import { supabase } from '../lib/supabase/client';
import { createClient } from '../lib/supabase/server';

// Client-side auth functions
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Attach error code for easier detection in UI
    const enhancedError = error as any;
    enhancedError.code = enhancedError.code || enhancedError.name;
    throw enhancedError;
  }

  return data;
}

export async function signUp(email: string, password: string, name?: string) {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name || '',
      },
    },
  });

  if (authError) {
    throw authError;
  }

  if (authData.user?.id) {
    const { error: roleError } = await supabase.from('user_role').insert([
      { user_id: authData.user.id, role: 'user' },
    ]);

    if (roleError) {
      throw roleError;
    }
  }

  return authData;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}

export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  return user;
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function resetPassword(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function updatePassword(newPassword: string) {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function resendConfirmationEmail(email: string) {
  const { data, error } = await supabase.auth.resend({
    type: 'signup',
    email: email,
  });

  if (error) {
    throw error;
  }

  return data;
}

// Server-side auth functions
export async function getServerUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    return null;
  }

  return user;
}

