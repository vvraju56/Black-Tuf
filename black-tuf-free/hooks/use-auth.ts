"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { supabase } from "@/services/client";
import { getProfile } from "@/services/profile";
import type { Profile } from "@/types";

export interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
}

export function useAuth(accessToken?: string): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
  });

  useEffect(() => {
    let active = true;

    const refresh = async () => {
      const {
        data: { user },
      } = accessToken
        ? await supabase().auth.getUser(accessToken)
        : await supabase().auth.getUser();
      if (!active) return;

      if (!user) {
        setState({ user: null, profile: null, loading: false });
        return;
      }

      const profile = await getProfile(user.id).catch(() => null);
      if (active) setState({ user, profile, loading: false });
    };

    void refresh();

    const { data } = supabase().auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
      if (session?.user) {
        void getProfile(session.user.id)
          .then((profile) => {
            if (active) setState({ user: session.user, profile, loading: false });
          })
          .catch(() => {
            if (active) setState({ user: session.user, profile: null, loading: false });
          });
      } else if (active) {
        setState({ user: null, profile: null, loading: false });
      }
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  return state;
}
