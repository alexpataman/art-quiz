import './css/main';

import Layout from './js/Layout';
import Game from './js/Game';
import Settings from './js/Settings';
import Test from './js/Test';

const layout = new Layout();
const settings = new Settings();
const game = new Game();
const test = new Test();

//test.question('artist');
test.question('pictures');

export { layout, game, settings };
