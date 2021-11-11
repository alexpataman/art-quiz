import './css/main';

import Layout from './js/Layout';
import Game from './js/Game';
import Settings from './js/Settings';

const layout = new Layout();
const settings = new Settings();
const game = new Game();

export { layout, game, settings };
