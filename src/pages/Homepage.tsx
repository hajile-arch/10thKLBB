import { useEffect, useState } from "react";
import Content from "../components/Homepage/Content";
import Scrollbar from "../components/Homepage/Scrollbar";
// import { getUserSession } from "../services/get_session";
// import { readProfile } from "../services/profile";
// import { ProfileType } from "../types";
// import supabase from "../utils/supabase";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Home = () => {

  return (
    <>
      {/* Success Modal */}
      <ToastContainer />

      <div className="h-screen flex relative w-screen">
        <Scrollbar />
        <Content />
      </div>
    </>
  );
};

export default Home;
