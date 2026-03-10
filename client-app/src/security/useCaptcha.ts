export async function executeCaptcha() {
  if (!window.grecaptcha) return null

  return await window.grecaptcha.execute()
}
