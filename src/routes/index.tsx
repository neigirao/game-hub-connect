import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  component: IndexRedirect,
});

function IndexRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams(window.location.search);
    const hasCallback = params.has("code") || params.has("access_token");

    if (hasCallback) {
      // OAuth callback: aguarda Supabase trocar o code por uma sessão
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        if (cancelled) return;
        if (event === "SIGNED_IN" && session) {
          subscription.unsubscribe();
          navigate({ to: "/campaign", replace: true });
        }
      });
      // Verificação imediata caso Supabase já tenha processado antes do mount
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (cancelled || !session) return;
        subscription.unsubscribe();
        navigate({ to: "/campaign", replace: true });
      });
      return () => {
        cancelled = true;
        subscription.unsubscribe();
      };
    }

    // Sem callback OAuth: fluxo normal
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (cancelled) return;
        if (session) {
          navigate({ to: "/campaign", replace: true });
        } else if (typeof window !== "undefined") {
          window.location.replace("/home.html");
        }
      })
      .catch(() => {
        if (cancelled) return;
        if (typeof window !== "undefined") window.location.replace("/home.html");
      });
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg,#1c0d52 0%,#0b052b 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          fontFamily: "'Fredoka',system-ui,sans-serif",
          color: "#B7AEE0",
          fontSize: 22,
          letterSpacing: ".5px",
        }}
      >
        🎢 Carregando…
      </div>
    </div>
  );
}
