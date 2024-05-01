import Layout from "../components/Layout";

const aboutMe = {
  discord_user: 222069018507345921n,
  fedi_link: "https://lethallava.land/@nakoyasha",
  twitter_handle: "@nakoyasha",
  github_handle: "nakoyasha",
};

export default function HomePage() {
  return (
    <Layout>
      <p className="page-title page-title-fix-home">home</p>
      <div className="menhera-div flex-padding-15">
        <img
          src="/assets/img/emoji/blobcatcozy.webp"
          width="90"
          height="90"
          alt="Cat version of Google's blob emojis, wrapped up in a cozy blanket."
        />
        <div className="about-me-div make-bold-tag-fancy-pls">
          <div>
            <p>
              hello !! i'm <b>haruka!</b>
            </p>
            <p>
              im really passionate about game dev, programming and reverse
              engineering!
            </p>
            <p>although i suck at all three.</p>
            <br />
            <p>
              i usually use <b>typescript</b> or <b>lua/luau</b> for my projects
            </p>
            <p>but ocassionally tinker around in other languages as well</p>
            <p>
              such as <b>c#</b>, <b>c++</b> and <b>🦀rust</b>
            </p>
            <br />
          </div>

          <div className="about-me-links gotham-font">
            links -
            <a className="ourple-link" href="/blog">
              {" "}
              /blog{" "}
            </a>
            <a className="ourple-link" href="/projects">
              {" "}
              /projects{" "}
            </a>
            <a className="ourple-link" href="/trackers">
              {" "}
              /trackers{" "}
            </a>
            <div className="about-me-links gotham-font">
              socials -
              <a className="ourple-link" href={aboutMe.fedi_link}>
                {" "}
                fedi{" "}
              </a>
              <a
                className="ourple-link"
                href={"https://twitter.com/" + aboutMe.twitter_handle}
              >
                xitter (aka twitter)
              </a>
              <a
                className="ourple-link"
                href={"https://discord.com/users/" + aboutMe.discord_user}
              >
                discord
              </a>
              <a
                className="ourple-link"
                href={"https://github.com/" + aboutMe.github_handle}
              >
                github
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
