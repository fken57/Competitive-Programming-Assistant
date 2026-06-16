
import {Caption} from '../components/Home/caption'
import { HomepageContentChoose } from '../components/Home/HomepageChoose';

function Home() {
  return (
    <main className="home-page">
      <section className="home-hero">
        <Caption />
        <HomepageContentChoose />
      </section>
    </main>
  );
}

export default Home;
