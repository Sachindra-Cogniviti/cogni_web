"use client"

import * as React from "react"

import { submitEnquiry } from "@/app/(frontend)/contact/actions"
import { initialContactState } from "@/app/(frontend)/contact/state"
import { Corners, Kicker, pressable, Roll } from "@/components/primitives"
import { contactPage } from "@/content/pages"

const { form } = contactPage

/**
 * The enquiry form.
 *
 * Progressive enhancement is the reason this is shaped the way it is. The
 * <form> has a server action, so it works as a plain form post with
 * scripting off - no button handler, no fetch, no JSON. `useActionState`
 * adds the in-place result and the pending state on top for everyone else.
 *
 * Validation lives on the server (app/(frontend)/contact/actions.ts) and its
 * result comes back as a map of field name to message. The browser's own
 * `required` and `type="email"` are still declared, because catching a typo
 * without a round trip is worth it - but they are a convenience, not the
 * check. Anything that reaches the action is treated as hostile there.
 *
 * `noValidate` is deliberately NOT set: with scripting off the browser's
 * checks are the only immediate feedback there is.
 */
export function ContactForm({ defaultSubject }: { defaultSubject?: string }) {
  const [state, action, pending] = React.useActionState(
    submitEnquiry,
    initialContactState
  )
  const headingRef = React.useRef<HTMLHeadingElement>(null)
  const [resetKey, setResetKey] = React.useState(0)

  // Move focus to the confirmation when it appears. Without this a screen
  // reader user submits and is told nothing: the fields they were in have
  // been replaced and focus has fallen back to the document.
  React.useEffect(() => {
    if (state.status === "success") headingRef.current?.focus()
  }, [state.status])

  if (state.status === "success") {
    return (
      <div className="relative border border-rule bg-paper p-[clamp(24px,3vw,40px)]">
        <Corners />
        <div className="mb-5 h-px w-12 bg-oxblood" aria-hidden="true" />
        <h3
          ref={headingRef}
          tabIndex={-1}
          className="max-w-[24ch] text-[clamp(21px,2.2vw,28px)] leading-[1.15] font-semibold tracking-[-0.02em] text-balance outline-none"
        >
          {form.success.heading}
        </h3>
        <p className="mt-4 max-w-[52ch] text-[15px] leading-[1.65] text-pretty text-ink-soft">
          {form.success.body}
        </p>
        <button
          type="button"
          // Remounting the form by key is what actually clears it. A form
          // rendered back into the same slot keeps the values the browser
          // holds for those inputs, so the next sender would start with the
          // last one's details in the boxes.
          onClick={() => setResetKey((k) => k + 1)}
          className="control-motion mt-7 cursor-pointer border-b border-oxblood/35 pb-[3px] text-[15px] font-medium text-oxblood hover:border-ink/35 hover:text-ink"
        >
          <Roll>{form.success.again}</Roll>
        </button>
      </div>
    )
  }

  return (
    <form
      key={resetKey}
      action={action}
      className="relative border border-rule bg-paper p-[clamp(24px,3vw,40px)]"
    >
      <Corners />
      <Kicker>{form.kicker}</Kicker>
      <h2 className="mt-4 max-w-[22ch] text-[clamp(24px,2.6vw,34px)] leading-[1.12] font-semibold tracking-[-0.025em] text-balance">
        {form.heading}
      </h2>
      <p className="mt-4 max-w-[52ch] text-[15px] leading-[1.65] text-pretty text-ink-soft">
        {form.body}
      </p>

      {/* Which page the enquiry came from, so an enquiry raised from a
          product page can be told apart from one raised here. */}
      <input type="hidden" name="source" value="/contact" />

      {/* The honeypot. Off-screen rather than display:none - some bots skip
          anything invisible - and hidden from assistive technology and from
          the tab order so no person can reach it by accident. */}
      <div aria-hidden="true" className="absolute left-[-9999px] w-px">
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <Field
          name="name"
          label={form.fields.name.label}
          placeholder={form.fields.name.placeholder}
          autoComplete="name"
          required
          error={state.errors.name}
        />
        <Field
          name="company"
          label={form.fields.company.label}
          placeholder={form.fields.company.placeholder}
          autoComplete="organization"
          error={state.errors.company}
        />
        <Field
          name="email"
          type="email"
          label={form.fields.email.label}
          placeholder={form.fields.email.placeholder}
          autoComplete="email"
          required
          error={state.errors.email}
        />
        <Field
          name="phone"
          type="tel"
          label={form.fields.phone.label}
          placeholder={form.fields.phone.placeholder}
          autoComplete="tel"
          required
          error={state.errors.phone}
        />

        <div className="sm:col-span-2">
          <FieldLabel htmlFor="contact-subject" required>
            {form.fields.subject.label}
          </FieldLabel>
          <select
            id="contact-subject"
            name="subject"
            required
            defaultValue={defaultSubject ?? ""}
            aria-invalid={state.errors.subject ? true : undefined}
            aria-describedby={
              state.errors.subject ? "contact-subject-error" : undefined
            }
            className={fieldClass(Boolean(state.errors.subject))}
          >
            <option value="" disabled>
              {form.fields.subject.placeholder}
            </option>
            {form.subjects.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <FieldError
            id="contact-subject-error"
            message={state.errors.subject}
          />
        </div>

        <div className="sm:col-span-2">
          <FieldLabel htmlFor="contact-message">
            {form.fields.message.label}
          </FieldLabel>
          <textarea
            id="contact-message"
            name="message"
            rows={5}
            maxLength={4000}
            placeholder={form.fields.message.placeholder}
            className={`${fieldClass(false)} resize-y`}
          />
        </div>
      </div>

      <p className="mt-6 max-w-[56ch] text-[12.5px] leading-[1.6] text-ink-muted">
        {form.consent}
      </p>

      {/* A failure that belongs to no field. Announced, because the reader
          may be nowhere near it when it appears. */}
      {state.message && (
        <p
          role="alert"
          className="mt-5 border-l-2 border-oxblood bg-paper-alt py-3 pr-4 pl-4 text-[14px] leading-[1.55] text-ink"
        >
          {state.message}
        </p>
      )}

      <div className="mt-7 flex flex-wrap items-center gap-5">
        <button
          type="submit"
          disabled={pending}
          className={`inline-block cursor-pointer rounded-[2px] bg-ink px-[30px] py-[15px] text-[15px] font-medium text-paper hover:bg-oxblood disabled:cursor-wait disabled:opacity-70 ${pressable}`}
        >
          <Roll>{pending ? form.submitting : form.submit}</Roll>
        </button>
        <span className="font-mono text-[12px] text-ink-faint">
          {form.reassurance}
        </span>
      </div>
    </form>
  )
}

/**
 * One input and its label. The oxblood underline on focus is the same accent
 * the rest of the page uses for "this is the live one", and the invalid state
 * borrows it too rather than introducing a red the palette does not have.
 */
function fieldClass(invalid: boolean) {
  return [
    "mt-2 block w-full rounded-[2px] border bg-paper px-[14px] py-[11px] text-[15px] text-ink",
    "transition-[border-color] duration-[var(--roll-duration)] ease-[var(--roll-ease)]",
    "placeholder:text-ink-ghost focus:border-oxblood focus:outline-none",
    invalid ? "border-oxblood" : "border-edge",
  ].join(" ")
}

function FieldLabel({
  htmlFor,
  required,
  children,
}: {
  htmlFor: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="font-mono text-[11px] tracking-[0.14em] text-ink-faint uppercase"
    >
      {children}
      {required && (
        <span aria-hidden="true" className="ml-1 text-oxblood">
          *
        </span>
      )}
    </label>
  )
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} className="mt-2 text-[12.5px] font-medium text-oxblood">
      {message}
    </p>
  )
}

function Field({
  name,
  label,
  placeholder,
  type = "text",
  autoComplete,
  required,
  error,
}: {
  name: string
  label: string
  placeholder: string
  type?: string
  autoComplete?: string
  required?: boolean
  error?: string
}) {
  const id = `contact-${name}`
  return (
    <div>
      <FieldLabel htmlFor={id} required={required}>
        {label}
      </FieldLabel>
      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={fieldClass(Boolean(error))}
      />
      <FieldError id={`${id}-error`} message={error} />
    </div>
  )
}
