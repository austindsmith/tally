export async function clickButton() {
  const button = document.querySelector<HTMLElement>(".is-primary");
  if (button) {
    button.click();
    return { success: true };
  }
  return { success: false, error: "Button not found" };
}
