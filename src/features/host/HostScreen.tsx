import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Crown,
  LoaderCircle,
  RotateCcw,
  Sparkles,
  UserRoundX,
  Users,
} from "lucide-react";
import type { LobbySnapshot } from "../shared/types";
import { getSocket, type ClientSocketLike } from "../../lib/socket";
import {
  GlowPanel,
  AccentButton,
  GhostButton,
  SectionLabel,
  Shell,
} from "../../components/ui";
import { TimerBar } from "../../components/TimerBar";
import { quizQuestionCountLimits } from "../../../shared/quiz";

type HostScreenProps = {
  socket?: ClientSocketLike;
};

export function HostScreen({ socket = getSocket() }: HostScreenProps) {
  const [topic, setTopic] = useState("");
  const [questionCount, setQuestionCount] = useState(
    String(quizQuestionCountLimits.default),
  );
  const [snapshot, setSnapshot] = useState<LobbySnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const handleSnapshot = (nextSnapshot: LobbySnapshot) => {
      setError(null);
      setIsGenerating(false);
      setSnapshot(nextSnapshot);
    };
    const handleError = (payload: { message: string }) => {
      setIsGenerating(false);
      setError(payload.message);
    };

    socket.connect();
    socket.on("lobby:snapshot", handleSnapshot);
    socket.on("lobby:error", handleError);

    return () => {
      socket.off("lobby:snapshot", handleSnapshot);
      socket.off("lobby:error", handleError);
      socket.disconnect();
    };
  }, [socket]);

  const parsedQuestionCount = Number(questionCount);
  const isQuestionCountValid =
    Number.isInteger(parsedQuestionCount) &&
    parsedQuestionCount >= quizQuestionCountLimits.min &&
    parsedQuestionCount <= quizQuestionCountLimits.max;
  const canGenerate = topic.trim().length > 0 && isQuestionCountValid;
  const canStart = snapshot?.status === "ready";
  const isFinished = snapshot?.status === "finished";
  const currentQuestion = snapshot?.currentQuestion;
  const isFormLocked = isGenerating;
  const connectedPlayers =
    snapshot?.players.filter((player) => player.isConnected).length ?? 0;
  const hasNextQuestion =
    typeof snapshot?.currentQuestionIndex === "number" &&
    snapshot.currentQuestionIndex < snapshot.totalQuestions - 1;

  return (
    <Shell className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.15fr,0.85fr]">
        <GlowPanel className="relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-r from-black/[0.02] via-cool/10 to-transparent blur-2xl" />
          <div className="relative space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-black/45">
                  Host control
                </p>
                <h1 className="mt-3 font-display text-4xl font-extrabold text-ink sm:text-6xl">
                  Build the next room.
                </h1>
              </div>
              <Link
                to="/"
                className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:bg-black/[0.03]"
              >
                Back
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-[1fr,160px]">
              <label className="space-y-3">
                <SectionLabel>Topic</SectionLabel>
                <textarea
                  aria-label="Topic"
                  value={topic}
                  onChange={(event) => setTopic(event.target.value)}
                  disabled={isFormLocked}
                  placeholder="Ancient Rome, volcano science, 90s hip-hop, world capitals..."
                  className="min-h-40 w-full rounded-[28px] border border-black/10 bg-white px-5 py-5 text-lg text-ink outline-none ring-0 placeholder:text-black/28 focus:border-accent/50 disabled:bg-black/[0.03]"
                />
              </label>
              <label className="space-y-3">
                <SectionLabel>Questions</SectionLabel>
                <input
                  aria-label="Questions"
                  value={questionCount}
                  type="number"
                  min={quizQuestionCountLimits.min}
                  max={quizQuestionCountLimits.max}
                  inputMode="numeric"
                  onChange={(event) =>
                    setQuestionCount(event.target.value.replace(/[^\d]/g, ""))
                  }
                  disabled={isFormLocked}
                  className="w-full rounded-[24px] border border-black/10 bg-white px-4 py-4 text-lg text-ink outline-none focus:border-accent/50 disabled:bg-black/[0.03]"
                />
                <p className="text-sm text-black/45">
                  Choose any length from {quizQuestionCountLimits.min} to{" "}
                  {quizQuestionCountLimits.max}.
                </p>
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <AccentButton
                onClick={() => {
                  setIsGenerating(true);
                  socket.emit("host:createLobby", {
                    topic: topic.trim(),
                    questionCount: parsedQuestionCount,
                  });
                }}
                disabled={!canGenerate || isFormLocked}
              >
                {isGenerating ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    Generating quiz...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate quiz
                  </>
                )}
              </AccentButton>

              <AccentButton
                className="bg-success text-white hover:bg-success/90"
                onClick={() =>
                  snapshot && socket.emit("game:start", { code: snapshot.code })
                }
                disabled={!canStart || isFormLocked}
              >
                <Crown className="mr-2 h-4 w-4" />
                Start game
              </AccentButton>

              <GhostButton
                onClick={() =>
                  snapshot &&
                  socket.emit("game:restart", { code: snapshot.code })
                }
                disabled={!isFinished || isFormLocked}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Restart
              </GhostButton>
            </div>

            {error ? (
              <div className="rounded-2xl border border-hot/25 bg-hot/8 px-4 py-3 text-sm text-hot">
                {error}
              </div>
            ) : null}

            {snapshot ? (
              <div className="space-y-5">
                <div className="grid gap-4 md:grid-cols-3">
                  <GlowPanel className="bg-white">
                    <SectionLabel>Room code</SectionLabel>
                    <p className="font-display text-4xl font-extrabold tracking-[0.24em] text-ink">
                      {snapshot.code}
                    </p>
                  </GlowPanel>
                  <GlowPanel className="bg-white">
                    <SectionLabel>Status</SectionLabel>
                    <p className="text-2xl font-bold capitalize text-ink">
                      {snapshot.status.replace(/_/g, " ")}
                    </p>
                  </GlowPanel>
                  <GlowPanel className="bg-white">
                    <SectionLabel>Quiz</SectionLabel>
                    <p className="text-xl font-bold text-ink">
                      {snapshot.quizTitle ?? "Generating..."}
                    </p>
                  </GlowPanel>
                </div>

                {currentQuestion ? (
                  <GlowPanel className="space-y-5 bg-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <SectionLabel>
                          Question {snapshot.currentQuestionIndex + 1} of{" "}
                          {snapshot.totalQuestions}
                        </SectionLabel>
                        <h2 className="text-2xl font-extrabold text-ink">
                          {currentQuestion.prompt}
                        </h2>
                      </div>
                    </div>
                    <TimerBar
                      startedAt={currentQuestion.startedAt}
                      endsAt={currentQuestion.endsAt}
                      isActive={snapshot?.status === "question_live"}
                    />
                    <div className="grid gap-3 sm:grid-cols-2">
                      {currentQuestion.options.map((option, index) => (
                        <div
                          key={option}
                          className="rounded-2xl border border-black/8 bg-black/[0.02] px-4 py-4"
                        >
                          <p className="text-xs font-bold uppercase tracking-[0.18em] text-black/40">
                            Answer {index + 1}
                          </p>
                          <p className="mt-2 font-semibold text-ink">
                            {option}
                          </p>
                        </div>
                      ))}
                    </div>
                    {currentQuestion.explanation ? (
                      <p className="rounded-2xl bg-black/[0.03] px-4 py-3 text-sm text-black/65">
                        {currentQuestion.explanation}
                      </p>
                    ) : null}
                  </GlowPanel>
                ) : snapshot?.status === "leaderboard" ? (
                  <GlowPanel className="space-y-5 bg-white">
                    <div>
                      <SectionLabel>
                        {hasNextQuestion
                          ? "Round leaderboard"
                          : "Final leaderboard"}
                      </SectionLabel>
                      <h2 className="text-2xl font-extrabold text-ink">
                        {hasNextQuestion
                          ? "Scores are in. Next round is loading."
                          : "Final scores are locked in."}
                      </h2>
                    </div>
                    {hasNextQuestion ? (
                      <TimerBar
                        startedAt={snapshot.phaseStartedAt}
                        endsAt={snapshot.phaseEndsAt}
                        isActive
                        label="Next round in"
                      />
                    ) : null}
                    <p className="text-black/58">
                      {hasNextQuestion
                        ? "The room will roll straight into the next question when this countdown ends."
                        : "Players will move to the waiting screen after this leaderboard window closes."}
                    </p>
                  </GlowPanel>
                ) : isFinished ? (
                  <GlowPanel className="space-y-4 bg-white">
                    <SectionLabel>Waiting room</SectionLabel>
                    <h2 className="text-2xl font-extrabold text-ink">
                      The game has wrapped.
                    </h2>
                    <p className="text-black/58">
                      The final leaderboard has cleared. Restart when you want
                      to run the same quiz again.
                    </p>
                  </GlowPanel>
                ) : null}
              </div>
            ) : null}
          </div>
        </GlowPanel>

        <div className="space-y-6">
          <GlowPanel>
            <div className="mb-5 flex items-center gap-3">
              <Users className="h-5 w-5 text-accent" />
              <div>
                <SectionLabel>Lobby roster</SectionLabel>
                <p className="text-lg font-bold text-ink">
                  {connectedPlayers} players connected
                </p>
              </div>
            </div>
            <div className="space-y-3">
              {(snapshot?.players ?? []).map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between rounded-2xl border border-black/8 bg-white px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/[0.045] text-sm font-extrabold text-ink">
                      {player.rank}
                    </div>
                    <div>
                      <p className="font-semibold text-ink">
                        {player.nickname}
                      </p>
                      <p className="text-sm text-black/45">
                        {player.isConnected ? "Connected" : "Disconnected"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-lg font-extrabold text-ink">
                      {player.score}
                    </p>
                    <button
                      type="button"
                      aria-label={`Kick ${player.nickname}`}
                      onClick={() =>
                        snapshot &&
                        socket.emit("host:kickPlayer", {
                          code: snapshot.code,
                          playerId: player.id,
                        })
                      }
                      className="inline-flex items-center justify-center rounded-full border border-hot/20 bg-hot/8 p-2 text-hot transition hover:bg-hot/15"
                    >
                      <UserRoundX className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </GlowPanel>
        </div>
      </div>
    </Shell>
  );
}
