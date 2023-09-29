## Headless chatbox component in React

A simple headless chatbox component that consists of:
- Messages container that is scrolled automatically when a new message is sent
- Chat messages that are styled differently per participant in the chat (e.g. aligned to left and right)
- Message textbox that grows automatically and is cleared after submission
- A trigger button

With this headless implementation, you can fully style and position the messages, the textbox and the trigger.

## Example:

The following example uses tailwind to style the chatbox.

```jsx
<Chatbox
    participants={participants}
    messages={messages}
    onMessageSend={onMessageSend}
    className="m-20 border-2 border-gray-200 rounded-b-md shadow-md w-96 h-96 relative"
>
    <div className="bg-blue-800 p-4 text-white rounded-t-md">
        Jane (online)
    </div>
    <Chatbox.Messages className="p-2 flex-1">
        {messages.map((message) => (
        <Chatbox.Message
            key={message.id}
            message={message}
            className={(participant) => {
            return `p-2 rounded-md shadow-md m-2 ${
                participant.side === "right"
                ? "bg-blue-600 text-white ml-8"
                : "bg-gray-200 text-gray-900 mr-8"
            }`;
            }}
        >
            {message.text}
        </Chatbox.Message>
        ))}
    </Chatbox.Messages>
    <Chatbox.Text className="block self-stretch m-2 bg-gray-100 py-2 pl-3 pr-9 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 outline-none" />
    <Chatbox.Trigger className="cursor-pointer absolute bottom-3.5 right-3">
        <TriggerSVG className="w-7 h-7 text-gray-400" />
    </Chatbox.Trigger>
</Chatbox>
```

## Props

### Chatbox

| Prop Name | Type | Description |
| --- | --- | --- |
| `className` | `string` | Additional CSS classes to apply to the component. |
| `style` | `React.CSSProperties` | Inline styles to apply to the component. |
| `onMessageSend` | `(text: string) => void` | Callback function to be called when the user submits a message. |
| `messages` | `Array<Message>` | An array of `Message` objects to display in the chatbox. |
| `participants` | `Array<Participant>` | An array of `Participant` objects representing the participants in the chat. |



### Chatbox.Messages:

| Prop Name | Type | Description |
| --- | --- | --- |
| `className` | `string` | Additional CSS classes to apply to the component. |
| `style` | `React.CSSProperties` | Inline styles to apply to the component. |


