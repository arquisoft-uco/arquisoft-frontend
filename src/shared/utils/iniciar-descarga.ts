export function iniciarDescarga(url: string): void {
  const ancla = document.createElement('a');
  ancla.href = url;
  ancla.rel = 'noopener';
  document.body.appendChild(ancla);
  ancla.click();
  document.body.removeChild(ancla);
}
