import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function TestToast() {
  const handleClick = () => {
    toast.success("This is a test notification!");
  };

  return (
    <div>
      <ToastContainer />
      <button onClick={handleClick}>Show Toast</button>
    </div>
  );
}

export default TestToast;
