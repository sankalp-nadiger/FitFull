import React, { useState } from "react";

const Auth = () => {
  const [segment1Visible, setSegment1Visible] = useState(true);
  const [segment2Visible, setSegment2Visible] = useState(false);

  return (
    <div className="p-4 space-y-4">
      {segment1Visible && (
        <div className="bg-blue-200 p-4 rounded-lg">
          <p>Segment 1 content here...</p>
          <button
            onClick={() => {
              setSegment1Visible(false);
              setSegment2Visible(true);
            }}
            className="mt-2 p-2 bg-blue-500 text-white rounded"
          >
            Toggle to Segment 2
          </button>
        </div>
      )}

      {segment2Visible && (
        <div className="bg-green-200 p-4 rounded-lg">
          <p>Segment 2 content here...</p>
          <button
            onClick={() => {
              setSegment2Visible(false);
              setSegment1Visible(true);
            }}
            className="mt-2 p-2 bg-green-500 text-white rounded"
          >
            Toggle to Segment 1
          </button>
        </div>
      )}
    </div>
  );
};

export default Auth;
