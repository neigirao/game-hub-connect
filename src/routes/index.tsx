import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  component: IndexRedirect,
});

function IndexRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      navigate({ to: session ? "/campaign" : "/login", replace: true });
    }).catch(() => {
      navigate({ to: "/login", replace: true });
    });
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
