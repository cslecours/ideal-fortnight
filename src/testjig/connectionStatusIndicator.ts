export default function (element: Element) {
  const indicatorElement = document.createElement("div")
  const updater = (text: string) => {
    indicatorElement.innerHTML = text
  }
  element.append(indicatorElement)

  return updater
}
