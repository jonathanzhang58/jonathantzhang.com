export function gridSVG() {
  return `
  <svg class="grid-lines" viewBox="0 0 1440 900" preserveAspectRatio="none" fill="none" aria-hidden="true">
    <line class="grid-line" x1="-80" y1="700" x2="760" y2="-140" stroke="var(--line)"/>
    <line class="grid-line" x1="240" y1="1030" x2="1220" y2="-100" stroke="var(--line)"/>
    <line class="grid-line" x1="840" y1="1060" x2="1600" y2="200" stroke="var(--line)"/>
    <line class="grid-line" x1="570" y1="-130" x2="1580" y2="930" stroke="var(--line)"/>
    <line class="grid-line" x1="80" y1="-100" x2="950" y2="1030" stroke="var(--line)"/>
    <line class="grid-line grid-accent" x1="1110" y1="1060" x2="1690" y2="400" stroke="var(--hl-2)" stroke-width="2"/>
  </svg>`
}

export function emphasisSVG() {
  return `
  <svg class="emph" viewBox="0 0 64 58" fill="none" aria-hidden="true">
    <g stroke="var(--hl-1)" stroke-width="3">
      <line class="emph-line" x1="8" y1="50" x2="24" y2="34"/>
      <line class="emph-line" x1="22" y1="12" x2="29" y2="30"/>
      <line class="emph-line" x1="46" y1="6" x2="47" y2="26"/>
    </g>
  </svg>`
}

export function starSVG() {
  return `
  <svg class="star4" viewBox="0 0 46 46" aria-hidden="true">
    <path fill="var(--hl-3)" d="M23 0 L26 20 L46 23 L26 26 L23 46 L20 26 L0 23 L20 20 Z"/>
  </svg>`
}
