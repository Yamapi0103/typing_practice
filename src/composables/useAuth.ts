import { ref, onMounted, onUnmounted } from "vue";
import { supabase } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";

const user = ref<User | null>(null);

// init session immediately (module level)
supabase.auth.getSession().then(({ data }) => {
  user.value = data.session?.user ?? null;
});

supabase.auth.onAuthStateChange((_event, session) => {
  user.value = session?.user ?? null;
});

export function useAuth() {
  async function loginWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
  }

  async function logout() {
    await supabase.auth.signOut();
  }

  return { user, loginWithGoogle, logout };
}
