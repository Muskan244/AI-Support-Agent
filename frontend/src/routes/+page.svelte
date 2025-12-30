<script lang="ts">
  import ChatWidget from '$lib/components/ChatWidget.svelte';
</script>

<svelte:head>
  <title>TechStyle Support - AI Chat Assistant</title>
</svelte:head>

<main>
  <div class="page-container">
    <div class="content">
      <div class="hero-section">
        <h1>Welcome to <span class="brand">TechStyle</span></h1>
        <p class="tagline">Premium Tech Accessories & Lifestyle Products</p>
        <p class="description">
          Have questions about your order, shipping, or our products?
          Our AI assistant is here to help you 24/7!
        </p>
      </div>

      <div class="chat-section">
        <ChatWidget />
      </div>

      <footer>
        <p>
          Need human support? Email us at
          <a href="mailto:support@techstyle.com">support@techstyle.com</a>
          or call <a href="tel:1-800-TECH-STYLE">1-800-TECH-STYLE</a>
        </p>
      </footer>
    </div>
  </div>
</main>

<style>
  :global(*) {
    box-sizing: border-box;
  }

  :global(body) {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
  }

  main {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }

  .page-container {
    width: 100%;
    max-width: 1000px;
  }

  .content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 32px;
  }

  .hero-section {
    text-align: center;
    color: white;
  }

  h1 {
    font-size: 2.5rem;
    font-weight: 700;
    margin: 0 0 8px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .brand {
    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .tagline {
    font-size: 1.125rem;
    opacity: 0.9;
    margin: 0 0 16px;
  }

  .description {
    font-size: 1rem;
    opacity: 0.8;
    max-width: 500px;
    margin: 0 auto;
    line-height: 1.6;
  }

  .chat-section {
    width: 100%;
    display: flex;
    justify-content: center;
  }

  footer {
    text-align: center;
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.875rem;
  }

  footer a {
    color: white;
    text-decoration: none;
    font-weight: 500;
  }

  footer a:hover {
    text-decoration: underline;
  }

  @media (max-width: 640px) {
    h1 {
      font-size: 1.75rem;
    }

    .tagline {
      font-size: 1rem;
    }

    .description {
      font-size: 0.875rem;
    }
  }
</style>
