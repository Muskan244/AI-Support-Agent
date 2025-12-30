<script lang="ts">
  interface Props {
    onSend: (message: string) => void;
    disabled?: boolean;
  }

  let { onSend, disabled = false }: Props = $props();

  let inputValue = $state('');
  let inputElement: HTMLTextAreaElement;

  const MAX_LENGTH = 2000;
  const charCount = $derived(inputValue.length);
  const isOverLimit = $derived(charCount > MAX_LENGTH);
  const canSend = $derived(inputValue.trim().length > 0 && !disabled && !isOverLimit);

  function handleSubmit() {
    if (!canSend) return;

    const message = inputValue.trim();
    inputValue = '';
    onSend(message);
    if (inputElement) {
      inputElement.style.height = 'auto';
    }
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  }

  function handleInput() {
    if (inputElement) {
      inputElement.style.height = 'auto';
      inputElement.style.height = Math.min(inputElement.scrollHeight, 150) + 'px';
    }
  }
</script>

<div class="input-container">
  <div class="input-wrapper" class:disabled>
    <textarea
      bind:this={inputElement}
      bind:value={inputValue}
      onkeydown={handleKeyDown}
      oninput={handleInput}
      placeholder="Type your message..."
      disabled={disabled}
      rows="1"
      maxlength={MAX_LENGTH + 100}
    ></textarea>

    <button
      onclick={handleSubmit}
      disabled={!canSend}
      class="send-button"
      aria-label="Send message"
    >
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
      </svg>
    </button>
  </div>

  <div class="input-footer">
    <span class="char-count" class:over-limit={isOverLimit}>
      {charCount}/{MAX_LENGTH}
    </span>
    <span class="hint">Press Enter to send, Shift+Enter for new line</span>
  </div>
</div>

<style>
  .input-container {
    padding: 16px;
    border-top: 1px solid #e5e7eb;
    background: white;
  }

  .input-wrapper {
    display: flex;
    align-items: flex-end;
    gap: 8px;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 8px 12px;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .input-wrapper:focus-within {
    border-color: #4f46e5;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  }

  .input-wrapper.disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  textarea {
    flex: 1;
    border: none;
    background: transparent;
    resize: none;
    font-size: 14px;
    line-height: 1.5;
    padding: 4px 0;
    min-height: 24px;
    max-height: 150px;
    font-family: inherit;
  }

  textarea:focus {
    outline: none;
  }

  textarea:disabled {
    cursor: not-allowed;
  }

  textarea::placeholder {
    color: #9ca3af;
  }

  .send-button {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: none;
    background: #4f46e5;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s, transform 0.1s;
    flex-shrink: 0;
  }

  .send-button:hover:not(:disabled) {
    background: #4338ca;
  }

  .send-button:active:not(:disabled) {
    transform: scale(0.95);
  }

  .send-button:disabled {
    background: #d1d5db;
    cursor: not-allowed;
  }

  .send-button svg {
    width: 18px;
    height: 18px;
  }

  .input-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 8px;
    padding: 0 4px;
    font-size: 11px;
    color: #9ca3af;
  }

  .char-count {
    font-variant-numeric: tabular-nums;
  }

  .char-count.over-limit {
    color: #ef4444;
    font-weight: 500;
  }

  .hint {
    opacity: 0.8;
  }
</style>
