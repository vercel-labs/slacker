import Modal from "./modal";
import {
  useRef,
  useEffect,
  useState,
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
} from "react";

const VideoModal = ({
  showVideoModal,
  setShowVideoModal,
}: {
  showVideoModal: boolean;
  setShowVideoModal: Dispatch<SetStateAction<boolean>>;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (showVideoModal) videoRef.current?.focus();
  }, [showVideoModal]);

  return (
    <Modal showModal={showVideoModal} setShowModal={setShowVideoModal}>
      <video
        ref={videoRef}
        className="w-11/12 max-w-screen-xl aspect-video overflow-hidden shadow-xl rounded-2xl object-fill"
        autoPlay
        controls
        src="/assets/demo.mp4"
        poster="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAABIpJREFUWEeNV4tynEYQ3F24L04sWYKzLSfKT/tYUv2YfSA5FakoDuqge3p6Hpf3P76cyX9nykkXOVV8zriOI/Ez/toD7Q6eiCfxma/wt7Ov9ayv2hfylQBf1YCTiPiYwTtt43USwiJwA8zxSXfNLnUCBNVjBJyi10OnXzxIRj1Cl/kcSnwWuV+Et+5/Pvl9fjzjXBqBZCIfCFwTd8aNINRVaJ/47jERGQSeHXhIo+hBAuApF8XoxI75lyFw57yce7Ii/s9IkMr+5euFgIBzLikVkyCZwVl84uQ/CcSBO2e1S00Vp3g2nDFc5/3ptRHIjjjAeQYZEKEKYSRCp0QwgIJENXhcB8FQXd4ShyEV+/M2ECiMHIA6Fp1DkW5eg3bgs4qAzlKF/z1nTm1Pp1LwfBcxgxQDl0UEeE1SiB6pcUSMPAB9rocJiASPRiKqSEo2M25fv52KUFIDsAB48RGE/B1mwsaboq5HqocIVBOrFxVk7osC28sP3hcBgJa0lJUEloFEgQL2AF4jsylyAR+pmkR1OkiAh3ypPiIFmBm8b3t94/0W/bISeFlBQJ+lSkmFKrj0+GJHTAIPEjkOE5lICNy5JgeVNghsP0/mtmRKH8DraiKhxAcCNl0AHiJQj0c6qIRSIRVmBcZU5G37Sx4okL6kBcDrmkBgpRKr7i9WQN1HLqfplPuDBB5SAJ9rTYcrQl6ACtHSeznmbf/bJgSIFCB4IwElBgJMgXpAJ/BIx8PRk4QI8KAKocDY7iMF+3tXYAF4ELilG9VYpAR90BvRaEBGDOCHwEXgoAJTCkKFoRrydn+nB2AyKbCm2y0UuInQhQA83HrAKP/jlwmEGU0gnanGpG3gnhLb/R9WAQlcol+DyH8q8DF6KCEPHCzDnoJehionVMFEAJEjBbdBBZsxUuBGFApIfkT8q6Wgl6MUqBpb3in61OWdDwosa0Lkt/XGM+QHKXmg9KWsNaFw/+iB3gtmD7gNRytG9e37+wk5wgPh/u4DkVAzUiNCK24KsAxtvGZCG9BlqJnQy1Av8WwRAXuA0fYSVBX8XwJjGUKBKMNhIo4GtAp5Rx9gJ1StTz2AZDwTpjKMPgCQAI5mhOh7J4xZ0PaAgQRx9086YSeBElQjwpDCLKB0MeU4gDCMogMCHJ5Q9EyTW3G4PqSPkZx3zwLmmB3PUVN6NSINpJwK9gKWr6ccZe5TUJEPw6jG5tS3IpZe80BK+f76JhPmIKBm1OZAG0baEycCaLNBwsCYBRzRzYAGb8uMx3r0ARJwI2rdMIbQtBOMD8acHwg0In0h0Wo2EpDzexqgwMsPVQEUYBoked8HtCFpRxyXUkxDdLlIg85z9J2A1rkLATSi+8v3eSHBTuBNCCS0nrkJMXeKSOYa1q8ou7acxm+Ftv15pxx6AO7ch50wFOBiEusYwWXCMI/biiZdjFwAt32wr+ZqwFJOKqCbKhBeiwDSolWcLTcUaB0QKfgNgWZElV2F8/17IfIf8IRuaWgE7m0lAwl6IGSfNmP9PogfNz0F8sGc+/htMP5Elw7cK4cfOf8CzsEZUbNybRAAAAAASUVORK5CYII="
        tabIndex={showVideoModal ? 0 : -1}
        aria-label="Slacker Introduction Video"
      />
    </Modal>
  );
};

export function useVideoModal() {
  const [showVideoModal, setShowVideoModal] = useState(false);

  const VideoModalCallback = useCallback(() => {
    return (
      <VideoModal
        showVideoModal={showVideoModal}
        setShowVideoModal={setShowVideoModal}
      />
    );
  }, [showVideoModal, setShowVideoModal]);

  return useMemo(
    () => ({ setShowVideoModal, VideoModal: VideoModalCallback }),
    [setShowVideoModal, VideoModalCallback]
  );
}
