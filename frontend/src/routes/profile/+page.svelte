<script>
  import { getContext } from 'svelte';
  import Profile from '$lib/pages/Profile.svelte';
  const notify = getContext('notify');
</script>

<main class="content"><Profile {notify} /></main>
