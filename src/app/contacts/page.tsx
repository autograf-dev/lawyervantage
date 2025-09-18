"use client"
import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import { ArrowUpDown, Pencil, Trash2, Plus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"

type Contact = {
  id: string
  contactName: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  dateAdded: string
}

function useContacts() {
  const [data, setData] = React.useState<Contact[]>([])
  const [loading, setLoading] = React.useState<boolean>(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let isMounted = true
    setLoading(true)
    fetch("https://lawyervantage.netlify.app/.netlify/functions/getContacts")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch contacts")
        const json = await res.json()
        const arr = (json?.contacts?.contacts || []) as any[]
        const mapped: Contact[] = arr.map((c) => ({
          id: String(c.id),
          contactName: c.contactName || `${c.firstName || ""} ${c.lastName || ""}`.trim(),
          firstName: c.firstName || "",
          lastName: c.lastName || "",
          email: c.email || null,
          phone: c.phone || null,
          dateAdded: c.dateAdded,
        }))
        if (isMounted) setData(mapped)
      })
      .catch((e: any) => {
        if (isMounted) setError(e?.message || "Unknown error")
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [])

  return { data, loading }
}

export default function Page() {
  const { data, loading } = useContacts()
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [openAdd, setOpenAdd] = React.useState(false)

  const columns = React.useMemo<ColumnDef<Contact>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            className="h-3.5 w-3.5"
            checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
            onCheckedChange={(value: boolean | "indeterminate") => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            className="h-3.5 w-3.5"
            checked={row.getIsSelected()}
            onCheckedChange={(value: boolean | "indeterminate") => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 40,
      },
      {
        accessorKey: "contactName",
        header: ({ column }) => (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Name
            <ArrowUpDown />
          </Button>
        ),
        cell: ({ row }) => <div className="font-medium">{row.getValue("contactName")}</div>,
      },
      { accessorKey: "email", header: "Email", cell: ({ row }) => <div className="lowercase">{row.getValue("email") || "-"}</div> },
      { accessorKey: "phone", header: "Phone", cell: ({ row }) => <div>{row.getValue("phone") || "-"}</div> },
      { accessorKey: "dateAdded", header: "Added", cell: ({ row }) => <div>{new Date(row.getValue("dateAdded")).toLocaleString()}</div> },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex items-center gap-1 justify-end">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" aria-label="Edit">
              <Pencil />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-red-500/70 hover:text-red-600"
              aria-label="Delete"
            >
              <Trash2 />
            </Button>
          </div>
        ),
        enableHiding: false,
      },
    ],
    []
  )

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters, columnVisibility, rowSelection },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[1.4rem] font-semibold leading-none">Contacts</h1>
              <p className="text-muted-foreground">Create, update, and edit your contacts from here.</p>
            </div>
            <div>
              <Button onClick={() => setOpenAdd(true)} className="h-9">
                <Plus className="mr-2 h-4 w-4" /> Add contact
              </Button>
            </div>
          </div>

          <div className="mx-auto w-full max-w-5xl space-y-3">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search contacts..."
                value={(table.getColumn("contactName")?.getFilterValue() as string) ?? ""}
                onChange={(e) => table.getColumn("contactName")?.setFilterValue(e.target.value)}
                className="w-[280px] h-9"
              />
            </div>

            <div className="rounded-md border overflow-hidden">
              <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header, idx) => {
                      const isFirst = header.column.id === "select"
                      const isLast = idx === headerGroup.headers.length - 1
                      const cls = isFirst ? "w-[36px]" : isLast ? "w-[84px] text-right" : undefined
                      return (
                        <TableHead key={header.id} className={cls}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={`s-${i}`}>
                      {table.getAllLeafColumns().map((col, j) => (
                        <TableCell key={`${col.id}-${j}`}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="text-muted-foreground text-sm">
                {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected.
              </div>
              <div className="flex items-center gap-1.5">
                <Button variant="outline" size="sm" className="h-8" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" className="h-8" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Dialog open={openAdd} onOpenChange={setOpenAdd}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add contact</DialogTitle>
            </DialogHeader>
            <form className="grid gap-3">
              <div className="grid gap-2">
                <label className="text-sm">First name</label>
                <Input name="firstName" required />
              </div>
              <div className="grid gap-2">
                <label className="text-sm">Last name</label>
                <Input name="lastName" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm">Email</label>
                <Input type="email" name="email" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm">Phone</label>
                <Input name="phone" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setOpenAdd(false)}>Cancel</Button>
                <Button type="button" disabled>
                  Save
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  )
}


