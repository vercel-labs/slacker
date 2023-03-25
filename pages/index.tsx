import SlackButton from "@/components/slack-button";
import Layout from "@/components/layout";
import { Play } from "lucide-react";
import { useVideoModal } from "@/components/video-modal";
import va from "@vercel/analytics";
import Balancer from "react-wrap-balancer";

export default function Home() {
  const { setShowVideoModal, VideoModal } = useVideoModal();
  return (
    <Layout>
      <VideoModal />
      <div className="text-center max-w-sm sm:max-w-xl space-y-4">
        <h1 className="my-8 bg-gradient-to-br from-white via-white to-[#532a01] bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-7xl">
          <Balancer ratio={0.6}>Stay on top of your HN mentions</Balancer>
        </h1>
        <p className="sm:text-lg text-gray-300">
          Slacker notifies you on Slack whenever your company is mentioned on
          Hacker News. Built with{" "}
          <a
            href="https://vercel.com/blog/cron-jobs"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-br from-[#faddae] hover:from-[#f8eaca] to-[#d2ab6b] hover:to-[#dabb92] text-transparent bg-clip-text transition-all"
          >
            Vercel Cron Jobs
          </a>
          .
        </p>
      </div>

      <div className="relative my-10">
        <button
          onClick={() => setShowVideoModal(true)}
          className="group flex justify-center items-center absolute z-10 w-[350px] h-[350px] sm:w-[500px] sm:h-[500px] rounded-full hover:backdrop-blur-sm hover:bg-black/20 transition-all overflow-hidden"
        >
          <div className="flex justify-center items-center w-14 h-14 rounded-full bg-white shadow-lg">
            <Play size={20} fill="#27272A" aria-hidden="true" />
          </div>
          <p className="font-mono text-white absolute -bottom-10 group-hover:bottom-5 transition-all ease-in-out duration-300">
            <span className="sr-only">Play Video. Length of Video is</span> 1:03
          </p>
        </button>
        <video
          autoPlay
          loop
          muted
          src="/assets/demo-preview.mp4"
          className="w-[350px] h-[350px] sm:w-[500px] sm:h-[500px] rounded-full object-cover"
          tabIndex={-1}
          aria-label="Looping video preview"
        />
      </div>
      <div className="flex flex-col text-center space-y-2">
        <SlackButton
          onClick={() => va.track("Install Clicked")}
          text="Add to Slack"
          url={`https://slack.com/oauth/v2/authorize?scope=chat:write,chat:write.public,links:read,links:write,commands,team:read&client_id=${process.env.NEXT_PUBLIC_SLACK_CLIENT_ID}`}
        />
        <a
          href="https://github.com/vercel-labs/slacker#deploy-your-own"
          className="text-gray-400 hover:text-gray-200 text-sm"
          target="_blank"
          rel="noopener noreferrer"
        >
          Looking to self-host instead?
        </a>
      </div>
    </Layout>
  );
}
