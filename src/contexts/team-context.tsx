"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Scale, FlaskConical, Building2 } from "lucide-react"

type Team = {
  name: string
  logo: React.ElementType
  plan: string
  prefix: string
}

type TeamContextType = {
  currentTeam: Team
  setCurrentTeam: (team: Team) => void
  getTeamPrefix: () => string
  getTeamDashboardUrl: () => string
}

const TeamContext = createContext<TeamContextType | undefined>(undefined)

const teams: Team[] = [
  {
    name: "Lawyer Vantage",
    logo: Scale,
    plan: "LawFirm",
    prefix: ""
  },
  {
    name: "Lawyer Vantage Legal Lab",
    logo: FlaskConical,
    plan: "Legal Lab",
    prefix: "/lab"
  },
  {
    name: "Lawyer Vantage Tc Legal",
    logo: Building2,
    plan: "Tc Legal",
    prefix: "/legal"
  }
]

export function TeamProvider({ children }: { children: React.ReactNode }) {
  const [currentTeam, setCurrentTeam] = useState<Team>(teams[0])
  const router = useRouter()
  const pathname = usePathname()

  // Initialize team based on current path
  useEffect(() => {
    if (pathname.startsWith("/lab")) {
      setCurrentTeam(teams[1])
    } else if (pathname.startsWith("/legal")) {
      setCurrentTeam(teams[2])
    } else if (pathname === "/" || pathname.startsWith("/dashboard") || pathname.startsWith("/contacts") || pathname.startsWith("/opportunities")) {
      setCurrentTeam(teams[0])
    }
  }, [pathname])

  const getTeamPrefix = () => currentTeam.prefix

  const getTeamDashboardUrl = () => {
    return currentTeam.prefix + "/dashboard"
  }

  const handleSetCurrentTeam = (team: Team) => {
    setCurrentTeam(team)
    // Navigate to the team's dashboard
    const dashboardUrl = team.prefix + "/dashboard"
    router.push(dashboardUrl)
  }

  return (
    <TeamContext.Provider
      value={{
        currentTeam,
        setCurrentTeam: handleSetCurrentTeam,
        getTeamPrefix,
        getTeamDashboardUrl,
      }}
    >
      {children}
    </TeamContext.Provider>
  )
}

export function useTeam() {
  const context = useContext(TeamContext)
  if (context === undefined) {
    throw new Error("useTeam must be used within a TeamProvider")
  }
  return context
}

export { teams }
