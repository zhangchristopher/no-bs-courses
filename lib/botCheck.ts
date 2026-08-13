// Zero-dependency bot filtering: a honeypot field real users never see or
// fill in, plus a minimum time-since-page-render check (scripts that submit
// instantly on load are almost never real people). Not as strong as a
// hosted CAPTCHA, but catches the vast majority of naive scripted spam with
// no external service/API key required.
export function isLikelyBot(formData: FormData): boolean {
  const honeypot = String(formData.get("company_website") ?? "").trim();
  if (honeypot) return true;

  const renderedAt = Number(formData.get("form_rendered_at") ?? 0);
  if (renderedAt && Date.now() - renderedAt < 1500) return true;

  return false;
}
