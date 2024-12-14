// Scrollbar.tsx
const Scrollbar = () => {
    const message: string = "Hungry? Get food delivered anytime, anywhere. CampusEat is here for you! | Feeling hungry? Enjoy food delivery at your convenience with CampusEat! | Craving something delicious? CampusEat brings meals to you, anytime, anywhere! | Need a bite? CampusEat delivers your favorite food whenever and wherever you are!";
  
    return (
      <div className="w-[50px] h-full bg-gray-200 absolute left-0 flex items-center justify-center overflow-hidden">
        <div className="rotate-text">
          <p className="scroll-text text-sm font-mono text-gray-700 whitespace-nowrap">
            {message} {message} {/* Duplicating the message for seamless scrolling */}
          </p>
        </div>
      </div>
    );
  };
  
  export default Scrollbar;
  