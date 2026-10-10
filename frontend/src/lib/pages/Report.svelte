<script>
  import { goto } from '$app/navigation';
  import { CampusFixAPI } from '../api.js';
  import { BUILDINGS, CATEGORIES } from '../shared.js';
  import Topbar from '../components/Topbar.svelte';
  import Icon from '../components/Icon.svelte';
  let category = $state('');
  let title = $state('');
  let description = $state('');
  let building = $state('');
  let room = $state('');
  let photoCount = $state(0);
  let errors = $state({ category: false, title: false });

  function submit(event) {
    event.preventDefault();
    errors = { category: !category, title: !title.trim() };
    if (errors.category || errors.title) return;
    const ticket = CampusFixAPI.addTicket({ title: title.trim(), description: description.trim(), category, building, room });
    goto('/tickets/' + encodeURIComponent(ticket.id) + '?justSubmitted=1');
  }
</script>

<Topbar title="Report an issue" />
<main class="content">
  <form onsubmit={submit} novalidate>
    <fieldset class="category-field"><legend class="field-label">Category</legend>
      <div class="cat-grid">
        {#each CATEGORIES as item}
          <button type="button" class="cat-btn" class:selected={category === item.label} aria-pressed={category === item.label} onclick={() => { category = item.label; errors.category = false; }}>
            <Icon name={item.icon} size={22} /><span>{item.label}</span>
          </button>
        {/each}
      </div>
      {#if errors.category}<div class="field-error" role="alert">Select a category first.</div>{/if}
    </fieldset>
    <div class="field-block">
      <label class="field-label" for="report-title">Title</label>
      <input id="report-title" type="text" placeholder="ex: Flickering lights in lab" bind:value={title} aria-invalid={errors.title} />
      {#if errors.title}<div class="field-error" role="alert">Enter a short title.</div>{/if}
    </div>
    <div class="field-block">
      <label class="field-label" for="report-description">Description</label>
      <textarea id="report-description" rows="3" placeholder="Describe what's wrong and where exactly to find it" bind:value={description}></textarea>
    </div>
    <div class="location-fields">
      <div><label class="field-label" for="report-building">Building</label><select id="report-building" bind:value={building}><option value="">Select a building</option>{#each BUILDINGS as name}<option>{name}</option>{/each}</select></div>
      <div><label class="field-label" for="report-room">Room / location</label><input id="report-room" type="text" placeholder="ex: Room 204" bind:value={room} /></div>
    </div>
    <label class="field-label" for="report-photos">Photos (optional)</label>
    <label class="dropzone" for="report-photos">
      <Icon name="camera" size={24} />
      <span class="secondary-text" style="font-size:13px;">{photoCount ? photoCount + ' photo' + (photoCount > 1 ? 's' : '') + ' selected' : 'Add photos to help the technician'}</span>
      <input id="report-photos" type="file" accept="image/*" multiple onchange={event => photoCount = event.currentTarget.files.length} />
    </label>
    <button class="btn-primary" style="margin-top:20px;" type="submit">Submit report</button>
  </form>
</main>


