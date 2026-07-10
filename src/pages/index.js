import home from './home.js'
import bio from './bio.js'
import research from './research.js'
import projects from './projects.js'
import cv from './cv.js'
import hobbies from './hobbies.js'
import contact from './contact.js'
import { detailPages } from './detail.js'

// Top-level pages, in nav order. Card detail pages live outside this list
// (they never appear in the nav) but are routable via getPage.
export const pages = [home, bio, research, projects, cv, hobbies, contact]

export function getPage(path) {
  return (
    pages.find((p) => p.path === path) ??
    detailPages.find((p) => p.path === path) ??
    null
  )
}
