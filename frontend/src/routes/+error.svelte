<script>
  import { page } from '$app/state';
</script>

<main class="content"><div class="empty-state">{page.status}: {page.error?.message || 'Something went wrong.'} <a href="/">Go to dashboard</a></div></main>
