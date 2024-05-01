import Layout from "../components/Layout";
import MenheraButton from "../components/MenheraButton";

export type ErrorPageProps = {
  code?: number;
};

export default function ErrorPage(props: ErrorPageProps) {
  return (
    <Layout>
      <p className="page-title page-title-fix-home page-title-critical">
        error
      </p>

      <div className="menhera-div">
        <div className="error-frame menhera-div">
          <img
            src="/assets/img/menhera_loading.gif"
            alt="Confused Menhera-chan, with a spinning loading circle on top of her head."
            width={64}
            height={64}
          />
          <p>oops..</p>
          <MenheraButton text="return to home" href="/" smol />
        </div>
      </div>
    </Layout>
  );
}
