import { convexAuth } from "@convex-dev/auth/server";
import { Email } from "@convex-dev/auth/providers/Email";
import { Resend as ResendApi } from "resend";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Email({
      id: "resend",
      apiKey: process.env.AUTH_RESEND_KEY,
      maxAge: 60 * 60, // 1 hour magic link validity
      authorize: undefined,
      async sendVerificationRequest({
        identifier: email,
        url,
        provider,
      }: {
        identifier: string;
        url: string;
        provider: { apiKey?: string };
      }) {
        const apiKey = provider.apiKey ?? process.env.AUTH_RESEND_KEY;
        if (!apiKey) throw new Error("AUTH_RESEND_KEY no configurado.");
        const resend = new ResendApi(apiKey);
        const { error } = await resend.emails.send({
          from: process.env.AUTH_EMAIL_FROM ?? "Paul <paul@example.com>",
          to: [email],
          subject: "🐙 Paul te invita a la polla",
          html: magicLinkHtml(url),
        });
        if (error) throw new Error(`Resend: ${error.message}`);
      },
    }),
  ],
});

function magicLinkHtml(url: string) {
  return `
  <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px;color:#0b1f24;background:#f4f1ea;border-radius:16px">
    <h1 style="font-size:24px;margin:0 0 8px 0;color:#0e5c6b">🐙 El Pulpo Paul te espera</h1>
    <p style="margin:0 0 24px 0;color:#0b1f24cc">Paul ha sentido tu presencia. Haz clic abajo para entrar a la polla mundialera.</p>
    <a href="${url}" style="display:inline-block;background:#ee6c4d;color:#f4f1ea;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:600">Entrar a la polla</a>
    <p style="margin:24px 0 0 0;font-size:12px;color:#0b1f2488">Si no pediste este link, ignóralo. Paul es paciente.</p>
  </div>`;
}
