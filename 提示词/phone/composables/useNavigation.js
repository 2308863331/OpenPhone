import { ref, computed } from 'vue'

const PAGE_ORDER = ['desktop', 'chatlist', 'chatdetail', 'moments']

export function useNavigation() {
  const activePage = ref('desktop')
  const previousPage = ref('desktop')
  const pageTransitionName = ref('slide-in-right')

  const navigateTo = (targetPage) => {
    previousPage.value = activePage.value
    const fromIdx = PAGE_ORDER.indexOf(activePage.value)
    const toIdx = PAGE_ORDER.indexOf(targetPage)
    
    pageTransitionName.value = toIdx > fromIdx ? 'slide-in-right' : 'slide-in-left'
    activePage.value = targetPage
  }

  const goBack = () => {
    navigateTo(previousPage.value === 'chatdetail' ? 'chatlist' : 'desktop')
  }

  return {
    activePage,
    previousPage,
    pageTransitionName,
    navigateTo,
    goBack
  }
}
