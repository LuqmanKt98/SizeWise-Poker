import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getInitials(name: string) {
  if (!name) return "";
  const names = name.trim().split(' ');
  if (names.length === 1) {
    return names[0].charAt(0).toUpperCase();
  }
  const firstName = names[0];
  const lastName = names[names.length - 1];
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function generateRoomId() {
  const letters = 'ABCDEFGHIJKLMNPQRSTUVWXYZ';
  const numbers = '0123456789';
  
  let letterPart = '';
  for (let i = 0; i < 3; i++) {
    letterPart += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  
  let numberPart = '';
  for (let i = 0; i < 3; i++) {
    numberPart += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }
  
  return `${letterPart}-${numberPart}`;
}
