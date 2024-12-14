import { useNavigate } from "react-router-dom";

const Content = () => {
  const navigate = useNavigate();

  return (
    <div className="ml-[50px] flex-grow bg-black bg-opacity-100">
      {/* Top Section with Background Image, Title, and Paragraph */}
      <div
        className="relative h-[65%] bg-cover bg-center"
        style={{ backgroundImage: "url('/HomePageBg.webp')" }}
      >
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative flex flex-col justify-center items-start h-full text-white pl-12">
          <h1 className="text-5xl font-bold mb-4">Welcome to CampusEat</h1>
          <p className="text-lg max-w-lg">
            Order food directly to your lecture hall, or check your past orders.
            Get your meals when and where you need them.
          </p>
        </div>
      </div>

      {/* Bottom Section with Two Columns */}
      <div className="h-[35%] grid grid-cols-2">
        {/* Left Side: Create Order Section (left-aligned) */}
        <div className="flex items-center bg-green-500 text-white pl-12 pr-10">
          <div className="flex flex-col flex-grow">
            <h2 className="text-3xl font-bold">Create Order</h2>
            <p className="text-left mt-2 max-w-xs">
              Browse the menu and create a new order for food delivery right to
              your location.
            </p>
            <button
              onClick={() => navigate("/foodplace")} // Navigate to create order page
              className="bg-white text-green-500 px-4 py-2 rounded-lg hover:bg-gray-200 mt-2 w-[150px]"
            >
              Create Order
            </button>
          </div>
          {/* Right-aligned image */}
          <div className="flex-shrink-0">
            <img
              src="/CreateOrder.jpg"
              alt="Food Truck Area"
              className="w-[180px] h-[180px] object-cover rounded-full"
            />
          </div>
        </div>

        {/* Right Side: Check Order Section (left-aligned) */}
        <div className="flex items-center bg-gray-900 text-white pl-12 pr-10">
          <div className="flex flex-col flex-grow">
            <h2 className="text-3xl font-bold">Check Orders</h2>
            <p className="text-left mt-2 max-w-xs">
              View your order history or check the status of an ongoing order.
            </p>
            <button
              onClick={() => navigate("/check-orders")} // Navigate to check orders page
              className="bg-white text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-200 mt-2 w-[150px]"
            >
              Check Order
            </button>
          </div>
          {/* Right-aligned image */}
          <div className="flex-shrink-0">
            <img
              src="/CheckOrder.jpg"
              alt="Order History Area"
              className="w-[180px] h-[180px] object-cover rounded-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Content;
