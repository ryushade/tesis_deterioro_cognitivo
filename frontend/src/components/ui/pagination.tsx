import * as React from "react"

type PaginationProps = React.HTMLAttributes<HTMLDivElement>

export function Pagination({ className, children, ...props }: PaginationProps) {
  return (
    <nav role="navigation" aria-label="pagination" className={className} {...props}>
      {children}
    </nav>
  )
}

export function PaginationContent({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) {
  return <ul className={"flex flex-row items-center gap-1" + (className ? ` ${className}` : "")} {...props} />
}

export function PaginationItem({ className, ...props }: React.HTMLAttributes<HTMLLIElement>) {
  return <li className={className} {...props} />
}

export function PaginationLink({ className, isActive, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { isActive?: boolean }) {
  const base = "inline-flex items-center justify-center whitespace-nowrap rounded-md border border-input bg-background px-3 py-1 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
  const active = isActive ? " bg-accent text-accent-foreground" : ""
  return <a className={base + active + (className ? ` ${className}` : "")} {...props} />
}

export function PaginationPrevious(props: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <PaginationLink {...props}>Anterior</PaginationLink>
}

export function PaginationNext(props: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <PaginationLink {...props}>Siguiente</PaginationLink>
}

export function PaginationEllipsis() {
  return <span className="px-2">…</span>
}

