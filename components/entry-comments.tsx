"use client"

import { useState, useMemo } from "react"
import { useData } from "@/components/data-provider"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import type { Entry, EntryComment } from "@/lib/types"
import { format, formatDistanceToNow, parseISO } from "date-fns"
import { Trash2, MessageSquare } from "lucide-react"

interface EntryCommentsProps {
  entry: Entry
}

export function EntryCommentsSection({ entry }: EntryCommentsProps) {
  const { entryComments, addEntryComment, deleteEntryComment, members } = useData()
  const { user } = useAuth()
  const [newComment, setNewComment] = useState("")
  const [authorName, setAuthorName] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("tallyr-comment-author") || ""
    }
    return ""
  })

  const comments = useMemo(
    () =>
      entryComments
        .filter((c) => c.entryId === entry.id)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [entryComments, entry.id]
  )

  const memberOptions = members.map((m) => m.name)
  const defaultAuthor = user?.email?.split("@")[0] || memberOptions[0] || "You"

  const handleAdd = () => {
    const text = newComment.trim()
    if (!text) return
    const author = authorName.trim() || defaultAuthor

    const comment: EntryComment = {
      id: `comment-${Date.now()}`,
      entryId: entry.id,
      author,
      text,
      createdAt: new Date().toISOString(),
    }
    addEntryComment(comment)
    setNewComment("")

    // Remember chosen author
    if (typeof window !== "undefined" && authorName.trim()) {
      localStorage.setItem("tallyr-comment-author", authorName.trim())
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleAdd()
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-muted-foreground" />
        <Label className="text-sm font-medium">
          Comments {comments.length > 0 && `(${comments.length})`}
        </Label>
      </div>

      {comments.length > 0 && (
        <div className="flex flex-col gap-2">
          {comments.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              onDelete={() => deleteEntryComment(c.id)}
            />
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/30 p-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="comment-author" className="text-xs text-muted-foreground">
            Your name
          </Label>
          <input
            id="comment-author"
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder={defaultAuthor}
            className="h-8 rounded-md bg-background px-2.5 text-sm border border-border focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a comment..."
          rows={2}
          className="resize-none bg-background"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Cmd/Ctrl + Enter to post
          </span>
          <Button size="sm" onClick={handleAdd} disabled={!newComment.trim()}>
            Post
          </Button>
        </div>
      </div>
    </div>
  )
}

function CommentItem({
  comment,
  onDelete,
}: {
  comment: EntryComment
  onDelete: () => void
}) {
  const when = parseISO(comment.createdAt)
  const initial = comment.author.charAt(0).toUpperCase()

  return (
    <div className="flex gap-2.5 rounded-lg bg-muted/40 p-3 group">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-background text-xs font-medium">
        {initial}
      </div>
      <div className="flex flex-col gap-1 min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-xs font-medium">{comment.author}</span>
          <span
            className="text-xs text-muted-foreground"
            title={format(when, "PPpp")}
          >
            {formatDistanceToNow(when, { addSuffix: true })}
          </span>
        </div>
        <p className="text-sm whitespace-pre-wrap break-words">{comment.text}</p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
        onClick={onDelete}
        aria-label="Delete comment"
      >
        <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
      </Button>
    </div>
  )
}
