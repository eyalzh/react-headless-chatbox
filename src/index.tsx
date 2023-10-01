import React from "react";
import {
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  useRef,
  ChangeEventHandler,
  PropsWithChildren,
  CSSProperties,
  forwardRef,
  useImperativeHandle,
} from "react";

export type ChatBoxSide = "left" | "right";

export interface Participant {
  id: string;
  side: ChatBoxSide;
}

export interface Message {
  participantId: string;
}

interface ChatboxComponentProps extends PropsWithChildren {
  className?: string;
  style?: React.CSSProperties;
}

interface ChatboxMessageComponentProps<
  TParticipant extends Participant
> extends Omit<ChatboxComponentProps, "className"> {
  className: string | ((participant: TParticipant) => string);
  message: Message;
}

interface ChatboxContainerProps extends ChatboxComponentProps {
  participants: Participant[];
  messages: Message[];
  onMessageSend: (message: string) => void;
  autoScrollDown?: boolean; // Scrolls down to the latest message (default: true)
}

interface ChatboxTextboxProps extends Omit<ChatboxComponentProps, "children"> {
  placeholder?: string;
  maxLength?: number;
  onChange?: ChangeEventHandler<HTMLTextAreaElement>;
  "aria-label"?: string;
}

interface ChatboxTriggerProps extends ChatboxComponentProps {
  "aria-label"?: string;
}

interface ChatboxContext {
  participants: Participant[];
  autoScrollDown?: boolean;
  inputValue: string;
  setInputValue: (value: string) => void;
  onSubmit: () => void;
}

const ChatboxContext = createContext<ChatboxContext | null>(null);

export const Container = forwardRef(function Container(
  props: ChatboxContainerProps,
  ref: React.Ref<HTMLDivElement>
) {
  const [inputValue, setInputValue] = useState("");

  const contextValue: ChatboxContext = {
    participants: props.participants,
    autoScrollDown: props.autoScrollDown,
    inputValue,
    setInputValue,
    onSubmit: () => {
      if (inputValue !== "") {
        props.onMessageSend(inputValue);
        setInputValue("");
      }
    },
  };
  return (
    <ChatboxContext.Provider value={contextValue}>
      <div
        className={props.className}
        style={{ display: "flex", flexDirection: "column", ...props.style }}
        aria-label="Chatbox"
        ref={ref}
      >
        {props.children}
      </div>
    </ChatboxContext.Provider>
  );
});

export const Messages = forwardRef(function Messages(
  props: ChatboxComponentProps,
  ref: React.Ref<HTMLDivElement | null>
) {
  const chatboxProps = useContext(ChatboxContext);
  const internalRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => internalRef.current);

  useLayoutEffect(() => {
    if (chatboxProps?.autoScrollDown !== false) {
      const messagesContainer = internalRef.current;
      messagesContainer?.scrollTo({
        top: messagesContainer.scrollHeight,
        behavior: "instant",
      });
    }
  }, [chatboxProps]);

  const style = useMemo<CSSProperties>(
    () => ({
      display: "flex",
      flexDirection: "column",
      overflow: "auto",
      ...props.style,
    }),
    [props.style]
  );

  return (
    <div
      ref={internalRef}
      className={props.className}
      style={style}
      aria-live="polite"
    >
      {props.children}
    </div>
  );
});

export function Message<TParticipant extends Participant>(
  props: ChatboxMessageComponentProps<TParticipant>
) {
  const chatboxProps = useContext(ChatboxContext);

  const participant: TParticipant | undefined = useMemo(
    () =>
      chatboxProps?.participants.find(
        (participant) => participant.id === props.message.participantId
      ),
    [chatboxProps?.participants, props.message]
  ) as TParticipant | undefined;

  const style = useMemo<CSSProperties>(() => {
    const defaultStyle =
      participant?.side === "left"
        ? { alignSelf: "flex-start" }
        : { alignSelf: "flex-end" };
    return { ...defaultStyle, ...props.style };
  }, [participant, props.style]);

  const finalClassName = useMemo<string>(() => {
    let finalClassName = "";
    if (participant) {
      finalClassName =
        typeof props.className === "function"
          ? props.className(participant)
          : props.className;
    }
    return finalClassName;
  }, [participant, props.className]);

  return (
    <div className={finalClassName} style={style}>
      {props.children}
    </div>
  );
}

export const Textbox = forwardRef(function Textbox(
  props: ChatboxTextboxProps,
  ref: React.Ref<HTMLTextAreaElement | null>
) {
  const chatboxProps = useContext(ChatboxContext);

  const textboxRef = useRef<HTMLTextAreaElement | null>(null);

  useImperativeHandle(ref, () => textboxRef.current);

  useLayoutEffect(() => {
    // TODO: replace with formSizing CSS property once it's widely supported
    const textbox = textboxRef.current;
    if (textbox) {
      if (chatboxProps?.inputValue !== "") {
        textbox.style.height = `${textbox.scrollHeight}px`;
      } else {
        textbox.style.height = `initial`;
      }
    }
  }, [chatboxProps]);

  const onInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    chatboxProps?.setInputValue(event.target.value);
    props.onChange && props.onChange(event);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (chatboxProps?.inputValue !== "") {
        chatboxProps?.onSubmit();
      }
    }
  };

  return (
    <textarea
      rows={1}
      ref={textboxRef}
      className={props.className}
      aria-label={props["aria-label"] ?? "Message to send"}
      placeholder={props.placeholder ?? "Message"}
      onChange={onInputChange}
      value={chatboxProps?.inputValue ?? ""}
      onKeyDown={onKeyDown}
      style={{ resize: "none", ...props.style }}
      maxLength={props.maxLength}
    />
  );
});

export const Trigger = forwardRef(function Trigger(
  props: ChatboxTriggerProps,
  ref: React.Ref<HTMLButtonElement>
) {
  const chatboxProps = useContext(ChatboxContext);
  const onTriggerClick = () => {
    chatboxProps?.onSubmit();
  };
  return (
    <button
      onClick={onTriggerClick}
      className={props.className}
      style={props.style}
      aria-label={props["aria-label"] ?? "Send Message"}
      ref={ref}
    >
      {props.children}
    </button>
  );
});

export const Chatbox = Object.assign(Container, {
  Messages,
  Message,
  Textbox,
  Trigger,
});
