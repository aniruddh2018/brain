import { GameContainerProps } from "./GameContainer.types";

export default function GameContainer({ children }: GameContainerProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-3 sm:p-4">{children}</div>
    </div>
  )
}

