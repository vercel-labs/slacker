import SlackButton from "@/components/slack-button";
import Layout from "@/components/layout";
import { Play } from "lucide-react";
import { useVideoModal } from "@/components/video-modal";

export default function Home() {
  const { setShowVideoModal, VideoModal } = useVideoModal();
  return (
    <Layout>
      <VideoModal />
      <div className="text-center max-w-sm sm:max-w-lg space-y-4">
        <h1 className="my-8 bg-gradient-to-br from-white via-white to-[#532a01] bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-7xl">
          Stay on top of your mentions
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
          className="group flex justify-center items-center absolute z-10 w-[350px] h-[350px] sm:w-[500px] sm:h-[500px] rounded-full hover:backdrop-blur-sm hover:bg-black/20 focus:outline-none focus:ring-0 transition-all overflow-hidden"
        >
          <div className="flex justify-center items-center w-14 h-14 rounded-full bg-white shadow-lg">
            <Play size={20} fill="#27272A" />
          </div>
          <p className="font-mono text-white absolute -bottom-10 group-hover:bottom-5 transition-all ease-in-out duration-300">
            1:03
          </p>
        </button>
        <video
          autoPlay
          loop
          muted
          src="/assets/demo-preview.mp4"
          poster="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAABIpJREFUWEeNV4tynEYQ3F24L04sWYKzLSfKT/tYUv2YfSA5FakoDuqge3p6Hpf3P76cyX9nykkXOVV8zriOI/Ez/toD7Q6eiCfxma/wt7Ov9ayv2hfylQBf1YCTiPiYwTtt43USwiJwA8zxSXfNLnUCBNVjBJyi10OnXzxIRj1Cl/kcSnwWuV+Et+5/Pvl9fjzjXBqBZCIfCFwTd8aNINRVaJ/47jERGQSeHXhIo+hBAuApF8XoxI75lyFw57yce7Ii/s9IkMr+5euFgIBzLikVkyCZwVl84uQ/CcSBO2e1S00Vp3g2nDFc5/3ptRHIjjjAeQYZEKEKYSRCp0QwgIJENXhcB8FQXd4ShyEV+/M2ECiMHIA6Fp1DkW5eg3bgs4qAzlKF/z1nTm1Pp1LwfBcxgxQDl0UEeE1SiB6pcUSMPAB9rocJiASPRiKqSEo2M25fv52KUFIDsAB48RGE/B1mwsaboq5HqocIVBOrFxVk7osC28sP3hcBgJa0lJUEloFEgQL2AF4jsylyAR+pmkR1OkiAh3ypPiIFmBm8b3t94/0W/bISeFlBQJ+lSkmFKrj0+GJHTAIPEjkOE5lICNy5JgeVNghsP0/mtmRKH8DraiKhxAcCNl0AHiJQj0c6qIRSIRVmBcZU5G37Sx4okL6kBcDrmkBgpRKr7i9WQN1HLqfplPuDBB5SAJ9rTYcrQl6ACtHSeznmbf/bJgSIFCB4IwElBgJMgXpAJ/BIx8PRk4QI8KAKocDY7iMF+3tXYAF4ELilG9VYpAR90BvRaEBGDOCHwEXgoAJTCkKFoRrydn+nB2AyKbCm2y0UuInQhQA83HrAKP/jlwmEGU0gnanGpG3gnhLb/R9WAQlcol+DyH8q8DF6KCEPHCzDnoJehionVMFEAJEjBbdBBZsxUuBGFApIfkT8q6Wgl6MUqBpb3in61OWdDwosa0Lkt/XGM+QHKXmg9KWsNaFw/+iB3gtmD7gNRytG9e37+wk5wgPh/u4DkVAzUiNCK24KsAxtvGZCG9BlqJnQy1Av8WwRAXuA0fYSVBX8XwJjGUKBKMNhIo4GtAp5Rx9gJ1StTz2AZDwTpjKMPgCQAI5mhOh7J4xZ0PaAgQRx9086YSeBElQjwpDCLKB0MeU4gDCMogMCHJ5Q9EyTW3G4PqSPkZx3zwLmmB3PUVN6NSINpJwK9gKWr6ccZe5TUJEPw6jG5tS3IpZe80BK+f76JhPmIKBm1OZAG0baEycCaLNBwsCYBRzRzYAGb8uMx3r0ARJwI2rdMIbQtBOMD8acHwg0In0h0Wo2EpDzexqgwMsPVQEUYBoked8HtCFpRxyXUkxDdLlIg85z9J2A1rkLATSi+8v3eSHBTuBNCCS0nrkJMXeKSOYa1q8ou7acxm+Ftv15pxx6AO7ch50wFOBiEusYwWXCMI/biiZdjFwAt32wr+ZqwFJOKqCbKhBeiwDSolWcLTcUaB0QKfgNgWZElV2F8/17IfIf8IRuaWgE7m0lAwl6IGSfNmP9PogfNz0F8sGc+/htMP5Elw7cK4cfOf8CzsEZUbNybRAAAAAASUVORK5CYII="
          className="w-[350px] h-[350px] sm:w-[500px] sm:h-[500px] rounded-full object-cover"
        />
      </div>
      <div className="flex flex-col text-center space-y-2">
        <SlackButton
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
