import { defineConnection } from "@grok/agent-sdk/connections";

const mailWrites = [
  "create_draft",
  "update_draft",
  "delete_draft",
  "send_email",
  "send_draft",
  "forward",
  "update_email_labels",
  "trash_email",
  "untrash_email",
  "mark_email_spam",
  "unmark_email_spam",
  "create_label",
  "update_label",
  "delete_label",
  "apply_sensitive_message_label",
  "apply_sensitive_thread_label",
];

// Read job mail only. Sending and mailbox changes stay off the tool list.
export default defineConnection({
  cursorAccount: true,
  servers: ["Gmail"],
  advertiseTools: true,
  optional: true,
  disallowedTools: mailWrites,
});
