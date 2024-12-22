import ReactFullpage from "@fullpage/react-fullpage";

const ContentPage = () => {
  return (
    <ReactFullpage
      scrollingSpeed={700}
      sectionsColor={["#282c34", "#ff5f45", "#0798ec"]}
      render={({ state, fullpageApi }) => (
        <div>
          <div className="section">Welcome to 10th KL Boys' Brigade</div>
          <div className="section">Our Mission</div>
          <div className="section">Join Us Today</div>
        </div>
      )}
    />
  );
};

export default ContentPage;
