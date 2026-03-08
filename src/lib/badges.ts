import {
  siJavascript, siTypescript, siPython, siCplusplus, siDotnet, siDelphi,
  siGo, siRust, siPhp, siRuby, siSwift, siKotlin, siDart, siLua, siScala,
  siReact, siVuedotjs, siAngular, siNextdotjs, siNuxt, siSvelte, siAstro, siRemix,
  siNodedotjs, siDjango, siFastapi, siSpring, siLaravel, siNestjs, siFlask,
  siDocker, siKubernetes, siPostgresql, siMongodb, siRedis, siGraphql, siGit,
  siTailwindcss, siLinux, siApple,
} from 'simple-icons'
import type { SimpleIcon } from 'simple-icons'

export interface BadgeDefinition {
  id: string
  name: string
  color: string
  path: string
  category: 'language' | 'framework' | 'backend' | 'tool'
}

function b(
  id: string,
  icon: SimpleIcon,
  name: string,
  category: BadgeDefinition['category'],
): BadgeDefinition {
  return { id, name, color: `#${icon.hex}`, path: icon.path, category }
}

function custom(
  id: string,
  name: string,
  color: string,
  path: string,
  category: BadgeDefinition['category'],
): BadgeDefinition {
  return { id, name, color, path, category }
}

// Paths para ícones não disponíveis no simple-icons
const JAVA_PATH =
  'M8.851 18.56s-.917.534.653.714c1.902.218 2.874.187 4.969-.211 0 0 .552.346 1.321.646-4.699 2.013-10.633-.118-6.943-1.149M8.276 15.933s-1.028.761.542.924c2.032.209 3.636.227 6.413-.308 0 0 .384.389.987.602-5.679 1.661-12.007.13-7.942-1.218M13.116 11.475c1.158 1.333-.304 2.533-.304 2.533s2.939-1.518 1.589-3.418c-1.261-1.772-2.228-2.652 3.007-5.688 0 0-8.216 2.051-4.292 6.573M19.33 20.504s.679.559-.747.991c-2.712.822-11.288 1.069-13.669.033-.856-.373.75-.89 1.254-.998.527-.114.828-.093.828-.093-.953-.671-6.156 1.317-2.643 1.887 9.58 1.553 17.462-.7 14.977-1.82M9.292 13.21s-4.362 1.036-1.544 1.412c1.189.159 3.561.123 5.77-.062 1.806-.152 3.618-.476 3.618-.476s-.637.272-1.098.587c-4.429 1.165-12.986.623-10.522-.568 2.082-1.006 3.776-.893 3.776-.893M17.116 17.584c4.503-2.34 2.421-4.589.968-4.285-.355.074-.515.138-.515.138s.132-.207.385-.297c2.875-1.011 5.086 2.981-.928 4.562 0-.001.07-.062.09-.118M14.401 0s2.494 2.494-2.365 6.33c-3.896 3.077-.888 4.832-.001 6.836-2.274-2.053-3.943-3.858-2.824-5.539 1.644-2.469 6.197-3.665 5.19-7.627M9.734 23.924c4.322.277 10.959-.153 11.116-2.19 0 0-.302.775-3.572 1.391-3.688.694-8.239.613-10.937.168 0-.001.553.457 3.393.631'

const WINDOWS_PATH =
  'M0 3.612L9.896 2.3v9.534H0zM10.903 2.15L24 0v11.725H10.903zM0 12.287h9.896v9.534L0 20.51zM10.903 12.375H24V24L10.903 22.05z'

export const BADGES: BadgeDefinition[] = [
  // Linguagens
  b('javascript', siJavascript, 'JavaScript', 'language'),
  b('typescript', siTypescript, 'TypeScript', 'language'),
  b('python',     siPython,     'Python',     'language'),
  custom('java',  'Java',       '#007396',    JAVA_PATH,    'language'),
  b('cplusplus',  siCplusplus,  'C++',        'language'),
  b('dotnet',     siDotnet,     '.NET / C#',  'language'),
  b('delphi',     siDelphi,     'Delphi',     'language'),
  b('go',         siGo,         'Go',         'language'),
  b('rust',       siRust,       'Rust',       'language'),
  b('php',        siPhp,        'PHP',        'language'),
  b('ruby',       siRuby,       'Ruby',       'language'),
  b('swift',      siSwift,      'Swift',      'language'),
  b('kotlin',     siKotlin,     'Kotlin',     'language'),
  b('dart',       siDart,       'Dart',       'language'),
  b('lua',        siLua,        'Lua',        'language'),
  b('scala',      siScala,      'Scala',      'language'),

  // Frameworks front-end
  b('react',   siReact,    'React',   'framework'),
  b('vue',     siVuedotjs, 'Vue.js',  'framework'),
  b('angular', siAngular,  'Angular', 'framework'),
  b('nextjs',  siNextdotjs,'Next.js', 'framework'),
  b('nuxt',    siNuxt,     'Nuxt',    'framework'),
  b('svelte',  siSvelte,   'Svelte',  'framework'),
  b('astro',   siAstro,    'Astro',   'framework'),
  b('remix',   siRemix,    'Remix',   'framework'),

  // Backend
  b('nodejs',  siNodedotjs, 'Node.js', 'backend'),
  b('django',  siDjango,    'Django',  'backend'),
  b('fastapi', siFastapi,   'FastAPI', 'backend'),
  b('spring',  siSpring,    'Spring',  'backend'),
  b('laravel', siLaravel,   'Laravel', 'backend'),
  b('nestjs',  siNestjs,    'NestJS',  'backend'),
  b('flask',   siFlask,     'Flask',   'backend'),

  // Ferramentas & infra
  b('docker',      siDocker,     'Docker',     'tool'),
  b('kubernetes',  siKubernetes, 'Kubernetes', 'tool'),
  b('postgresql',  siPostgresql, 'PostgreSQL', 'tool'),
  b('mongodb',     siMongodb,    'MongoDB',    'tool'),
  b('redis',       siRedis,      'Redis',      'tool'),
  b('graphql',     siGraphql,    'GraphQL',    'tool'),
  b('git',         siGit,        'Git',        'tool'),
  b('tailwind',    siTailwindcss,'Tailwind',   'tool'),
  b('linux',       siLinux,      'Linux',      'tool'),
  custom('windows','Windows',    '#0078D4',    WINDOWS_PATH, 'tool'),
  b('macos',       siApple,      'macOS',      'tool'),
]

export const BADGES_BY_ID: Record<string, BadgeDefinition> =
  Object.fromEntries(BADGES.map((badge) => [badge.id, badge]))

export const BADGE_CATEGORIES = [
  { id: 'language'  as const, label: 'Linguagens'  },
  { id: 'framework' as const, label: 'Frameworks'  },
  { id: 'backend'   as const, label: 'Backend'     },
  { id: 'tool'      as const, label: 'Ferramentas' },
]
