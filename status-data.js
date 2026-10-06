/*
  Hinoko Labs ステータス

  障害が起きたら、下の incidents に1行追加するだけです。
    product : 'Homu' または 'Homu Pochi'
    level   : 'degraded'（一部に影響） / 'down'（停止） / 'maintenance'（メンテナンス）
    title   : 内容（短く）
    start   : 開始日時（日本時間 'YYYY-MM-DD HH:mm'）
    end     : 復旧日時。対応中なら '' のままにします。

  例:
    { product: 'Homu', level: 'degraded', title: '応答が遅くなっています', start: '2026-10-06 14:20', end: '' },

  復旧したら、その行の end に日時を入れてください。行は残しておくと履歴に表示されます。
*/
window.HINOKO_STATUS = {
  products: ['Homu', 'Homu Pochi'],
  incidents: [
    { product: 'Homu Pochi', level: 'down', title: '大規模な攻撃を受け、仮想マシンが正常に動作していません', start: '2026-10-06 20:25', end: '' },
  ],
};
