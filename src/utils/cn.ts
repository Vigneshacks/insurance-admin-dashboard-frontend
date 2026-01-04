export default function cn(...classNames: (string|undefined)[]) {
  return classNames.filter(Boolean).join(" ");
}

// cn("h-screen", "w-screen", "flex", "items-center", "justify-center");
// Output: 'h-screen w-screen flex items-center justify-center'