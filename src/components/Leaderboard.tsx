import type { LobbyPlayerView } from "../features/shared/types";
import { cn } from "../lib/cn";

type LeaderboardProps = {
  players: LobbyPlayerView[];
  highlightPlayerId?: string | null;
};

export function Leaderboard({ players, highlightPlayerId }: LeaderboardProps) {
  return (
    <div className="space-y-3">
      {players.map((player) => (
        <div
          key={player.id}
          className={cn(
            "flex items-center justify-between rounded-2xl border border-black/8 bg-white px-4 py-3",
            player.id === highlightPlayerId &&
              "border-accent/35 bg-[rgba(58,72,105,0.06)]",
          )}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/[0.045] text-sm font-extrabold text-ink">
              {player.rank}
            </div>
            <div>
              <p className="font-semibold text-ink">{player.nickname}</p>
              <p className="text-sm text-black/45">
                {player.hasAnswered
                  ? "Answered"
                  : player.isConnected
                    ? "Waiting"
                    : "Disconnected"}
              </p>
            </div>
          </div>
          <p className="text-lg font-extrabold text-ink">{player.score}</p>
        </div>
      ))}
    </div>
  );
}
