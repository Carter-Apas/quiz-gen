import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Smartphone } from "lucide-react";
import type { LobbySnapshot } from "../shared/types";
import { getSocket, type ClientSocketLike } from "../../lib/socket";
import { Leaderboard } from "../../components/Leaderboard";
import {
  GlowPanel,
  AccentButton,
  SectionLabel,
  Shell,
} from "../../components/ui";
import { TimerBar } from "../../components/TimerBar";

type PlayerScreenProps = {
  socket?: ClientSocketLike;
};

export function PlayerScreen({ socket = getSocket() }: PlayerScreenProps) {
  const [code, setCode] = useState("");
  const [nickname, setNickname] = useState("");
  const [snapshot, setSnapshot] = useState<LobbySnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleSnapshot = (nextSnapshot: LobbySnapshot) => {
      setError(null);
      setSnapshot(nextSnapshot);
    };
    const handleError = (payload: { message: string }) =>
      setError(payload.message);
    const handleKicked = () => {
      setSnapshot(null);
      setError("You were removed from the lobby.");
    };

    socket.connect();
    socket.on("lobby:snapshot", handleSnapshot);
    socket.on("lobby:error", handleError);
    socket.on("player:kicked", handleKicked);

    return () => {
      socket.off("lobby:snapshot", handleSnapshot);
      socket.off("lobby:error", handleError);
      socket.off("player:kicked", handleKicked);
      socket.disconnect();
    };
  }, [socket]);

  useEffect(() => {
    if (!snapshot?.me || !snapshot.code) {
      return;
    }

    const handlePageHide = () => {
      socket.emit("player:leaveLobby", { code: snapshot.code });
      socket.disconnect();
    };

    window.addEventListener("pagehide", handlePageHide);
    return () => {
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [snapshot?.code, snapshot?.me, socket]);

  const isJoined = Boolean(snapshot?.me);
  const currentQuestion = snapshot?.currentQuestion;
  const showCorrectCelebration =
    snapshot?.status === "question_result" &&
    snapshot.me?.answerWasCorrect === true;
  const isQuestionVisible =
    Boolean(currentQuestion) &&
    ["question_live", "question_result"].includes(snapshot?.status ?? "");
  const isLeaderboardPhase = snapshot?.status === "leaderboard";
  const hasNextQuestion =
    typeof snapshot?.currentQuestionIndex === "number" &&
    snapshot.currentQuestionIndex < snapshot.totalQuestions - 1;

  return (
    <Shell className="px-4 py-6 sm:px-6 lg:px-8">
      {showCorrectCelebration ? (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-[rgba(255,255,255,0.55)]">
          <div className="animate-[check-pop_420ms_ease-out,screen-shake_320ms_ease-in-out] rounded-[32px] border border-success/18 bg-white px-10 py-9 text-center shadow-panel">
            <CheckCircle2 className="mx-auto h-20 w-20 text-success" />
            <p className="mt-4 font-display text-4xl font-extrabold text-ink">
              Correct!
            </p>
            <p className="mt-2 text-base text-black/55">
              Nice hit. Your answer landed before reveal.
            </p>
          </div>
        </div>
      ) : null}
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.9fr,1.1fr]">
        <GlowPanel className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-black/45">
                Player view
              </p>
              <h1 className="mt-3 font-display text-4xl font-extrabold text-ink sm:text-5xl">
                Join the room and answer fast.
              </h1>
            </div>
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:bg-black/[0.03]"
            >
              Back
            </Link>
          </div>

          {!isJoined ? (
            <div className="space-y-4">
              <label className="block space-y-2">
                <SectionLabel>Room code</SectionLabel>
                <input
                  aria-label="Room code"
                  value={code}
                  onChange={(event) =>
                    setCode(event.target.value.toUpperCase())
                  }
                  className="w-full rounded-[24px] border border-black/10 bg-white px-4 py-4 text-xl font-bold tracking-[0.28em] uppercase text-ink outline-none focus:border-accent/50"
                />
              </label>
              <label className="block space-y-2">
                <SectionLabel>Nickname</SectionLabel>
                <input
                  aria-label="Nickname"
                  value={nickname}
                  onChange={(event) => setNickname(event.target.value)}
                  className="w-full rounded-[24px] border border-black/10 bg-white px-4 py-4 text-lg text-ink outline-none focus:border-accent/50"
                />
              </label>
              <AccentButton
                className="w-full"
                onClick={() =>
                  socket.emit("player:joinLobby", {
                    code: code.trim(),
                    nickname: nickname.trim(),
                  })
                }
                disabled={!code.trim() || !nickname.trim()}
              >
                <Smartphone className="mr-2 h-4 w-4" />
                Join lobby
              </AccentButton>
            </div>
          ) : (
            <div className="space-y-4">
              <GlowPanel className="bg-white">
                <SectionLabel>You are in</SectionLabel>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-display text-4xl font-extrabold tracking-[0.18em] text-ink">
                      {snapshot?.code}
                    </p>
                    <p className="mt-2 text-black/55">
                      {snapshot?.me?.nickname}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm uppercase tracking-[0.18em] text-black/40">
                      Score
                    </p>
                    <p className="text-3xl font-extrabold text-ink">
                      {snapshot?.me?.score ?? 0}
                    </p>
                  </div>
                </div>
              </GlowPanel>
              {error ? (
                <div className="rounded-2xl border border-hot/25 bg-hot/8 px-4 py-3 text-sm text-hot">
                  {error}
                </div>
              ) : null}
              <p className="text-sm text-black/55">
                {snapshot?.status === "ready" ||
                snapshot?.status === "collecting"
                  ? "Waiting for the host to start the game."
                  : snapshot?.status === "leaderboard"
                    ? hasNextQuestion
                      ? "Round complete. Stand by for the next question."
                      : "Final standings are up."
                    : snapshot?.status === "finished"
                      ? "Game over. Wait for the host if they want a rematch."
                      : "Stay sharp. This round is live."}
              </p>
            </div>
          )}
        </GlowPanel>

        <div className="space-y-6">
          <GlowPanel className="space-y-5">
            {isQuestionVisible && currentQuestion ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <SectionLabel>
                      Question {snapshot!.currentQuestionIndex + 1} of{" "}
                      {snapshot!.totalQuestions}
                    </SectionLabel>
                    <h2 className="text-3xl font-extrabold text-ink">
                      {currentQuestion.prompt}
                    </h2>
                  </div>
                  {snapshot?.me?.answerLocked ? (
                    <div className="flex items-center gap-2 rounded-full bg-success/12 px-4 py-2 text-sm font-semibold text-success">
                      <CheckCircle2 className="h-4 w-4" />
                      Locked in
                    </div>
                  ) : null}
                </div>

                <TimerBar
                  startedAt={currentQuestion.startedAt}
                  endsAt={currentQuestion.endsAt}
                  isActive={snapshot?.status === "question_live"}
                />

                <div className="grid gap-3 sm:grid-cols-2">
                  {currentQuestion.options.map((option, index) => {
                    const selected =
                      snapshot?.me?.selectedAnswerIndex === index;
                    const revealedCorrect =
                      typeof currentQuestion.correctIndex === "number" &&
                      currentQuestion.correctIndex === index;

                    return (
                      <button
                        key={option}
                        onClick={() =>
                          snapshot &&
                          socket.emit("player:submitAnswer", {
                            code: snapshot.code,
                            answerIndex: index,
                          })
                        }
                        disabled={
                          snapshot?.status !== "question_live" ||
                          snapshot?.me?.answerLocked
                        }
                        className={[
                          "rounded-[24px] border px-4 py-5 text-left transition",
                          selected
                            ? "border-accent/40 bg-[rgba(58,72,105,0.06)]"
                            : "border-black/8 bg-white hover:bg-black/[0.02]",
                          revealedCorrect
                            ? "border-success/35 bg-success/10"
                            : "",
                          "text-ink",
                        ].join(" ")}
                      >
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-black/40">
                          Choice {index + 1}
                        </p>
                        <p className="mt-2 text-lg font-semibold">{option}</p>
                      </button>
                    );
                  })}
                </div>

                {currentQuestion.explanation ? (
                  <div className="rounded-[24px] border border-black/8 bg-black/[0.02] px-4 py-4">
                    <SectionLabel>Reveal</SectionLabel>
                    <p className="text-black/65">
                      {currentQuestion.explanation}
                    </p>
                    {snapshot?.me?.lastScoreAwarded !== null ? (
                      <p className="mt-3 text-sm font-semibold text-accent">
                        Score this round: {snapshot?.me?.lastScoreAwarded}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </>
            ) : isLeaderboardPhase ? (
              <div className="space-y-4">
                <SectionLabel>
                  {hasNextQuestion ? "Round results" : "Final leaderboard"}
                </SectionLabel>
                <h2 className="text-3xl font-extrabold text-ink">
                  {hasNextQuestion
                    ? "Next round in"
                    : "Final standings are in."}
                </h2>
                {hasNextQuestion ? (
                  <TimerBar
                    startedAt={snapshot?.phaseStartedAt ?? null}
                    endsAt={snapshot?.phaseEndsAt ?? null}
                    isActive
                    label="Next round in"
                  />
                ) : null}
                <p className="max-w-xl text-black/55">
                  {hasNextQuestion
                    ? "Check the leaderboard below while the next question spins up."
                    : "The leaderboard will clear and the room will move back to the waiting screen."}
                </p>
              </div>
            ) : snapshot?.status === "finished" ? (
              <div className="space-y-4">
                <SectionLabel>Waiting room</SectionLabel>
                <h2 className="text-3xl font-extrabold text-ink">
                  Waiting for the host.
                </h2>
                <p className="max-w-xl text-black/55">
                  The game is over. Stay in the lobby if you want to join the
                  next restart.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <SectionLabel>Live board</SectionLabel>
                <h2 className="text-3xl font-extrabold text-ink">
                  Ready when the room is.
                </h2>
                <p className="max-w-xl text-black/55">
                  Join the lobby, watch for the room to open, and answer as fast
                  as you can when the tiles light up.
                </p>
              </div>
            )}
          </GlowPanel>

          <GlowPanel>
            <SectionLabel>Leaderboard</SectionLabel>
            <Leaderboard
              players={snapshot?.players ?? []}
              highlightPlayerId={snapshot?.me?.id}
            />
          </GlowPanel>
        </div>
      </div>
    </Shell>
  );
}
