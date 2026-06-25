'use client';

import Link from 'next/link';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from 'react';
import { Bot, Send, X } from 'lucide-react';
import { CdeChip } from '@/components/ui/cde-chip';
import {
  buildChatAssistantResponse,
  sanitizeChatAssistantText,
  type ChatAssistantContext,
  type ChatAssistantResponse,
  type ChatAssistantVisual,
} from '@/lib/chat-assistant';
import { ChatResponseVisual } from './chat-response-visual';

interface ChatAssistantPanelProps {
  context: ChatAssistantContext;
  onClose: () => void;
}

export const CHAT_ASSISTANT_DIALOG_ID = 'ai-insight-assistant-dialog';

type AssistantMessage = {
  id: string;
  role: 'assistant';
  prompt: string;
  response: ChatAssistantResponse;
};

type UserMessage = {
  id: string;
  role: 'user';
  content: string;
};

type ChatMessage = AssistantMessage | UserMessage;

const STARTER_PROMPT = 'Which segment has the largest leakage gap?';

function getResponseLabel(response: ChatAssistantResponse, isStarter: boolean): string {
  if (isStarter) return 'Opening insight answer';

  switch (response.intent) {
    case 'leakage':
    case 'segment':
      return 'Leakage opportunity answer';
    case 'persona':
      return 'Persona targeting answer';
    case 'activation':
      return 'Activation answer';
    case 'methodology':
      return 'CDE methodology answer';
    case 'overview':
      return 'Portfolio overview answer';
    case 'fallback':
    default:
      return 'Assistant answer';
  }
}

function getVisualTitle(response: ChatAssistantResponse): string {
  switch (response.intent) {
    case 'leakage':
    case 'segment':
      return 'Leakage drivers';
    case 'persona':
    case 'activation':
      return 'Top personas';
    default:
      return response.visual.title;
  }
}

function getDisplayVisual(response: ChatAssistantResponse, isStarter: boolean): ChatAssistantVisual {
  if (isStarter) return response.visual;

  return {
    ...response.visual,
    title: getVisualTitle(response),
  };
}

function ResponseCard({ message }: { message: AssistantMessage }) {
  const { response } = message;
  const isStarter = message.prompt === STARTER_PROMPT;

  return (
    <article className="rounded-lg border border-galaxy-border bg-galaxy-charcoal/80 p-4 text-galaxy-cream shadow-xl shadow-black/20">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-galaxy-gold/45 bg-galaxy-gold/10 text-galaxy-gold">
          <Bot aria-hidden="true" size={16} />
        </span>
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-galaxy-muted">
              Generated local demo narrative
            </p>
            <p className="mt-1 text-sm font-semibold text-galaxy-gold">{getResponseLabel(response, isStarter)}</p>
            <h2 className="mt-1 text-base font-semibold text-galaxy-cream">{response.title}</h2>
          </div>

          <p className="text-sm leading-6 text-galaxy-cream/88">{response.answer}</p>

          {response.evidence.length > 0 ? (
            <div className="flex flex-wrap gap-2" aria-label="Evidence">
              {response.evidence.map((item) => (
                <span
                  key={`${item.label}-${item.value}-${item.detail ?? ''}`}
                  className="inline-flex max-w-full flex-col rounded-lg border border-galaxy-border bg-galaxy-ink/55 px-3 py-2"
                >
                  <span className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-galaxy-muted">
                    {item.label}
                  </span>
                  <span className="text-sm font-semibold text-galaxy-cream">{item.value}</span>
                  {item.detail ? <span className="text-xs text-galaxy-muted">{item.detail}</span> : null}
                </span>
              ))}
              <CdeChip />
            </div>
          ) : null}

          <ChatResponseVisual visual={getDisplayVisual(response, isStarter)} />

          {response.links.length > 0 ? (
            <nav className="flex flex-wrap gap-2" aria-label="Assistant route links">
              {response.links.map((link) => (
                <Link
                  key={`${link.href}-${link.label}`}
                  href={link.href}
                  className="rounded-full border border-galaxy-gold/35 px-3 py-1.5 text-xs font-semibold text-galaxy-gold transition hover:border-galaxy-gold hover:bg-galaxy-gold/10"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function UserBubble({ message }: { message: UserMessage }) {
  return (
    <div className="flex justify-end">
      <p className="max-w-[85%] rounded-lg border border-galaxy-gold/30 bg-galaxy-gold/12 px-3 py-2 text-sm leading-6 text-galaxy-cream">
        {message.content}
      </p>
    </div>
  );
}

export function ChatAssistantPanel({ context, onClose }: ChatAssistantPanelProps) {
  const dialogRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialResponse = useMemo(() => buildChatAssistantResponse(STARTER_PROMPT, context), [context]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'assistant-initial',
      role: 'assistant',
      prompt: STARTER_PROMPT,
      response: initialResponse,
    },
  ]);
  const [question, setQuestion] = useState('');

  const latestResponse = [...messages].reverse().find((message): message is AssistantMessage => (
    message.role === 'assistant'
  ))?.response;

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView?.({ block: 'end' });
  }, [messages.length]);

  function submitQuestion(rawQuestion: string) {
    const nextQuestion = rawQuestion.trim();
    if (!nextQuestion) return;

    const response = buildChatAssistantResponse(nextQuestion, context);
    const displayQuestion = sanitizeChatAssistantText(nextQuestion);

    setMessages((current) => {
      const nextIndex = current.length;

      return [
        ...current,
        {
          id: `user-${nextIndex}`,
          role: 'user',
          content: displayQuestion || 'CDE-safe question',
        },
        {
          id: `assistant-${nextIndex}`,
          role: 'assistant',
          prompt: nextQuestion,
          response,
        },
      ];
    });
    setQuestion('');
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitQuestion(question);
  }

  function getFocusableDialogElements(): HTMLElement[] {
    return Array.from(
      dialogRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ) ?? [],
    ).filter((element) => element.getAttribute('aria-hidden') !== 'true');
  }

  function handleDialogKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
      return;
    }

    if (event.key === 'Tab') {
      const focusableElements = getFocusableDialogElements();
      if (focusableElements.length === 0) return;

      event.preventDefault();

      const currentIndex = document.activeElement instanceof HTMLElement
        ? focusableElements.indexOf(document.activeElement)
        : -1;
      const lastIndex = focusableElements.length - 1;
      const nextIndex = event.shiftKey
        ? currentIndex <= 0 ? lastIndex : currentIndex - 1
        : currentIndex >= lastIndex ? 0 : currentIndex + 1;

      focusableElements[nextIndex].focus();
    }
  }

  return (
    <section
      ref={dialogRef}
      id={CHAT_ASSISTANT_DIALOG_ID}
      role="dialog"
      aria-label="AI insight assistant"
      onKeyDown={handleDialogKeyDown}
      className="fixed bottom-24 right-4 z-50 flex max-h-[min(42rem,calc(100vh-7rem))] w-[min(calc(100vw-2rem),26rem)] flex-col overflow-hidden rounded-lg border border-galaxy-border bg-galaxy-ink/96 shadow-2xl shadow-black/45 backdrop-blur sm:right-6"
    >
      <header className="flex items-start justify-between gap-4 border-b border-galaxy-border bg-galaxy-charcoal/90 p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-galaxy-muted">AI insight assistant</p>
          <p className="mt-1 text-sm text-galaxy-cream/80">Generated local demo narrative for CDE-safe planning.</p>
        </div>
        <button
          ref={closeButtonRef}
          type="button"
          aria-label="Close AI insight assistant"
          onClick={onClose}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-galaxy-border text-galaxy-muted transition hover:border-galaxy-gold hover:text-galaxy-gold"
        >
          <X aria-hidden="true" size={16} />
        </button>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto p-4" aria-live="polite">
        {messages.map((message) => (
          message.role === 'assistant' ? (
            <ResponseCard key={message.id} message={message} />
          ) : (
            <UserBubble key={message.id} message={message} />
          )
        ))}
        <div ref={messagesEndRef} aria-hidden="true" />
      </div>

      {latestResponse ? (
        <div className="border-t border-galaxy-border px-4 py-3">
          <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Suggested prompts">
            {latestResponse.suggestedQuestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => submitQuestion(suggestion)}
                className="shrink-0 rounded-full border border-galaxy-border bg-galaxy-charcoal/80 px-3 py-1.5 text-xs font-semibold text-galaxy-cream transition hover:border-galaxy-gold hover:text-galaxy-gold"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-galaxy-border bg-galaxy-charcoal/92 p-4">
        <input
          ref={inputRef}
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          aria-label="Ask the AI insight assistant"
          placeholder="Ask about leakage, personas, activation, or CDE rules"
          className="min-w-0 flex-1 rounded-lg border border-galaxy-border bg-galaxy-ink px-3 py-2 text-sm text-galaxy-cream placeholder:text-galaxy-muted"
        />
        <button
          type="submit"
          aria-label="Send question"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-galaxy-gold/45 bg-galaxy-gold/12 text-galaxy-gold transition hover:border-galaxy-gold hover:bg-galaxy-gold/20"
        >
          <Send aria-hidden="true" size={16} />
        </button>
      </form>
    </section>
  );
}
