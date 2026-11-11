<script>
    import { page } from '$app/state';

    let { children } = $props();

    const tabs = [
      ['/admin', 'Dashboard'],
      ['/admin/assigned', 'Assigned Tickets'],
      ['/admin/completed', 'Completed Tickets']  
    ];

    function isActive(href) {
        return href === '/admin'
        ? page.url.pathname === href
        : page.url.pathname.startsWith(href);
    }
</script>

<header class="topbar">
    <div class="row">
        <a class="brand" href="/admin">CampusFix</a>

        <div class="topbar-right">
            <span class="pill-role">Administrator</span>
            <a
                class="avatar"
                href="/admin/profile"
                aria-label="Open administrator profile"
            >   
                JD
            </a>
        </div>
    </div>
</header>

<nav class="tabbar" aria-label="Administrator Navigation">
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
