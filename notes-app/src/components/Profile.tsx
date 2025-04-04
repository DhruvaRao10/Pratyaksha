import React from "react";
import UploadForm from "./uploadForm"; 

const Profile = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-4">Profile Page</h1>
      <UploadForm />
    </div>
  );
};

export default Profile;
