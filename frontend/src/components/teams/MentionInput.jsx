import React, { useState, useRef, useEffect } from "react";
import { Form, ListGroup } from "react-bootstrap";

/**
 * MentionInput - A textarea that supports @mentions
 * Props:
 *   - value: string
 *   - onChange: (value) => void
 *   - members: [{username, ...}]
 *   - placeholder: string
 *   - rows: number
 */
const MentionInput = ({ value, onChange, members = [], placeholder, rows = 3 }) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [mentionStart, setMentionStart] = useState(-1);
  const textareaRef = useRef(null);

  const handleChange = (e) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart;
    onChange(newValue);

    // Check if we're in a mention context
    const textBeforeCursor = newValue.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    if (lastAtIndex >= 0) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      // Only show suggestions if there's no space after @
      if (!textAfterAt.includes(" ") && !textAfterAt.includes("\n")) {
        const query = textAfterAt.toLowerCase();
        const filtered = members.filter((m) =>
          m.username.toLowerCase().includes(query)
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

  const handleSelectMention = (username) => {
    const beforeMention = value.substring(0, mentionStart);
    const afterMention = value.substring(
      textareaRef.current.selectionStart
    );
    const newValue = beforeMention + "@" + username + " " + afterMention;
    onChange(newValue);
    setShowSuggestions(false);

    // Focus back on textarea
    setTimeout(() => {
      if (textareaRef.current) {
        const pos = mentionStart + username.length + 2;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(pos, pos);
      }
    }, 0);
  };

  const handleKeyDown = (e) => {
    if (showSuggestions && e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowSuggestions(false);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="position-relative" onClick={(e) => e.stopPropagation()}>
      <Form.Control
        as="textarea"
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={rows}
      />
      {showSuggestions && suggestions.length > 0 && (
        <ListGroup
          className="position-absolute shadow-sm"
          style={{
            bottom: "100%",
            left: 0,
            right: 0,
            maxHeight: "150px",
            overflowY: "auto",
            zIndex: 1050,
          }}
        >
          {suggestions.slice(0, 5).map((member) => (
            <ListGroup.Item
              key={member.username}
              action
              className="py-1 px-3 d-flex align-items-center"
              onClick={() => handleSelectMention(member.username)}
              style={{ cursor: "pointer" }}
            >
              <i className="bi bi-person-circle me-2 text-muted"></i>
              <span className="fw-medium">{member.username}</span>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </div>
  );
};

/**
 * Renders text with @mentions highlighted
 */
export const renderMentionText = (text) => {
  if (!text) return null;
  const parts = text.split(/(@\w+)/g);
  return parts.map((part, i) => {
    if (part.startsWith("@")) {
      return (
        <span key={i} className="text-primary fw-semibold">
          {part}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
};

export default MentionInput;
