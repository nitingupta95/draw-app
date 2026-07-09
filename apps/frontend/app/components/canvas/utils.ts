export const AVATAR_COLORS = [
  { bg: "bg-rose-500", ring: "ring-rose-300" },
  { bg: "bg-amber-500", ring: "ring-amber-300" },
  { bg: "bg-emerald-500", ring: "ring-emerald-300" },
  { bg: "bg-cyan-500", ring: "ring-cyan-300" },
  { bg: "bg-blue-500", ring: "ring-blue-300" },
  { bg: "bg-violet-500", ring: "ring-violet-300" },
  { bg: "bg-fuchsia-500", ring: "ring-fuchsia-300" },
  { bg: "bg-orange-500", ring: "ring-orange-300" },
  { bg: "bg-teal-500", ring: "ring-teal-300" },
  { bg: "bg-pink-500", ring: "ring-pink-300" },
  { bg: "bg-indigo-500", ring: "ring-indigo-300" },
  { bg: "bg-lime-600", ring: "ring-lime-300" },
  { bg: "bg-sky-500", ring: "ring-sky-300" },
  { bg: "bg-red-500", ring: "ring-red-300" },
  { bg: "bg-purple-500", ring: "ring-purple-300" },
];

export const SELF_COLOR = { bg: "bg-emerald-600", ring: "ring-emerald-300" };

export function getAvatarColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}
