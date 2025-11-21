import React, { useEffect } from "react";
import Joyride, { STATUS } from "@list-labs/react-joyride";
import useTourStore from "../../stores/useTourStore";
import { createBundleTourSteps } from "./tourSteps.jsx";

export default function CreateBundleTour({ autoStart = false }) {
  const tourId = "createBundle";
  const { isTourActive, completedTours, startTour, completeTour, skipTour } =
    useTourStore();

  const isCompleted = completedTours[tourId] === true;

  useEffect(() => {
    if (autoStart && !isCompleted) {
      setTimeout(() => {
        startTour(tourId);
      }, 1000);
    }
  }, [autoStart, isCompleted, startTour, tourId]);

  const handleJoyrideCallback = (data) => {
    const { status } = data;

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      if (status === STATUS.FINISHED) {
        completeTour(tourId);
      } else {
        skipTour();
      }
    }
  };

  if (!isTourActive) return null;

  return (
    <Joyride
      steps={createBundleTourSteps}
      run={isTourActive}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      scrollToFirstStep
      scrollOffset={100}
      disableOverlayClose
      disableCloseOnEsc={false}
      spotlightClicks={false}
      disableScrolling={false}
      hideCloseButton={false}
      locale={{
        back: "السابق",
        close: "إغلاق",
        last: "إنهاء",
        next: "التالي",
        open: "فتح",
        skip: "تخطي",
      }}
      floaterProps={{
        disableAnimation: false,
        disableFlip: true,
        hideArrow: false,
        offset: 15,
        styles: {
          arrow: {
            length: 10,
            spread: 20,
          },
          floater: {
            filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))",
          },
        },
      }}
      disableScrollParentFix
      styles={{
        options: {
          arrowColor: "#fff",
          backgroundColor: "#fff",
          primaryColor: "#000",
          textColor: "#333",
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: 12,
          padding: 20,
          fontSize: 14,
          maxWidth: 400,
        },
        spotlight: {
          borderRadius: 8,
        },
        buttonNext: {
          backgroundColor: "#000",
          color: "#fff",
          borderRadius: 8,
          padding: "8px 16px",
          fontSize: 14,
          fontWeight: 500,
        },
        buttonBack: {
          color: "#666",
          marginRight: 10,
        },
        buttonSkip: {
          color: "#999",
        },
      }}
    />
  );
}
