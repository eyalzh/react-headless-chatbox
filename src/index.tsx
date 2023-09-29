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
} from "react";

export type ChatBoxSide = "left" | "right";

export interface ChatboxParticipantProps {
  id: string;
  side: ChatBoxSide;
}

export interface ChatboxMessage {
  participantId: string;
}

interface ChatboxComponentProps extends PropsWithChildren {
  className?: string;
  style?: React.CSSProperties;
}

interface ChatboxMessageComponentProps<
  TParticipant extends ChatboxParticipantProps
> extends Omit<ChatboxComponentProps, "className"> {
  className: string | ((participant: TParticipant) => string);
  message: ChatboxMessage;
}

interface ChatboxContainerProps extends ChatboxComponentProps {
  participants: ChatboxParticipantProps[];
  messages: ChatboxMessage[];
  onMessageSend: (message: string) => void;
  autoScrollDown?: boolean; // Scrolls down to the latest message (default: true)
}

interface ChatboxTextProps extends Omit<ChatboxComponentProps, "children"> {
  placeholder?: string;
  maxLength?: number;
  onChange?: ChangeEventHandler<HTMLTextAreaElement>;
}

interface ChatboxContext {
  participants: ChatboxParticipantProps[];
  autoScrollDown?: boolean;
  inputValue: string;
  setInputValue: (value: string) => void;
  onSubmit: () => void;
}

const ChatboxContext = createContext<ChatboxContext | null>(null);

export function Container(props: ChatboxContainerProps) {
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
      >
        {props.children}
      </div>
    </ChatboxContext.Provider>
  );
}

export function Messages(props: ChatboxComponentProps) {
  const chatboxProps = useContext(ChatboxContext);
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (chatboxProps?.autoScrollDown !== false) {
      const messagesContainer = ref.current;
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
    <div ref={ref} className={props.className} style={style}>
      {props.children}
    </div>
  );
}

export function Message<TParticipant extends ChatboxParticipantProps>(
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

export function Text(props: ChatboxTextProps) {
  const chatboxProps = useContext(ChatboxContext);

  const textboxRef = useRef<HTMLTextAreaElement | null>(null);

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
      aria-label="Text Message"
      placeholder={props.placeholder ?? "Message"}
      onChange={onInputChange}
      value={chatboxProps?.inputValue ?? ""}
      onKeyDown={onKeyDown}
      style={{ resize: "none", ...props.style }}
      maxLength={props.maxLength}
    />
  );
}

export function Trigger(props: ChatboxComponentProps) {
  const chatboxProps = useContext(ChatboxContext);
  const onTriggerClick = () => {
    chatboxProps?.onSubmit();
  };
  return (
    <div
      onClick={onTriggerClick}
      className={props.className}
      style={props.style}
    >
      {props.children}
    </div>
  );
}

export const Chatbox = Object.assign(Container, {
  Messages,
  Message,
  Text,
  Trigger,
});
