interface DateSelectorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export const DateSelector = ({ selectedDate, onDateChange }: DateSelectorProps) => (
  <div className="col-span-4 bg-gray-800 rounded-lg p-4">
    <h2 className="text-xl font-semibold mb-4">Select Date</h2>
    <input 
      type="date" 
      value={selectedDate.toISOString().split('T')[0]}
      onChange={(e) => onDateChange(new Date(e.target.value))}
      className="w-full p-2 rounded-md bg-gray-700 text-white border border-gray-600"
    />
  </div>
);