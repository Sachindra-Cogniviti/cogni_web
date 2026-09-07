import { Button } from "@/components/ui/button"
import { home } from "@/content/site"

export default function Page() {
  return (
    <div className="flex min-h-svh p-6">
      <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
        <div>
          <h1 className="font-medium">{home.heading}</h1>
          {home.body.map((line) => (
            <p key={line}>{line}</p>
          ))}
          <Button className="mt-2">{home.cta}</Button>
        </div>
        <div className="font-mono text-xs text-muted-foreground">({home.hint})</div>
      </div>
    </div>
  )
}
