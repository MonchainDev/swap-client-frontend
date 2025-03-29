type ToastType = 'success' | 'error'
export default function useShowToastMsg() {
  const classes: Record<ToastType, string> = {
    success: '!bg-[#E8FFEB]',
    error: '!bg-[#ffa4a4]'
  }

  const icons: Record<ToastType, string> = {
    success: '/toast-success.png',
    error: '/toast-error.png'
  }

  const showToastMsg = (title: string, type: ToastType, href?: string) => {
    ElNotification({
      message: () =>
        h('div', { class: `flex items-start gap-3 ${href ? '' : 'items-center'}` }, [
          h('div', { class: ' w-6' }, [h('img', { src: `${icons[type]}`, class: 'size-6' })]),
          h('div', { class: 'flex flex-col gap-2 flex-1' }, [
            h('div', { class: 'text-sm text-primary font-semibold line-clamp-3' }, title),
            href
              ? h('span', { class: 'text-sm text-primary flex gap-1' }, [
                  h('span', {}, 'View on'),
                  h('a', { class: 'underline cursor-pointer', href: `${href}`, target: '_blank' }, 'Mon explorer')
                ])
              : ''
          ])
        ]),
      duration: 5000,
      customClass: `toast-message ${classes[type || 'success']}`,
      showClose: true,
      offset: 30
    })
  }

  return { showToastMsg }
}
