export const BRAND = {
  name: import.meta.env.VITE_BRAND_NAME ?? 'Software Quality Lab',
  role: import.meta.env.VITE_BRAND_ROLE ?? 'Software Quality Engineer',
  github: import.meta.env.VITE_GITHUB_URL ?? 'https://github.com/',
  linkedin: import.meta.env.VITE_LINKEDIN_URL ?? 'https://www.linkedin.com/',
  email: import.meta.env.VITE_CONTACT_EMAIL ?? 'hello@example.com',
  resume: import.meta.env.VITE_RESUME_URL ?? '/resume-placeholder.txt',
}
