"use client"

import * as React from "react"
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, Plus } from "lucide-react"

// Define the 4 kanban stages
export type KanbanStage = "contacted" | "consultation-booked" | "signed" | "lost"

export interface KanbanCard {
  id: string
  title: string
  value?: number
  contactName?: string
  description?: string
  stage: KanbanStage
  createdAt?: string
  updatedAt?: string
}

interface KanbanColumnProps {
  stage: KanbanStage
  title: string
  cards: KanbanCard[]
  onCardClick?: (card: KanbanCard) => void
  onEditCard?: (card: KanbanCard) => void
  onDeleteCard?: (cardId: string) => void
  onAddCard?: (stage: KanbanStage) => void
}

interface KanbanBoardProps {
  cards: KanbanCard[]
  onCardMove?: (cardId: string, newStage: KanbanStage) => void
  onCardClick?: (card: KanbanCard) => void
  onEditCard?: (card: KanbanCard) => void
  onDeleteCard?: (cardId: string) => void
  onAddCard?: (stage: KanbanStage) => void
  loading?: boolean
}

// Stage configuration
const STAGES: { id: KanbanStage; title: string; color: string }[] = [
  { id: "contacted", title: "Contacted", color: "bg-blue-100 border-blue-200" },
  { id: "consultation-booked", title: "Consultation Booked", color: "bg-amber-100 border-amber-200" },
  { id: "signed", title: "Signed", color: "bg-green-100 border-green-200" },
  { id: "lost", title: "Lost", color: "bg-red-100 border-red-200" },
]

function KanbanColumn({ stage, title, cards, onCardClick, onEditCard, onDeleteCard, onAddCard }: KanbanColumnProps) {
  const stageConfig = STAGES.find(s => s.id === stage)
  const totalValue = cards.reduce((sum, card) => sum + (card.value || 0), 0)

  return (
    <div className="flex flex-col h-full">
      <div className={`p-3 rounded-t-lg border-b ${stageConfig?.color}`}>
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-medium text-sm">{title}</h3>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => onAddCard?.(stage)}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{cards.length} opportunities</span>
          <span>${totalValue.toLocaleString()}</span>
        </div>
      </div>

      <Droppable droppableId={stage}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 p-2 space-y-2 min-h-[200px] transition-colors ${
              snapshot.isDraggingOver ? "bg-muted/50" : ""
            }`}
          >
            {cards.map((card, index) => (
              <Draggable key={card.id} draggableId={card.id} index={index}>
                {(provided, snapshot) => (
                  <Card
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`cursor-pointer transition-shadow hover:shadow-md group ${
                      snapshot.isDragging ? "shadow-lg rotate-2" : ""
                    }`}
                    onClick={() => onCardClick?.(card)}
                  >
                    <CardContent className="p-3">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium text-sm line-clamp-2">{card.title}</h4>
                          <div className="flex gap-1 ml-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation()
                                onEditCard?.(card)
                              }}
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-red-500"
                              onClick={(e) => {
                                e.stopPropagation()
                                onDeleteCard?.(card.id)
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        {card.contactName && (
                          <p className="text-xs text-muted-foreground">{card.contactName}</p>
                        )}
                        
                        <div className="flex items-center justify-between">
                          {card.value && (
                            <Badge variant="secondary" className="text-xs">
                              ${card.value.toLocaleString()}
                            </Badge>
                          )}
                          {card.createdAt && (
                            <span className="text-xs text-muted-foreground">
                              {new Date(card.createdAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  )
}

export function KanbanBoard({
  cards,
  onCardMove,
  onCardClick,
  onEditCard,
  onDeleteCard,
  onAddCard,
  loading = false,
}: KanbanBoardProps) {
  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result

    // If dropped outside a droppable area
    if (!destination) {
      return
    }

    // If dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    // Move the card to the new stage
    const newStage = destination.droppableId as KanbanStage
    onCardMove?.(draggableId, newStage)
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-[600px]">
        {STAGES.map(stage => (
          <div key={stage.id} className="border rounded-lg">
            <div className={`p-3 rounded-t-lg border-b ${stage.color}`}>
              <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
            </div>
            <div className="p-2 space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="border rounded-lg p-3">
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Group cards by stage
  const cardsByStage = STAGES.reduce((acc, stage) => {
    acc[stage.id] = cards.filter(card => card.stage === stage.id)
    return acc
  }, {} as Record<KanbanStage, KanbanCard[]>)

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-[600px]">
        {STAGES.map(stage => (
          <div key={stage.id} className="border rounded-lg overflow-hidden">
            <KanbanColumn
              stage={stage.id}
              title={stage.title}
              cards={cardsByStage[stage.id]}
              onCardClick={onCardClick}
              onEditCard={onEditCard}
              onDeleteCard={onDeleteCard}
              onAddCard={onAddCard}
            />
          </div>
        ))}
      </div>
    </DragDropContext>
  )
}
