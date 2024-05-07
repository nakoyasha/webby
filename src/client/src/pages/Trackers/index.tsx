import Layout from "../../components/Layout";
import MenheraButton from "../../components/MenheraButton";

export default function TrackersPage() {
  return (
    <Layout isWIPFeature={true}>
      <div className="menhera-div">
        <div className="tracker-selection menhera-div">
          <p>Currently available trackers:</p>
          <div className="horizontal-list">
            <MenheraButton text="discord" href="/trackers/discord" />
            <MenheraButton
              text="veeeeeeeeeeeeeeeeeeeee"
              href="/trackers/discord"
            />
          </div>

          <h3 style={{ textAlign: "center" }}>
            Note: These trackers suck. There's usually a better alternative
            available, and you <i>really</i> should use those alternatives
            instead of this.
          </h3>
        </div>
      </div>
    </Layout>
  );
}
