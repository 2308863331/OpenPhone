import { ref, reactive } from 'vue'

export function useDrag() {
  const draggingUid = ref(null)
  
  const context = reactive({
    active: false,
    target: null,
    startX: 0,
    startY: 0,
    origX: 0,
    origY: 0,
    timer: null
  })

  const initiateDrag = (event, item) => {
    const clientX = event.type === 'touchstart' ? event.touches[0].clientX : event.clientX
    const clientY = event.type === 'touchstart' ? event.touches[0].clientY : event.clientY

    context.timer = setTimeout(() => {
      context.active = true
      draggingUid.value = item.uid
      context.startX = clientX
      context.startY = clientY
      context.origX = item.dragOffsetX || 0
      context.origY = item.dragOffsetY || 0
      context.target = item
    }, 280)

    const onMove = (moveEvent) => {
      if (!context.active) return
      const mx = moveEvent.type === 'touchmove' ? moveEvent.touches[0].clientX : moveEvent.clientX
      const my = moveEvent.type === 'touchmove' ? moveEvent.touches[0].clientY : moveEvent.clientY
      if (context.target) {
        context.target.dragOffsetX = context.origX + (mx - context.startX)
        context.target.dragOffsetY = context.origY + (my - context.startY)
      }
    }

    const onEnd = () => {
      clearTimeout(context.timer)
      if (context.active) {
        setTimeout(() => {
          draggingUid.value = null
          context.active = false
          context.target = null
        }, 120)
      }
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onEnd)
      document.removeEventListener('touchmove', onMove)
      document.removeEventListener('touchend', onEnd)
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onEnd)
    document.addEventListener('touchmove', onMove, { passive: false })
    document.addEventListener('touchend', onEnd)
  }

  const isDragging = () => context.active

  return { draggingUid, initiateDrag, isDragging }
}
