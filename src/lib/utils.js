import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export async function logout() {
  await fetch('/api/logout', {
    method: 'POST',
    credentials: 'include', // important to include cookies in request
  });

  // Redirect or update UI after logout
  window.location.href = '/login';
}
