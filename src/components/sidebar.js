export function renderSidebar(el) {
  el.innerHTML = `
    <div class="sidebar-face" aria-hidden="true">
      <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="3">
        <circle cx="50" cy="50" r="46"/>
        <circle cx="38" cy="42" r="2.5" fill="currentColor"/>
        <circle cx="62" cy="42" r="2.5" fill="currentColor"/>
        <path d="M36 60 Q50 72 64 60"/>
      </svg>
    </div>
    <p class="sidebar-name">Your <br>Name</p>
    <p class="sidebar-affil u-label">PhD Student &mdash; Placeholder University</p>
    <p class="sidebar-splash">A one-or-two sentence mission statement lives here.</p>`
}
