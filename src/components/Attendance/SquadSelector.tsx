interface SquadSelectorProps {
  selectedSquad: string;
  onSquadChange: (squad: string) => void;
}

export const SquadSelector = ({ selectedSquad, onSquadChange }: SquadSelectorProps) => {
  const squads = ['all', ...Array.from({ length: 8 }, (_, i) => (i + 1).toString())];

  return (
    <div className="flex gap-4 overflow-x-auto">
      {squads.map((squad) => (
        <button
          key={squad}
          onClick={() => onSquadChange(squad)}
          className={`w-16 h-16 flex items-center justify-center rounded-md border text-lg font-bold ${
            selectedSquad === squad
              ? 'bg-blue-600 text-white border-blue-700'
              : 'bg-gray-700 text-white border-gray-600 hover:bg-gray-600'
          }`}
        >
          {squad === 'all' ? 'All' : squad}
        </button>
      ))}
    </div>
  );
};
