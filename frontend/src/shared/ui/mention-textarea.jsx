import { useEffect, useRef, useState } from "react";
import { UserRound } from "lucide-react";
import { Textarea } from "@/shared/ui/textarea";
import { cn } from "@/shared/lib/utils";

/**
 * Textarea with an @mention suggestion list.
 *
 * The component owns only interaction state. The value and the member list are
 * supplied by the feature that uses it, which keeps it reusable across task
 * actions and team panels.
 */
export default function MentionTextarea({
  value,
  onChange,
  members = [],
  placeholder,
  rows = 3,
  id,
  name,
  className,
}) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [mentionStart, setMentionStart] = useState(-1);
  const [activeIndex, setActiveIndex] = useState(0);
  const textareaRef = useRef(null);
  const wrapperRef = useRef(null);

  const handleChange = (event) => {
    const newValue = event.target.value;
    const cursorPos = event.target.selectionStart;
    onChange(newValue);
    setActiveIndex(0);

    const textBeforeCursor = newValue.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    if (lastAtIndex >= 0) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      if (!textAfterAt.includes(" ") && !textAfterAt.includes("\n")) {
        const query = textAfterAt.toLowerCase();
        const filtered = members.filter((member) =>
          member.username.toLowerCase().includes(query),
        );
        if (filtered.length > 0) {
          setSuggestions(filtered);
          setMentionStart(lastAtIndex);
          setShowSuggestions(true);
          return;
        }
      }
    }

    setShowSuggestions(false);
  };

  const selectMention = (username) => {
    const beforeMention = value.substring(0, mentionStart);
    const afterMention = value.substring(textareaRef.current?.selectionStart ?? value.length);
    const newValue = `${beforeMention}@${username} ${afterMention}`;
    onChange(newValue);
    setShowSuggestions(false);

    window.setTimeout(() => {
      if (textareaRef.current) {
        const position = mentionStart + username.length + 2;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(position, position);
      }
    }, 0);
  };

  const handleKeyDown = (event) => {
    if (!showSuggestions || suggestions.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % Math.min(suggestions.length, 5));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) =>
        index === 0 ? Math.min(suggestions.length, 5) - 1 : index - 1,
      );
    } else if (event.key === "Enter") {
      const member = suggestions[activeIndex];
      if (member) {
        event.preventDefault();
        selectMention(member.username);
      }
    } else if (event.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      <Textarea
        ref={textareaRef}
        id={id}
        name={name}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={rows}
        aria-autocomplete="list"
        aria-expanded={showSuggestions}
        aria-controls={showSuggestions ? "mention-suggestions" : undefined}
      />
      {showSuggestions && suggestions.length > 0 ? (
        <ul
          id="mention-suggestions"
          role="listbox"
          className="absolute bottom-full left-0 right-0 z-40 mb-1 max-h-44 overflow-y-auto rounded-md border border-border bg-popover p-1 shadow-overlay"
        >
          {suggestions.slice(0, 5).map((member, index) => (
            <li
              key={member.username}
              role="option"
              aria-selected={index === activeIndex}
              onMouseDown={(event) => {
                event.preventDefault();
                selectMention(member.username);
              }}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-sm px-2.5 py-2 text-sm transition-colors",
                index === activeIndex
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <UserRound size={14} aria-hidden="true" />
              <span className="font-medium">{member.username}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function MentionText({ text }) {
  if (!text) return null;

  return String(text)
    .split(/(@\w+)/g)
    .map((part, index) =>
      part.startsWith("@") ? (
        <span key={index} className="font-medium text-brand">
          {part}
        </span>
      ) : (
        <span key={index}>{part}</span>
      ),
    );
}
