// The words the checkout states print. brand-guidelines.md owns them: the 409 strings are §4.5
// (r13), the expired-hold block is §4.5 (r12) and the payment-failure row is §4.5's money table.
// The numbers in the comments are the counts that file rules on; they are measured, not estimated.
export const CHECKOUT_COPY = {
  slotTaken: 'Esa hora se ha ocupado. Vuelve en unos minutos.', // 47 — (r12), was "Elige otra" against a one-option picker
  holdExpired: 'Hemos liberado tu hora para no bloquear a otra persona.', // 55 — (r12) release line, first of three
  notCharged: 'No se ha cobrado nada.', // 22 — (r12) money line, verbatim, never merged into the release line
  chooseSlot: 'Elegir otra hora', // 16 — (r12) exit line, the single control back to the slot step
  rateLimited: 'Demasiados intentos. Espera un minuto y vuelve a probar.',
  paymentHeading: 'Pago simulado',
  paymentLine: 'Entorno de prácticas: no se realiza ningún cargo.',
  paymentFailedHeading: 'Error al procesar el pago', // brand-guidelines.md §4.5 money table, the state's heading
  paymentFailed: 'El pago simulado no se ha completado y no se ha cobrado nada.', // 61 — (r11), A has no card to retry with
  retry: 'Volver a intentarlo', // 19 — the one action on a failed payment
  confirmUnconfirmed: 'No hemos podido confirmar el pago. No vuelvas a pagar todavía.',
  checkStatus: 'Comprobar estado',
  pending: 'Estamos confirmando tu pago.',
  staffNotPaid: 'Este pedido no está pagado.',
  codeMiss: 'Código no encontrado.',
  collect: 'Marcar como recogido',
  offline: 'Sin conexión: no se ha registrado la entrega. Anota el código.',
  printHint: 'Solo el código basta para recoger.',
  pageTitle: 'Finalizar compra',
  measurementHeading: 'Qué medimos',
  legalPlaceholder: 'texto pendiente — no es un documento legal',
  expiredLabel: 'Reserva caducada',
  // §4.5 (r13): the cross-session duplicate. What did NOT happen, and the money clause borrowed
  // verbatim from (r12) — never a word about the other order's status, never `Pagado` in A.
  duplicateHeading: 'No hemos creado un segundo pedido.', // 34
  duplicateBody: 'Tu pedido anterior no ha cambiado y no se ha cobrado nada. Si el teléfono no es el tuyo, corrígelo y vuelve a enviar.', // 117
  duplicateActionPhone: 'Cambiar el teléfono', // 19 — the only control when this tab holds no ticket
  // 11 — §4.5 (r13.1) rules it UNUSED this round: it may not render while the colliding order's
  // clock is unstated on screen, and the 409 deliberately returns no orderRef to match a ticket to.
  duplicateActionPass: 'Ver mi pase',
} as const;
export const PAY_CTA_A = 'Simular pago';
export const REVIEW_CTA_A = 'Confirmar pedido';
