export type Locale = 'pt-BR' | 'en'
export const translations = {
  'pt-BR': {
    nav: { home: 'Início', about: 'Sobre', articles: 'Artigos', cases: 'Cases', lab: 'Test Lab', admin: 'Admin' }, theme: { switchToDark: 'Ativar tema escuro', switchToLight: 'Ativar tema claro' },
    viewAll: 'Ver todos', read: 'Ler conteúdo', featured: 'Em destaque', noContent: 'Ainda não há conteúdo publicado nesta seção.',
    role: 'Software Quality Engineer', tagline: 'Qualidade de software como prática de engenharia.',
    intro: 'Um espaço pessoal para compartilhar pensamento técnico, experiências e experimentos reais em qualidade de software.',
    articlesIntro: 'Artigos sobre estratégia de testes, automação e engenharia de qualidade.', casesIntro: 'Experiências, problemas complexos e aprendizados registrados com cuidado.',
    labIntro: 'Aplicações reais para investigar comportamento, risco e testabilidade.', language: 'Idioma', back: 'Voltar', placeholder: 'Placeholder editorial',
  },
  en: {
    nav: { home: 'Home', about: 'About', articles: 'Articles', cases: 'Case studies', lab: 'Test Lab', admin: 'Admin' }, theme: { switchToDark: 'Switch to dark mode', switchToLight: 'Switch to light mode' },
    viewAll: 'View all', read: 'Read content', featured: 'Featured', noContent: 'There is no published content in this section yet.',
    role: 'Software Quality Engineer', tagline: 'Software quality as an engineering practice.',
    intro: 'A personal space for technical thinking, experience and real experiments in software quality.',
    articlesIntro: 'Articles about test strategy, automation and quality engineering.', casesIntro: 'Experiences, complex problems and carefully recorded lessons.',
    labIntro: 'Real applications for investigating behavior, risk and testability.', language: 'Language', back: 'Back', placeholder: 'Editorial placeholder',
  },
} as const

export function useText(locale: Locale) { return translations[locale] }
