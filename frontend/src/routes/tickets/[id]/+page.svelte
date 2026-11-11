<script>
  import { getContext } from 'svelte';
  import { page } from '$app/state';
  import Ticket from '$lib/pages/Ticket.svelte';
  const notify = getContext('notify');
</script>

<Ticket id={page.params.id} justSubmitted={page.url.searchParams.has('justSubmitted')} {notify} />
