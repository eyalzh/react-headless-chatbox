import { ChangeEventHandler, PropsWithChildren } from "react";
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
interface ChatboxMessageComponentProps<TParticipant extends ChatboxParticipantProps> extends Omit<ChatboxComponentProps, "className"> {
    className: string | ((participant: TParticipant) => string);
    message: ChatboxMessage;
}
interface ChatboxContainerProps extends ChatboxComponentProps {
    participants: ChatboxParticipantProps[];
    messages: ChatboxMessage[];
    onMessageSend: (message: string) => void;
    autoScrollDown?: boolean;
}
interface ChatboxTextProps extends Omit<ChatboxComponentProps, "children"> {
    placeholder?: string;
    maxLength?: number;
    onChange?: ChangeEventHandler<HTMLTextAreaElement>;
}
export declare function Container(props: ChatboxContainerProps): import("react/jsx-runtime").JSX.Element;
export declare function Messages(props: ChatboxComponentProps): import("react/jsx-runtime").JSX.Element;
export declare function Message<TParticipant extends ChatboxParticipantProps>(props: ChatboxMessageComponentProps<TParticipant>): import("react/jsx-runtime").JSX.Element;
export declare function Text(props: ChatboxTextProps): import("react/jsx-runtime").JSX.Element;
export declare function Trigger(props: ChatboxComponentProps): import("react/jsx-runtime").JSX.Element;
export declare const Chatbox: typeof Container & {
    Messages: typeof Messages;
    Message: typeof Message;
    Text: typeof Text;
    Trigger: typeof Trigger;
};
export {};
