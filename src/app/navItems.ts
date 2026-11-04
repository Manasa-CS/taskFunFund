export interface NavItem {
  to: string;
  label: string;
  icon: string;
}

/** The five primary tabs, shown as a bottom bar on phones and a side rail on tablets. */
export const navItems: NavItem[] = [
  { to: "/", label: "Home", icon: "🏠" },
  { to: "/tasks", label: "Tasks", icon: "✅" },
  { to: "/pick", label: "Pick", icon: "🎲" },
  { to: "/fund", label: "My Fund", icon: "🐷" },
  { to: "/activities", label: "Activities", icon: "🎯" },
  { to: "/parent", label: "Parent", icon: "🔒" },
];
