import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { GameNav } from "@/components/game-nav";
import { supabase } from "@/integrations/supabase/client";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg,#1c0d52 0%,#0b052b 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 24px",
        fontFamily: "'Inter',system-ui,sans-serif",
        color: "#fff",
      }}
    >
      <div style={{ maxWidth: 420, textAlign: "center" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>💥</div>
        <h1
          style={{
            fontFamily: "'Fredoka',system-ui,sans-serif",
            fontWeight: 700,
            fontSize: 28,
            margin: "0 0 8px",
          }}
        >
          Algo descarrilou
        </h1>
        <p style={{ color: "#B7AEE0", fontSize: 14, lineHeight: 1.6, marginBottom: 28 }}>
          Um erro inesperado aconteceu. Tente novamente ou volte para a página inicial.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            style={{
              fontFamily: "'Fredoka',system-ui,sans-serif",
              fontWeight: 700,
              fontSize: 15,
              background: "linear-gradient(180deg,#FFA502,#c97a00)",
              border: "2px solid #FFCB6B",
              borderRadius: 14,
              padding: "10px 24px",
              color: "#fff",
              cursor: "pointer",
              boxShadow: "0 4px 0 #6e3f00",
            }}
          >
            Tentar novamente
          </button>
          <a
            href="/"
            style={{
              fontFamily: "'Fredoka',system-ui,sans-serif",
              fontWeight: 700,
              fontSize: 15,
              background: "transparent",
              border: "2px solid #4a2aa6",
              borderRadius: 14,
              padding: "10px 24px",
              color: "#B7AEE0",
              cursor: "pointer",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            Início
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Crash Coaster — The game where failing is more fun than winning" },
      {
        name: "description",
        content:
          "Construa montanhas-russas improváveis, provoque acidentes épicos e compartilhe o caos. Crash Coaster é um jogo sandbox 2D de física no browser.",
      },
      { name: "author", content: "Crash Coaster" },
      { property: "og:title", content: "Crash Coaster 🎢" },
      {
        property: "og:description",
        content:
          "Construa montanhas-russas improváveis e compartilhe o caos. The game where failing is more fun than winning.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Crash Coaster 🎢" },
      {
        name: "twitter:description",
        content: "Construa montanhas-russas improváveis e compartilhe o caos.",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=JetBrains+Mono:wght@500;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      queryClient.invalidateQueries();
    });
    return () => subscription.unsubscribe();
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <GameNav />
      <Outlet />
    </QueryClientProvider>
  );
}
