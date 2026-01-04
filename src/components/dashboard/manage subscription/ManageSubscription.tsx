import React from "react";

const ManageSubscription: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-md">
        <h1 className="text-xl font-semibold text-gray-800">
          Manage Subscription
        </h1>
        <p className="mt-2 text-gray-600">
          This is a placeholder page for managing subscriptions.
        </p>
        <div className="mt-4">
          <button className="rounded-md bg-blue-600 px-4 py-2 text-white">
            Upgrade Plan
          </button>
          <button className="ml-2 rounded-md bg-red-600 px-4 py-2 text-white">
            Cancel Subscription
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageSubscription;
