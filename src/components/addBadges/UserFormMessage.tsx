// UserFormMessage.tsx
interface UserFormMessageProps {
  message: string | null;
}

export const UserFormMessage: React.FC<UserFormMessageProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div
      className={`p-4 text-center text-sm font-medium rounded-md ${
        message.includes("Error")
          ? "bg-red-100 text-red-700"
          : "bg-green-100 text-green-700"
      }`}
    >
      {message}
    </div>
  );
};
