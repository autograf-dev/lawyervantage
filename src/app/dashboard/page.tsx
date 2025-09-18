"use client"
import { AppSidebar } from "@/components/app-sidebar"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

import { useEffect, useMemo, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"

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
  const [data, setData] = useState<Contact[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchContacts = async () => {
    setLoading(true)
    try {
      const res = await fetch("https://lawyervantage.netlify.app/.netlify/functions/getContacts")
      if (!res.ok) throw new Error("Failed to fetch contacts")
      const json = await res.json()
      const arr = (json?.contacts?.contacts || []) as Array<Partial<Contact>>
      const mapped: Contact[] = arr.map((c) => ({
        id: String(c?.id ?? ""),
        contactName: (c?.contactName as string) || `${(c?.firstName as string) || ""} ${(c?.lastName as string) || ""}`.trim(),
        firstName: (c?.firstName as string) || "",
        lastName: (c?.lastName as string) || "",
        email: (c?.email as string) || null,
        phone: (c?.phone as string) || null,
        dateAdded: (c?.dateAdded as string) || new Date().toISOString(),
      }))
      setData(mapped)
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Unknown error"
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContacts()
  }, [])

  return { data, loading, error }
}

export default function Page() {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const { data: contacts, loading } = useContacts()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user
      if (!u) {
        window.location.href = "/login"
        return
      }
      setUserEmail(u.email || null)
      setUserName((u.user_metadata && (u.user_metadata.full_name || u.user_metadata.name)) || null)
    })
  }, [])

  const { total, new7d, new30d, missingEmail, missingPhone, recent } = useMemo(() => {
    const now = Date.now()
    const days = (n: number) => n * 24 * 60 * 60 * 1000
    const total = contacts.length
    const new7d = contacts.filter((c) => now - new Date(c.dateAdded).getTime() <= days(7)).length
    const new30d = contacts.filter((c) => now - new Date(c.dateAdded).getTime() <= days(30)).length
    const missingEmail = contacts.filter((c) => !c.email).length
    const missingPhone = contacts.filter((c) => !c.phone).length
    const recent = [...contacts]
      .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
      .slice(0, 5)
    return { total, new7d, new30d, missingEmail, missingPhone, recent }
  }, [contacts])
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle>Total contacts</CardTitle>
                <CardDescription>All contacts in your workspace</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? <Skeleton className="h-8 w-24" /> : <div className="text-2xl font-semibold">{total.toLocaleString()}</div>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>New (7 days)</CardTitle>
                <CardDescription>Recently added this week</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-semibold">{new7d}</div>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>New (30 days)</CardTitle>
                <CardDescription>Growth over the last month</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-semibold">{new30d}</div>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Data quality</CardTitle>
                <CardDescription>Missing email / phone</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-6 w-10" />
                    <Skeleton className="h-6 w-10" />
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{missingEmail}</span> missing email · {" "}
                    <span className="font-medium text-foreground">{missingPhone}</span> missing phone
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent contacts</CardTitle>
                  <CardDescription>Newest 5 contacts</CardDescription>
                </div>
                <Link href="/contacts" className="text-sm font-medium underline underline-offset-4">View all</Link>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Added</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                          <TableRow key={i}>
                            <TableCell><Skeleton className="h-4 w-52" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                          </TableRow>
                        ))
                      ) : recent.length ? (
                        recent.map((c) => (
                          <TableRow key={c.id}>
                            <TableCell className="lowercase">{c.email || "-"}</TableCell>
                            <TableCell>{new Date(c.dateAdded).toLocaleString()}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={2} className="text-center">No contacts found.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Tips</CardTitle>
                <CardDescription>Simple actions to improve data quality</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <div>• Add emails to contacts missing email.</div>
                <div>• Add phone numbers for faster outreach.</div>
                <div>• Use consistent naming for easier search.</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
