import { createSiteContentRouter } from './siteContent.js'

const { router, adminRouter } = createSiteContentRouter('about', 'kartik-painter/about')

export { adminRouter as aboutAdminRouter }
export default router
