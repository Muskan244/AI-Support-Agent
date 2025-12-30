<script lang="ts">
</script>

<div class="typing-wrapper">
  <div class="avatar">
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
    </svg>
  </div>
  <div class="typing-bubble">
    <div class="dot"></div>
    <div class="dot"></div>
    <div class="dot"></div>
  </div>
</div>

<style>
  .typing-wrapper {
    display: flex;
    align-items: flex-end;
    gap: 8px;
    padding: 0 16px;
    margin-bottom: 16px;
  }

  .avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #e5e7eb;
    color: #374151;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .avatar svg {
    width: 20px;
    height: 20px;
  }

  .typing-bubble {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 16px 20px;
    background: #f3f4f6;
    border-radius: 16px;
    border-bottom-left-radius: 4px;
  }

  .dot {
    width: 8px;
    height: 8px;
    background: #9ca3af;
    border-radius: 50%;
    animation: bounce 1.4s infinite ease-in-out both;
  }

  .dot:nth-child(1) {
    animation-delay: -0.32s;
  }

  .dot:nth-child(2) {
    animation-delay: -0.16s;
  }

  @keyframes bounce {
    0%, 80%, 100% {
      transform: scale(0.6);
      opacity: 0.5;
    }
    40% {
      transform: scale(1);
      opacity: 1;
    }
  }
</style>
