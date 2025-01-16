import React from 'react';
import { render, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import MediaPipeControls from './MediaPipeControls';

// Mock the external libraries
jest.mock('@mediapipe/hands', () => ({
  Hands: jest.fn().mockImplementation(() => ({
    setOptions: jest.fn(),
    onResults: jest.fn(),
    send: jest.fn(),
    close: jest.fn()
  })),
  HAND_CONNECTIONS: []
}));

jest.mock('@mediapipe/camera_utils', () => ({
  Camera: jest.fn().mockImplementation(() => ({
    start: jest.fn(),
    stop: jest.fn()
  }))
}));

jest.mock('@mediapipe/drawing_utils', () => ({
  drawConnectors: jest.fn(),
  drawLandmarks: jest.fn()
}));

describe('MediaPipeControls Gesture Detection Edge Case', () => {
  let mockOnPlayPause, mockOnNext, mockOnPrevious;
  
  beforeEach(() => {
    // Reset mocks before each test
    mockOnPlayPause = jest.fn();
    mockOnNext = jest.fn();
    mockOnPrevious = jest.fn();
  });

  test('Gesture detection should have a slight delay between repeated gestures', () => {
    const playPauseLandmarks = Array(21).fill().map((_, index) => {
      // Simulate a closed fist
      if (index === 4) return { x: 0.5, y: 0.6 }; // thumb
      if ([8, 12, 16, 20].includes(index)) return { y: 0.7 }; // fingertips below base
      return { y: 0.5 };
    });

    // Render the component
    const { unmount } = render(
      <MediaPipeControls 
        onPlayPause={mockOnPlayPause}
        onNext={mockOnNext}
        onPrevious={mockOnPrevious}
        isPlaying={false}
        hasPlayedInitially={false}
        setHasPlayedInitially={() => {}}
      />
    );

    // Simulate multiple rapid gesture detections
    act(() => {
      // First gesture detection
      const handsInstance = require('@mediapipe/hands').Hands.mock.instances[0];
      const onResultsCallback = handsInstance.onResults.mock.calls[0][0];
      
      onResultsCallback({
        multiHandLandmarks: [playPauseLandmarks],
        image: {}
      });
    });

    // Verify first gesture was processed
    expect(mockOnPlayPause).toHaveBeenCalledTimes(1);

    // Simulate an immediate second gesture
    act(() => {
      const handsInstance = require('@mediapipe/hands').Hands.mock.instances[0];
      const onResultsCallback = handsInstance.onResults.mock.calls[0][0];
      
      onResultsCallback({
        multiHandLandmarks: [playPauseLandmarks],
        image: {}
      });
    });

    // The second gesture should NOT trigger due to cooldown
    expect(mockOnPlayPause).toHaveBeenCalledTimes(1);

    // Cleanup
    unmount();
  });
});