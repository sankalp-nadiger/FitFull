import React from "react";
import Navbar from "../Navbar";

export default function PhysicalActivity() {
  const physicalActivities = [
    {
      name: "Morning Jog",
      description: "Start your day with a refreshing 20-minute jog.",
      id: "1",
    },
    {
      name: "Yoga Session",
      description: "Relax and improve flexibility with a 30-minute yoga session.",
      id: "2",
    },
    {
      name: "Strength Training",
      description: "Full-body workout focusing on strength and endurance.",
      id: "3",
    },
    {
      name: "Evening Walk",
      description: "Take a peaceful walk in the park to unwind.",
      id: "4",
    },
  ];

  // const handleClick = async (activityId) => {
  //   try {
  //     const response = await fetch(`http://localhost:5000/api/physical-activities/${activityId}/done`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ status: "done" }),
  //     });

  //     if (!response.ok) {
  //       throw new Error("Failed to mark physical activity as done");
  //     }

  //     alert(`Physical Activity ${activityId} marked as done!`);
  //   } catch (err) {
  //     alert(`Error: ${err.message}`);
  //   }
  // };

  return (
    <>
      <Navbar />
      <section className="text-green-400 body-font bg-gray-900">
        <div className="container px-5 py-24 mx-auto flex flex-wrap">
          {physicalActivities.map((activity, index) => (
            <div key={index} className="flex relative pb-20 sm:items-center md:w-2/3 mx-auto">
              <div className="h-full w-6 absolute inset-0 flex items-center justify-center">
                <div className="h-full w-1 bg-gray-200 pointer-events-none"></div>
              </div>
              <div className="flex-shrink-0 w-6 h-6 rounded-full mt-10 sm:mt-0 inline-flex items-center justify-center bg-green-500 text-white relative z-10 title-font font-medium text-sm">
                {index + 1}
              </div>
              <div className="flex-grow md:pl-8 pl-6 flex sm:items-center items-start flex-col sm:flex-row">
                <div className="flex-shrink-0 w-24 h-24 bg-green-100 text-green-500 rounded-full inline-flex items-center justify-center">
                  <svg
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="w-12 h-12"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                </div>
                <div className="flex-grow sm:pl-6 mt-6 sm:mt-0">
                  <h2 className="font-medium title-font text-green-700 mb-1 text-xl">
                    {activity.name}
                  </h2>
                  <p className="leading-relaxed">{activity.description}</p>
                  <button
                    className="mt-4 px-6 py-2 bg-green-500 text-white rounded-lg"
                    // onClick={() => handleClick(activity.id)}
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
