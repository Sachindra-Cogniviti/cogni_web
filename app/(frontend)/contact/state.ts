/**
 * The contact form's action state, in its own module.
 *
 * It cannot live in actions.ts. A "use server" file may only export async
 * functions - every export becomes a callable server reference - so exporting
 * a plain object from it does not fail the build, it fails at render: the
 * const arrives as a reference rather than as the object, `state.errors` is
 * undefined and the form throws on the first field.
 *
 * A type-only export would have been fine, since types are erased. The
 * initial value is not, so both live here and both files import from here.
 */
export type ContactState = {
  status: "idle" | "success" | "error"
  /** Field name -> message. Empty when the submission was accepted. */
  errors: Record<string, string>
  /** Only set on "error", and only for a failure that is not per-field. */
  message?: string
}

export const initialContactState: ContactState = { status: "idle", errors: {} }
