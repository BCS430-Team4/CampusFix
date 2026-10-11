<script>
    import { page } from '$app/state';

    let { children } = $props();

    const tabs = [
      ['/technician', 'Dashboard'],
      ['/technician/assigned', 'Assigned Tickets'],
      ['/technician/completed', 'Completed Tickets']  
    ];

    function isActive(href) {
        return href === '/technician'
        ? page.url.pathname === href
        : page.url.pathname.startsWith(href);
    }
</script>

<header class="topbar">
    <div class="row">
        <a class="brand" href="/technician">CampusFix</a>

        <div class="topbar-right">
            <span class="pill-role">Technician</span>
            <a
                class="avatar"
                href="/technician/profile"
                aria-label="Open technician profile"
            >   
                JD
            </a>
        </div>
    </div>
</header>

<nav class="tabbar" aria-label="Technician Navigation">
    {#each tabs as [href, label]}
        <a
            class="tab"
            class:active={isActive(href)}
            aria-current={isActive(href) ? 'page' : undefined}
            {href}
        >   
            {label}
        </a>
    {/each}
</nav>

{@render children()}
