export interface Avatar {
  id: string
  emoji: string
  label: string
}

/** The bundled set of animal avatars kids can pick for their profile. */
export const avatars: Avatar[] = [
  { id: 'fox', emoji: '🦊', label: 'Fox' },
  { id: 'owl', emoji: '🦉', label: 'Owl' },
  { id: 'panda', emoji: '🐼', label: 'Panda' },
  { id: 'lion', emoji: '🦁', label: 'Lion' },
  { id: 'rabbit', emoji: '🐰', label: 'Rabbit' },
  { id: 'bear', emoji: '🐻', label: 'Bear' },
  { id: 'koala', emoji: '🐨', label: 'Koala' },
  { id: 'tiger', emoji: '🐯', label: 'Tiger' },
  { id: 'elephant', emoji: '🐘', label: 'Elephant' },
  { id: 'penguin', emoji: '🐧', label: 'Penguin' },
  { id: 'frog', emoji: '🐸', label: 'Frog' },
  { id: 'cat', emoji: '🐱', label: 'Cat' },
]

export function avatarEmoji(id: string): string {
  return avatars.find((a) => a.id === id)?.emoji ?? '🦊'
}

export interface KidColor {
  id: string
  label: string
  bg: string
  text: string
}

/** The theme color choices offered for a kid's profile, drawn from the app palette. */
export const kidColors: KidColor[] = [
  { id: 'sunny', label: 'Sunny', bg: 'bg-sunny-300', text: 'text-sunny-600' },
  { id: 'sky', label: 'Sky', bg: 'bg-sky-300', text: 'text-sky-600' },
  { id: 'mint', label: 'Mint', bg: 'bg-mint-300', text: 'text-mint-600' },
  { id: 'coral', label: 'Coral', bg: 'bg-coral-300', text: 'text-coral-600' },
  { id: 'grape', label: 'Grape', bg: 'bg-grape-300', text: 'text-grape-600' },
]

export function kidColor(id: string): KidColor {
  return kidColors.find((c) => c.id === id) ?? kidColors[0]
}
