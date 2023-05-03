export const parseFigures = (content: string) => {
  const openTag = /\[figure#(left|right|center)\]/g
  const closeTag = /\[\/figure\]/g
  let result = content?.replace(openTag, '<figure class="nt-figure--$1">')
  result = result?.replace(closeTag, '</figure>')
  return result
}

export const parseUnderlinedText = (content: string) => {
  const openTag = /__([\w]+)/g
  const closeTag = /([\w]+)__/g
  let result = content?.replace(openTag, '<ins>$1')
  result = result?.replace(closeTag, '$1</ins>')
  return result
}
