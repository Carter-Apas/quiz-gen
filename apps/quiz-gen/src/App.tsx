import { Link, Route, Routes } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { GlowPanel, Shell } from "./components/ui";
import { HostScreen } from "./features/host/HostScreen";
import { PlayerScreen } from "./features/player/PlayerScreen";

function LandingCard(props: {
  title: string;
  body: string;
  to: string;
  accent: string;
}) {
  return (
    <Link to={props.to}>
      <GlowPanel className="group h-full overflow-hidden transition hover:-translate-y-1">
        <div
          className={`mb-8 h-28 rounded-[26px] border border-black/6 ${props.accent}`}
        />
        <h2 className="font-display text-3xl font-extrabold text-ink">
          {props.title}
        </h2>
        <p className="mt-3 max-w-sm text-black/55">{props.body}</p>
        <div className="mt-8 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-accent">
          Enter
          <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </div>
      </GlowPanel>
    </Link>
  );
}

function LandingPage() {
  return (
    <Shell className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-10">
        <div className="max-w-4xl space-y-5">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-black/45">
            Quiz Forge
          </p>
          <h1 className="mt-4 max-w-4xl font-display text-5xl font-extrabold text-ink sm:text-7xl">
            Clean realtime trivia, generated from a single prompt.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-black/58">
            Start a lobby, choose the quiz length, let OpenAI generate the
            questions, and have everyone join from their phones with a room
            code.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <LandingCard
            title="Host a lobby"
            body="Write the topic, pick the number of questions, and control the session from one clean host screen."
            to="/host"
            accent="bg-gradient-to-br from-[rgba(58,72,105,0.16)] via-[rgba(110,128,170,0.10)] to-white"
          />
          <LandingCard
            title="Join a lobby"
            body="Enter the code, pick a nickname, and answer quickly from your own phone."
            to="/play"
            accent="bg-gradient-to-br from-[rgba(110,128,170,0.14)] via-[rgba(58,135,96,0.10)] to-white"
          />
        </div>
      </div>
    </Shell>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/host" element={<HostScreen />} />
      <Route path="/play" element={<PlayerScreen />} />
    </Routes>
  );
}
