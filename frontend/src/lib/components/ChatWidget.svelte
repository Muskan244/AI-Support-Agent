<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { api } from '$lib/api';
  import { messages, sessionId, isLoading, errorMessage } from '$lib/store';
  import type { Message } from '$lib/types';
  import ChatMessage from './ChatMessage.svelte';
  import ChatInput from './ChatInput.svelte';
  import TypingIndicator from './TypingIndicator.svelte';

  let messagesContainer: HTMLDivElement;
  let currentMessages: Message[] = [];
  let currentSessionId: string | null = null;
  let loading = false;
  let error: string | null = null;
  let showScrollButton = false;

  messages.subscribe(value => currentMessages = value);
  sessionId.subscribe(value => currentSessionId = value);
  isLoading.subscribe(value => loading = value);
  errorMessage.subscribe(value => error = value);

  function handleScroll() {
    if (messagesContainer) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainer;
      showScrollButton = scrollHeight - scrollTop - clientHeight > 100;
    }
  }

  async function scrollToBottom() {
    await tick();
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  async function loadHistory() {
    if (!currentSessionId) return;

    try {
      const history = await api.getHistory(currentSessionId);
      messages.set(history.messages);
      await scrollToBottom();
    } catch (err) {
      console.log('Could not load history, starting fresh');
      sessionId.clear();
      messages.clear();
    }
  }

  async function handleSendMessage(text: string) {
    if (loading) return;

    isLoading.set(true);
    errorMessage.set(null);

    const userMessage: Message = {
      id: crypto.randomUUID(),
      conversationId: currentSessionId || '',
      sender: 'user',
      text,
      timestamp: new Date().toISOString()
    };

    messages.addMessage(userMessage);
    await scrollToBottom();

    try {
      const response = await api.sendMessage(text, currentSessionId || undefined);

      if (!currentSessionId) {
        sessionId.set(response.sessionId);
      }

      const aiMessage: Message = {
        id: crypto.randomUUID(),
        conversationId: response.sessionId,
        sender: 'ai',
        text: response.reply,
        timestamp: new Date().toISOString()
      };

      messages.addMessage(aiMessage);
      await scrollToBottom();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to send message';
      errorMessage.set(errorMsg);

      const errorResponse: Message = {
        id: crypto.randomUUID(),
        conversationId: currentSessionId || '',
        sender: 'ai',
        text: `Sorry, I encountered an error: ${errorMsg}. Please try again.`,
        timestamp: new Date().toISOString()
      };

      messages.addMessage(errorResponse);
      await scrollToBottom();
    } finally {
      isLoading.set(false);
    }
  }

  function handleNewChat() {
    sessionId.clear();
    messages.clear();
    errorMessage.set(null);
  }

  onMount(() => {
    if (currentSessionId) {
      loadHistory();
    }
  });
</script>

<div class="chat-widget">
  <header class="chat-header">
    <div class="header-info">
      <div class="logo">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
        </svg>
      </div>
      <div class="title">
        <h1>TechStyle Support</h1>
        <span class="status">
          <span class="status-dot"></span>
          Online
        </span>
      </div>
    </div>
    <button class="new-chat-btn" onclick={handleNewChat} title="Start new conversation">
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
      </svg>
    </button>
  </header>

  <div class="messages-container" bind:this={messagesContainer}>
    {#if currentMessages.length === 0}
      <div class="welcome-message">
        <div class="welcome-icon">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
          </svg>
        </div>
        <h2>Welcome to TechStyle Support!</h2>
        <p>Hi there! I'm your AI assistant. I can help you with:</p>
        <ul>
          <li>Shipping & delivery questions</li>
          <li>Returns & refunds</li>
          <li>Product information</li>
          <li>Order issues</li>
        </ul>
        <p class="cta">How can I help you today?</p>
      </div>
    {:else}
      {#each currentMessages as message (message.id)}
        <ChatMessage {message} />
      {/each}
    {/if}

    {#if loading}
      <TypingIndicator />
    {/if}
  </div>

  {#if error}
    <div class="error-banner">
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
      </svg>
      <span>{error}</span>
      <button onclick={() => errorMessage.set(null)}>Dismiss</button>
    </div>
  {/if}

  <ChatInput onSend={handleSendMessage} disabled={loading} />
</div>

<style>
  .chat-widget {
    display: flex;
    flex-direction: column;
    height: 100%;
    max-height: 700px;
    width: 100%;
    max-width: 450px;
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    overflow: hidden;
  }

  .chat-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
    color: white;
  }

  .header-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .logo {
    width: 40px;
    height: 40px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .logo svg {
    width: 24px;
    height: 24px;
  }

  .title h1 {
    font-size: 16px;
    font-weight: 600;
    margin: 0;
  }

  .status {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    opacity: 0.9;
  }

  .status-dot {
    width: 8px;
    height: 8px;
    background: #22c55e;
    border-radius: 50%;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .new-chat-btn {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    border: none;
    background: rgba(255, 255, 255, 0.2);
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
  }

  .new-chat-btn:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  .new-chat-btn svg {
    width: 20px;
    height: 20px;
  }

  .messages-container {
    flex: 1;
    overflow-y: auto;
    padding: 16px 0;
    scroll-behavior: smooth;
  }

  .welcome-message {
    padding: 24px;
    text-align: center;
    color: #4b5563;
  }

  .welcome-icon {
    width: 64px;
    height: 64px;
    margin: 0 auto 16px;
    background: #f3f4f6;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #4f46e5;
  }

  .welcome-icon svg {
    width: 32px;
    height: 32px;
  }

  .welcome-message h2 {
    font-size: 18px;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 12px;
  }

  .welcome-message p {
    margin: 0 0 12px;
    font-size: 14px;
  }

  .welcome-message ul {
    list-style: none;
    padding: 0;
    margin: 0 0 16px;
    text-align: left;
    display: inline-block;
  }

  .welcome-message li {
    padding: 6px 0;
    padding-left: 24px;
    position: relative;
    font-size: 14px;
  }

  .welcome-message li::before {
    content: '✓';
    position: absolute;
    left: 0;
    color: #4f46e5;
    font-weight: bold;
  }

  .welcome-message .cta {
    font-weight: 500;
    color: #4f46e5;
    margin-top: 16px;
  }

  .error-banner {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: #fef2f2;
    border-top: 1px solid #fecaca;
    color: #991b1b;
    font-size: 13px;
  }

  .error-banner svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }

  .error-banner span {
    flex: 1;
  }

  .error-banner button {
    padding: 4px 8px;
    border: none;
    background: none;
    color: #991b1b;
    font-weight: 500;
    cursor: pointer;
    font-size: 12px;
  }

  .error-banner button:hover {
    text-decoration: underline;
  }
</style>
