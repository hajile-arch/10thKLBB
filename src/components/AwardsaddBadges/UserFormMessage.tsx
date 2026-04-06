// UserFormMessage.tsx (improved version)
interface UserFormMessageProps {
  message: string | null;
}

export const UserFormMessage: React.FC<UserFormMessageProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div
      className={`p-3 md:p-4 text-center text-sm md:text-base font-medium rounded-md ${
        message.includes("Error") || message.includes("error")
          ? "bg-red-100 text-red-700 border border-red-200"
          : "bg-green-100 text-green-700 border border-green-200"
      }`}
    >
      {message}
    </div>
  );
};