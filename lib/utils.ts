import { PlayerWhiteCards } from "@/server/socketServer";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn (...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function capitalize (str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function randomString (length: number): string {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export function randomNumbers (length: number): string {
  const characters =
    "0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export enum Day {
  None = 0,
  Monday = 1 << 0, // 1
  Tuesday = 1 << 1, // 2
  Wednesday = 1 << 2, // 4
  Thursday = 1 << 3, // 8
  Friday = 1 << 4, // 16
  Saturday = 1 << 5, // 32
  Sunday = 1 << 6, // 64
  Weekdays = Monday | Tuesday | Wednesday | Thursday | Friday, // 31
  Weekends = Saturday | Sunday, // 96
}


export function shuffle (array: string[]) {
  let currentIndex = array.length, randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex > 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

export function chunkArray (array: string[], chunkSize: number) {
  const result = [];
  const length = array.length;

  for (let i = 0; i < length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize));
  }

  return result;
}

export function shufflePlayerData(playerData: PlayerWhiteCards): PlayerWhiteCards {
    // Convert object keys (or key-value pairs) into an array
    const entries = Object.entries(playerData);

    // Shuffle the array using the Fisher-Yates (Durstenfeld) algorithm
    for (let i = entries.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [entries[i], entries[j]] = [entries[j], entries[i]];
    }

    // Reconstruct the object from the shuffled array
    return Object.fromEntries(entries) as PlayerWhiteCards;
}