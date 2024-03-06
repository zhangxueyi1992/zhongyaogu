import defaultSettings from '@/settings'

const title = defaultSettings.title || '云调解后台管理'

export default function getPageTitle(pageTitle) {
  if (pageTitle) {
    return `${pageTitle} - ${title}`
  }
  return `${title}`
}
