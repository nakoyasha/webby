import Layout from "../../components/Layout";
import Page from "../../components/Page";

export default function AdminPage() {
  return (
    <Layout>
      <div className="center-div topbar-margin">
        <Page className="build-details">
          <h1>webby admin panel real</h1>
          <form>
            <label htmlFor="buildhash">Build to refetch</label>
            <input type="text" id="buildhash" placeholder="mastaka-ebina-yep" />
            <input type="submit" value="Refetch build!" />
          </form>

          <form>
            <label htmlFor="public-access-enabled">Public access enabled</label>
            <input type="radio" id="public-access-enabled" />
            <label htmlFor="api-access-enabled">API access enabled</label>
            <input type="radio" id="api-access-enabled" />
            <input type="submit" value="Update access" />
          </form>

          <button>Restart server</button>
        </Page>
      </div>
    </Layout>
  );
}
