<script lang="ts">
  import { marked } from 'marked';
  import type { Message } from '$lib/types';

  interface Props {
    message: Message;
  }

  let { message }: Props = $props();

  const isUser = $derived(message.sender === 'user');

  marked.setOptions({
    breaks: true,
    gfm: true,
  });

  const renderedText = $derived(
    isUser ? message.text : marked.parse(message.text) as string
  );

  function formatTime(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
</script>

<div class="message-wrapper {isUser ? 'user' : 'ai'}">
  <div class="message">
    <div class="avatar">
      {#if isUser}
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
      {:else}
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
        </svg>
      {/if}
    </div>
    <div class="content">
      <div class="bubble">
        {#if isUser}
          <p>{message.text}</p>
        {:else}
          <div class="markdown-content">{@html renderedText}</div>
        {/if}
      </div>
      <span class="timestamp">{formatTime(message.timestamp)}</span>
    </div>
  </div>
</div>

<style>
  .message-wrapper {
    display: flex;
    margin-bottom: 16px;
    padding: 0 16px;
  }

  .message-wrapper.user {
    justify-content: flex-end;
  }

  .message-wrapper.ai {
    justify-content: flex-start;
  }

  .message {
    display: flex;
    max-width: 80%;
    gap: 8px;
  }

  .message-wrapper.user .message {
    flex-direction: row-reverse;
  }

  .avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .message-wrapper.user .avatar {
    background: #4f46e5;
    color: white;
  }

  .message-wrapper.ai .avatar {
    background: #e5e7eb;
    color: #374151;
  }

  .avatar svg {
    width: 20px;
    height: 20px;
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .message-wrapper.user .content {
    align-items: flex-end;
  }

  .bubble {
    padding: 12px 16px;
    border-radius: 16px;
    word-wrap: break-word;
  }

  .message-wrapper.user .bubble {
    background: #4f46e5;
    color: white;
    border-bottom-right-radius: 4px;
  }

  .message-wrapper.ai .bubble {
    background: #f3f4f6;
    color: #1f2937;
    border-bottom-left-radius: 4px;
  }

  .bubble p {
    margin: 0;
    line-height: 1.5;
    white-space: pre-wrap;
  }

  .markdown-content {
    line-height: 1.6;
  }

  .markdown-content :global(p) {
    margin: 0 0 8px 0;
  }

  .markdown-content :global(p:last-child) {
    margin-bottom: 0;
  }

  .markdown-content :global(strong) {
    font-weight: 600;
  }

  .markdown-content :global(ul),
  .markdown-content :global(ol) {
    margin: 8px 0;
    padding-left: 20px;
  }

  .markdown-content :global(li) {
    margin: 4px 0;
  }

  .markdown-content :global(code) {
    background: rgba(0, 0, 0, 0.1);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.9em;
  }

  .markdown-content :global(pre) {
    background: rgba(0, 0, 0, 0.1);
    padding: 12px;
    border-radius: 8px;
    overflow-x: auto;
  }

  .markdown-content :global(a) {
    color: #4f46e5;
    text-decoration: underline;
  }

  .timestamp {
    font-size: 11px;
    color: #9ca3af;
    padding: 0 4px;
  }
</style>
