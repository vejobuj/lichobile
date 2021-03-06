var utils = require('../../utils');

function renderBackwardButton(ctrl, curPly) {
  var prevPly = curPly - 1;
  var enabled = curPly !== prevPly && prevPly >= 1;
  return m('button.game_action[data-icon=I]', {
    config: utils.ontouchend(function() {
      var ply = ctrl.active ? ctrl.ply : ctrl.root.data.game.moves.length;
      ctrl.jump(ply - 1);
    }),
    class: utils.classSet({
      disabled: ctrl.broken || !enabled
    })
  });
}

function renderForwardButton(ctrl, curPly, nbMoves) {
  var nextPly = curPly + 1;
  var enabled = curPly !== nextPly && nextPly <= nbMoves;
  return m('button.game_action[data-icon=H]', {
    config: utils.ontouchend(function() {
      var ply = ctrl.active ? ctrl.ply : ctrl.root.data.game.moves.length;
      ctrl.jump(ply + 1);
    }),
    class: utils.classSet({
      disabled: ctrl.broken || !enabled
    })
  });
}

module.exports.renderButtons = function(ctrl) {
  var nbMoves = ctrl.root.data.game.moves.length;
  var curPly = ctrl.active ? ctrl.ply : nbMoves;
  return [
    renderBackwardButton(ctrl, curPly),
    renderForwardButton(ctrl, curPly, nbMoves)
  ];
};
