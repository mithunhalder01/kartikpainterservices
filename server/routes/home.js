import { createSiteContentRouter } from './siteContent.js'

const { router, adminRouter } = createSiteContentRouter('home', 'kartik-painter/home')

export { adminRouter as homeAdminRouter }
export default router
