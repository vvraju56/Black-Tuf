"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMessages, useSendMessage, useMarkRead, useTyping } from "@/hooks/use-messages";
import { useRealtime } from "@/hooks/use-realtime";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Send, Paperclip, FileText, Mic, Square, Loader2 } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { uploadFile, getPublicUrl } from "@/services/storage";
import { addProjectFile } from "@/services/files";
import { toast } from "@/components/ui/toast";
import type { Message } from "@/types";

interface ChatViewProps {
  projectId: string;
}

export function ChatView({ projectId }: ChatViewProps) {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: messages, isLoading } = useMessages(projectId);
  const send = useSendMessage(projectId, user?.id ?? "");
  const markRead = useMarkRead(projectId, user?.id ?? "");
  const typing = useTyping(projectId, user?.id ?? "");

  // ---- voice notes ----
  const [recording, setRecording] = useState(false);
  const [recordingMs, setRecordingMs] = useState(0);
  const [sendingVoice, setSendingVoice] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const stopRecording = () => {
    recorderRef.current?.stop();
    recorderRef.current = null;
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setRecording(false);
    setRecordingMs(0);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        chunksRef.current = [];
        await sendVoiceNote(blob);
      };
      recorder.start();
      setRecording(true);
      setRecordingMs(0);
      timerRef.current = window.setInterval(() => setRecordingMs((ms) => ms + 1000), 1000);
    } catch {
      toast.error("Microphone access denied");
    }
  };

  const sendVoiceNote = async (blob: Blob) => {
    if (!user) return;
    setSendingVoice(true);
    try {
      const file = new File([blob], `voice-note-${Date.now()}.webm`, { type: blob.type || "audio/webm" });
      const folder = `projects/${projectId}/messages`;
      const path = await uploadFile("projectFiles", folder, file);
      const url = getPublicUrl("projectFiles", path);
      await send.mutate({
        content: undefined,
        file_path: url,
        file_name: file.name,
        file_type: "audio/webm",
      });
      await addProjectFile({
        project_id: projectId,
        uploaded_by: user.id,
        name: file.name,
        file_type: "audio/webm",
        size: file.size,
        storage_path: path,
      });
    } catch (e: any) {
      toast.error("Voice note upload failed", { description: e.message });
    } finally {
      setSendingVoice(false);
    }
  };

  useRealtime("chat-" + projectId, [
    { table: "messages", queryKeys: [messageKeys(projectId)] },
    { table: "typing_indicator", queryKeys: [messageKeys(projectId, "typing")] },
  ]);

  const otherTyping = (typing.typingUsers.data ?? []).filter(
    (t: { user_id: string; user?: { full_name?: string; email?: string } }) =>
      t.user_id !== user?.id
  );

  useEffect(() => {
    bottomRef.current?.scrollTo({ top: bottomRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (user?.id) void markRead.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages?.length, user?.id]);

  const onStartTyping = () => text.trim().length > 0 && void typing.start();
  const onStopTyping = () => void typing.stop();

  const sendMessage = async () => {
    if (!text.trim() || !user) return;
    void send.mutate({ content: text.trim() });
    setText("");
    void typing.stop();
  };

  const sendFile = async (files: File[]) => {
    if (!user) return;
    try {
      const folder = `projects/${projectId}/messages`;
      for (const file of files) {
        const path = await uploadFile("projectFiles", folder, file);
        const url = getPublicUrl("projectFiles", path);
        await send.mutate({
          content: undefined,
          file_path: url,
          file_name: file.name,
          file_type: file.type || "file",
        });
        await addProjectFile({
          project_id: projectId,
          uploaded_by: user.id,
          name: file.name,
          file_type: file.type || "file",
          size: file.size,
          storage_path: path,
        });
      }
    } catch (e: any) {
      toast.error("Upload failed", { description: e.message });
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
    if (e.key === "Enter" && e.shiftKey) return;
  };

  return (
    <div className="flex h-[520px] flex-col">
      <div ref={bottomRef} className="flex-1 space-y-3 overflow-y-auto p-1">
        {isLoading ? (
          <LoadingMessages />
        ) : !messages || messages.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((m) => <MessageBubble key={m.id} message={m} me={m.sender_id === user?.id} />)
        )}
        {otherTyping.length > 0 && (
          <div className="flex items-end gap-2">
            <div className="rounded-xl bg-muted px-3 py-2 text-xs">
              {otherTyping.length === 1
                ? `${otherTyping[0].user?.full_name || otherTyping[0].user?.email || "Someone"} is typing…`
                : "Several people are typing…"}
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void sendMessage();
        }}
        className="flex items-end gap-2 border-t border-border/50 p-3"
      >
        <label className="cursor-pointer text-muted-foreground hover:text-foreground">
          <Paperclip className="h-5 w-5" />
          <input
            type="file"
            multiple
            accept="image/*,application/pdf,audio/*"
            className="hidden"
            onChange={(e) => void sendFile(Array.from(e.target.files ?? []))}
          />
        </label>
        <button
          type="button"
          aria-label="Record voice note"
          disabled={sendingVoice}
          onClick={recording ? stopRecording : () => void startRecording()}
          className={cn(
            "flex items-center gap-1 rounded-full border px-2.5 py-1.5 text-xs transition-colors",
            recording
              ? "border-destructive bg-destructive/10 text-destructive"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {sendingVoice ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : recording ? (
            <Square className="h-3.5 w-3.5 fill-current" />
          ) : (
            <Mic className="h-4 w-4" />
          )}
          {recording ? `${recordingMs}s` : "Voice"}
        </button>
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            void onStartTyping();
          }}
          onBlur={() => void onStopTyping()}
          onKeyDown={onKeyDown}
          placeholder="Type a message…"
          rows={1}
          className="flex-1 resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm focus:ring-1 focus:ring-ring"
        />
        <Button type="submit" size="icon" disabled={!text.trim() || send.isPending}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}

function messageKeys(projectId: string, suffix = "") {
  return suffix ? ["messages", "typing", projectId] : ["messages", "project", projectId];
}

function LoadingMessages() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-3/4 self-start" />
      ))}
    </>
  );
}

function MessageBubble({ message, me }: { message: Message; me: boolean }) {
  const time = message.created_at ? formatDate(message.created_at, { timeStyle: "short" }) : "";
  return (
    <div className={cn("max-w-[75%] space-y-1", me ? "ml-auto text-right" : "ml-0")}>
      <div
        className={cn(
          "inline-block rounded-xl px-3 py-2 text-sm",
          me ? "bg-primary text-primary-foreground" : "bg-muted"
        )}
      >
        {message.content ? <p>{message.content}</p> : null}
        {message.file_path ? renderAttachment(message) : null}
      </div>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span>{message.sender?.full_name ?? message.sender?.email ?? "—"}</span>
        <span>•</span>
        <span>{time}</span>
        {me ? <span className="text-xs">{message.read ? "Read" : "Sent"}</span> : null}
      </div>
    </div>
  );
}

function renderAttachment(message: any) {
  const isImage = (message.file_type || "").startsWith("image/");
  const isAudio = (message.file_type || "").startsWith("audio/");
  const name = message.file_name || "attachment";
  if (isImage) {
    return (
      <a href={message.file_path} target="_blank" rel="noreferrer" className="mt-1 block">
        <img src={message.file_path} alt={name} className="max-w-[200px] rounded" />
      </a>
    );
  }
  if (isAudio) {
    return (
      <audio controls preload="metadata" className="mt-1 h-10 max-w-[220px]">
        <source src={message.file_path} />
      </audio>
    );
  }
  return (
    <a href={message.file_path} target="_blank" rel="noreferrer" className="mt-1 flex items-center gap-2 text-xs underline">
      <FileText className="h-4 w-4" />
      {name}
    </a>
  );
}
