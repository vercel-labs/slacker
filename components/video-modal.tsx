import Modal from "./modal";
import {
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
  return (
    <Modal showModal={showVideoModal} setShowModal={setShowVideoModal}>
      <video
        className="w-11/12 overflow-hidden shadow-xl rounded-2xl"
        autoPlay
        controls
        src="/assets/demo.mp4"
        poster="data:image/gif,AAAA"
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
