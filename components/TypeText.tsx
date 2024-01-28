import { useEffect, useState, useRef } from "react";
import { Card } from "./Board";

export default function TypeText({ typeText, trigger, setTrigger }: { typeText: Card[], trigger: boolean, setTrigger: React.Dispatch<React.SetStateAction<boolean>>}) {
  const [displayText, setDisplayText] = useState("");
  const currentCharIndex = useRef(0);
  const currentWordIndex = useRef(0);
  const isDeleting = useRef(false);
  

  let typingDelay = 33;
  const deletingDelay = 50;
  const pauseAfterTypingDelay = 5000; // 8 seconds

  useEffect(() => {
    const typeWords = () => {
      const currentWord = typeText[currentWordIndex.current].text; // Use .text property
      if (isDeleting.current) {
        if (currentCharIndex.current > 0) {
          setDisplayText(currentWord.slice(0, currentCharIndex.current - 1));
          currentCharIndex.current--;
          setTimeout(typeWords, deletingDelay);
        } else {
          isDeleting.current = false;
          currentWordIndex.current = (currentWordIndex.current + 1) % typeText.length;
          setTrigger(false);
        }
      } else {
        if (currentCharIndex.current < currentWord.length) {
          setDisplayText(currentWord.slice(0, currentCharIndex.current + 1));
          currentCharIndex.current++;
          setTimeout(typeWords, typingDelay);
        } else {
          setTimeout(() => {
            isDeleting.current = true;
            typeWords();
          }, pauseAfterTypingDelay);
        }
      }
    };

    if (trigger) {
      typeWords();
    }
  }, [typeText, trigger]); // Add trigger to the dependency array

  return (
    <div>
      <p>{displayText}</p>
    </div>
  );
}