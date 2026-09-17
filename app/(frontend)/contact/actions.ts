"use server"

import { getPayload } from "payload"

import config from "@/payload.config"
import type { ContactState } from "@/app/(frontend)/contact/state"
import { contactPage } from "@/content/pages"

/**
 * The contact form's submit action.
 *
 * Everything arriving here is untrusted. The form's own markup constrains
 * nothing: anyone can post to a server action directly with whatever fields
 * they like, so the select's options, the required marks and the maxlengths
 * in the JSX are conveniences for a person, not controls. The checks below
 * are the controls, and the Enquiries collection's field rules are a second
 * set behind them.
 *
 * Writes to Payload rather than sending mail, because there is no email
 * adapter configured yet (CLAUDE.md). An enquiry that is stored is an enquiry
 * that can still be answered tomorrow; an enquiry mailed through an adapter
 * that does not exist is gone with nobody the wiser. When Resend is wired,
 * the notification belongs in an afterChange hook on the collection, not
 * here - so that an enquiry created any other way is notified too.
 *
 * The state type and its initial value are in ./state.ts, not here: a
 * "use server" module may only export async functions.
 */

const LIMITS = {
  name: 120,
  company: 160,
  phone: 40,
  email: 254,
  message: 4000,
}

/** Trim, collapse runs of whitespace, and cap. Returns "" for anything else. */
function clean(value: FormDataEntryValue | null, max: number) {
  if (typeof value !== "string") return ""
  return value.trim().replace(/\s+/g, " ").slice(0, max)
}

/**
 * Deliberately permissive. Anything stricter than "something@something.dot"
 * rejects real addresses - plus-addressing, new TLDs, apostrophes - and the
 * cost of a bad address here is one bounced reply, while the cost of a false
 * rejection is a lost enquiry.
 */
function looksLikeEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export async function submitEnquiry(
  _previous: ContactState,
  formData: FormData
): Promise<ContactState> {
  // Honeypot: a field positioned off-screen and hidden from assistive
  // technology, so only something filling in every input reaches this. A
  // silent success rather than an error - telling a bot which check it
  // failed is how it learns to pass.
  if (clean(formData.get("website"), 200)) {
    return { status: "success", errors: {} }
  }

  const name = clean(formData.get("name"), LIMITS.name)
  const email = clean(formData.get("email"), LIMITS.email).toLowerCase()
  const phone = clean(formData.get("phone"), LIMITS.phone)
  const company = clean(formData.get("company"), LIMITS.company)
  const subject = clean(formData.get("subject"), 64)
  // Not whitespace-collapsed: the paragraph breaks someone typed are part of
  // what they wrote. Only trimmed and capped.
  const messageRaw = formData.get("message")
  const message =
    typeof messageRaw === "string"
      ? messageRaw.trim().slice(0, LIMITS.message)
      : ""
  const source = clean(formData.get("source"), 200) || "/contact"

  const { required, invalidEmail } = contactPage.form
  const errors: Record<string, string> = {}
  if (!name) errors.name = required
  if (!email) errors.email = required
  else if (!looksLikeEmail(email)) errors.email = invalidEmail
  if (!phone) errors.phone = required
  // Matched against the list rather than cast: this is what stops a crafted
  // post storing a subject the admin's own filters do not know about. It also
  // narrows the type, so nothing below has to assert one.
  const known = contactPage.form.subjects.find((s) => s.value === subject)
  if (!known) errors.subject = required

  if (Object.keys(errors).length > 0 || !known) {
    return { status: "error", errors }
  }

  try {
    const payload = await getPayload({ config })
    await payload.create({
      collection: "enquiries",
      // An explicit field list, not a spread of the form data: it is the only
      // thing stopping a crafted post from setting `status`, `notes`, or any
      // field added to the collection later.
      data: {
        name,
        email,
        phone,
        company: company || undefined,
        subject: known.value,
        message: message || undefined,
        source,
        status: "new",
      },
      // The form is public and unauthenticated; the collection's create
      // access allows exactly that, and nothing else.
      overrideAccess: false,
    })
  } catch (error) {
    // The reason is for us, not for the sender - a database error message
    // rendered on a public page is an information leak.
    console.error("Enquiry could not be stored:", error)
    return {
      status: "error",
      errors: {},
      message: contactPage.form.error,
    }
  }

  return { status: "success", errors: {} }
}
