import 'materialize-css/dist/js/materialize';
import './css/main';

import Layout from './js/Layout';
import Game from './js/Game';
import Settings from './js/Settings';
import Test from './js/Test';

const layout = new Layout();
const settings = new Settings();
const game = new Game();
const test = new Test();

test.question('artist');
//test.question('pictures');
//test.quiz('artist');

// document.addEventListener('DOMContentLoaded', function () {
//   let elems = document.querySelectorAll('.modal');
//   let options = { endingTop: '50%' };
//   let instances = M.Modal.init(elems, options);
// });

// window.addEventListener('DOMContentLoaded', () => {
//   let modal = document.getElementById('modal');
//   let instance = M.Modal.getInstance(modal);
//   instance.open();
//   console.log('1');
// });

export { layout, game, settings };
