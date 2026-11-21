import { expect, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderToStaticMarkup } from "react-dom/server";
import { PersonListItem } from "../src/app/components/people/person-list-item";
import { TimelineHeader } from "../src/app/components/chats/timeline-header";
import { authQueryKeys } from "../src/hooks/auth/auth-query-keys";
import { presenceQueryKeys } from "../src/hooks/users/presence-query-keys";

test("pessoas e conversa exibem presença do participante da sessão atual", () => {
  const client = new QueryClient();
  client.setQueryData(authQueryKeys.session(), { isAuthenticated: true, user: { id: "viewer", email: "viewer@example.com" } });
  const render = () => renderToStaticMarkup(
    <QueryClientProvider client={client}>
      <PersonListItem user={{ user_id: "person", email: "person@example.com", created_at: "2026-11-18T12:00:00Z" }} onSelect={() => {}} />
      <TimelineHeader participantId="person" participantName="Person" />
    </QueryClientProvider>,
  );
  expect(render()).toContain("Verificando presença...");
  client.setQueryData(presenceQueryKeys.session("viewer"), { onlineUserIds: ["person"], ready: true });
  expect(render().match(/aria-label="Online"/g)).toHaveLength(2);
  client.setQueryData(presenceQueryKeys.session("viewer"), { onlineUserIds: [], ready: true });
  expect(render().match(/aria-label="Ausente"/g)).toHaveLength(2);
  client.setQueryData(presenceQueryKeys.session("viewer"), { onlineUserIds: ["person"], ready: true });
  client.setQueryData(authQueryKeys.session(), { isAuthenticated: true, user: { id: "new-viewer", email: "new@example.com" } });
  expect(render()).not.toContain('aria-label="Online"');
  expect(render()).toContain("Verificando presença...");
  client.clear();
});
