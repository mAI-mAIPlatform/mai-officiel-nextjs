## 2024-05-18 - [React.memo in Vercel AI SDK Chat UI]
**Learning:** Over-engineering `React.memo` with deep equality checks for messages when using the Vercel AI SDK (`@ai-sdk/react`) is unnecessary and counterproductive. The SDK uses immutable state updates, meaning a message object gets a new reference whenever it changes. Deep equality checks on arrays and objects on every render defeat the purpose of a fast memoization check.
**Action:** Use simple referential checks (`prevProps.message === nextProps.message`) when memoizing message components powered by immutable state management libraries.

## 2024-05-18 - [Vercel AI SDK React Server Components Hooks Overhead]
**Learning:** Calling unused hooks that rely on Context (like `useDataStream` calling `useContext(DataStreamContext)`) in child components forces those components to re-render whenever the context value changes, completely bypassing `React.memo()`. This caused O(N) re-renders for every single message chunk streamed.
**Action:** Never import and call Context-based hooks if their returned values are not actively used in the component. Double-check all `useX()` calls inside `React.memo()` boundaries to ensure they are strictly necessary.
