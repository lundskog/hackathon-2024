
import { shuffle, chunkArray } from "./lib/utils";
let whiteCards = shuffle(["a", "b", "c", "d", "e", "f", "g", "h", "i"])


let nPlayers = 2

// Example usage:
const chunkSize = Math.floor(whiteCards.length / nPlayers);
console.log(chunkSize)

const chunkedArray = chunkArray(whiteCards, chunkSize);

console.log(chunkedArray);