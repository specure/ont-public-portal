export const LabelAfterBar = {
  id: 'label_after_bar',

  defaults: {
    font: '14px sans-serif',
  },

  afterDatasetsDraw: (chart, args, options) => {
    const barLabels = (chart.options as any).barLabels
    if (!barLabels) {
      return
    }
    const ctx = chart.ctx
    chart.data.datasets.forEach((_, index) => {
      const meta = chart.getDatasetMeta(index)
      if (!meta.hidden) {
        meta.data.forEach((segment, i) => {
          const { x, y } = segment
          const padding = 5
          ctx.save()
          ctx.textBaseline = 'middle'
          ctx.font = options.font
          ctx.fillStyle = options.color
          ctx.fillText(barLabels[i][index], x + padding, y)
          ctx.restore()
        })
      }
    })
  },
}
