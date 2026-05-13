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
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return;
      if (session) {
        // Authenticated → vai para a campanha (área logada)
        navigate({ to: "/campaign", replace: true });
      } else {
        // Anônimo → landing estática em /home.html
        // Usamos location.replace porque home.html não é uma rota TanStack
        if (typeof window !== "undefined") {
          window.location.replace("/home.html");
        }
      }
    }).catch(() => {
      if (cancelled) return;
      if (typeof window !== "undefined") {
        window.location.replace("/home.html");
      }
    });
    return () => { cancelled = true; };
  }, [navigate]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg,#1c0d52 0%,#0b052b 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <div style={{
        fontFamily: "'Fredoka',system-ui,sans-serif",
        color: "#B7AEE0",
        fontSize: 22,
        letterSpacing: ".5px",
      }}>
        🎢 Carregando…
      </div>
    </div>
  );
}
