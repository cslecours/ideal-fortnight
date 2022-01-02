export default function (
  element: Element,
  data: Record<"url" | "user" | "password", string | undefined>,
  onSubmit: (data: Record<"url" | "user" | "password", string | undefined>) => void
) {
  const formElement = document.createElement("form")
  formElement.className = "authform"
  formElement.innerHTML = `
  <style>
  .authform label { display:block; }
  .authform input { margin:3px; font-size:120%;}
  </style>
  <label>XMPP : <input name="url" type="text" value="${data.url ?? ""}" /></label>
  <label>User : <input name="user" type="text" value="${data.user ?? ""}" /></label>
  <label>Pass : <input name="password" id="authForm-password" value="${data.password}" /></label>
  
  <input type="submit"  value="Set"/>`

  formElement.addEventListener("submit", (e) => {
    const formData = new FormData(e.target as HTMLFormElement)
    const result: Record<string, string | undefined> = {}
    formData.forEach((value, key) => typeof value != "object" && (result[key] = value))
    onSubmit(result)
    e.preventDefault()
  })
  element.append(formElement)
}
