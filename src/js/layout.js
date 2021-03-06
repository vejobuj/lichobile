var utils = require('./utils');
var menu = require('./menu');

function headerHeight() {
  var d = utils.getViewportDims();
  return (d.vh - d.vw) / 2;
}

/**
 * Main layout function
 *
 * @param {Object} ctrl Module's controller instance
 * @param {function} headerView A function that returns an array of m()
 * @param {function} contentView A function that returns a m()
 * @param {function} footerView A function that returns an array of m()
 * @param {function} menuView A function that returns an array of m()
 * @param {function} overlayView A function that returns an array of m()
 */
module.exports = function(ctrl, headerView, contentView, footerView, menuView, overlayView) {
  return [
    m('main', { class: menu.isOpen ? 'out' : '' }, [
      m('header', { style: { height: headerHeight() + 'px' }}, headerView()),
      contentView(),
      m('footer', { style: { height: headerHeight() + 'px' }}, footerView())
    ]),
    m('aside', menuView()),
    overlayView()
  ];
};
