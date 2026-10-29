// Apply only to the reviewed public booking keyboard handler.
export function bookingKeyboard(source) {
  const before = "  $('form').addEventListener('keydown',event=>{\n    if(event.key==='Enter'";
  const after = "  $('form').addEventListener('keydown',event=>{\n    // Candidate confirmation belongs to the input method, including Safari's final 229 event.\n    if(event.isComposing||event.keyCode===229)return;\n    if(event.key==='Enter'";
  if (source.split(before).length !== 2) throw new Error('Booking keyboard source differs from the reviewed version');
  return source.replace(before, after);
}
